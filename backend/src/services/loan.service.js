import prisma from '../config/prisma.js';
import { AppError } from '../middlewares/error.middleware.js';
import { generatePDF } from '../utils/export.js';

export class LoanService {
  static async generateLoanCode() {
    const today = new Date();
    const prefix = `PJ-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}`;
    const count = await prisma.loan.count({
      where: {
        loanCode: { startsWith: prefix },
      },
    });
    return `${prefix}-${String(count + 1).padStart(3, '0')}`;
  }

  static async getAll({ status, borrowerType, memberId, search, page = 1, limit = 10 }) {
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};
    if (status) where.status = status;
    if (borrowerType) where.borrowerType = borrowerType;
    if (memberId) where.memberId = parseInt(memberId);

    if (search) {
      where.OR = [
        { loanCode: { contains: search } },
        { borrowerName: { contains: search } },
        { purpose: { contains: search } },
        { member: { fullName: { contains: search } } },
        { institution: { name: { contains: search } } },
      ];
    }

    const [total, loans] = await Promise.all([
      prisma.loan.count({ where }),
      prisma.loan.findMany({
        where,
        skip,
        take,
        include: {
          member: {
            include: { user: true, region: true },
          },
          institution: true,
          approvedBy: {
            select: { id: true, username: true },
          },
          loanItems: {
            include: { inventoryItem: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      data: loans,
      meta: {
        total,
        page: parseInt(page),
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  static async getById(id) {
    const loan = await prisma.loan.findUnique({
      where: { id: parseInt(id) },
      include: {
        member: {
          include: { user: true, region: true },
        },
        institution: true,
        approvedBy: {
          select: { id: true, username: true },
        },
        loanItems: {
          include: { inventoryItem: true },
        },
        statusLogs: {
          include: {
            changedBy: { select: { id: true, username: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!loan) {
      throw new AppError('Peminjaman tidak ditemukan', 404);
    }

    return loan;
  }

  static async getMemberLoans(userId, { status, page = 1, limit = 10 }) {
    const member = await prisma.member.findUnique({
      where: { userId },
    });

    if (!member) {
      return {
        data: [],
        meta: {
          total: 0,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: 0,
        },
      };
    }

    return await this.getAll({
      status,
      memberId: member.id,
      page,
      limit,
    });
  }

  // Member submits loan request
  static async createMemberRequest(userId, payload) {
    let member = await prisma.member.findUnique({
      where: { userId },
    });

    if (!member) {
      // Check if user is super admin testing the member loan flow
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user && user.role === 'SUPER_ADMIN') {
        member = await prisma.member.findFirst();
      }
      if (!member) {
        throw new AppError('Profil anggota tidak ditemukan', 404);
      }
    }

    if (member.status === 'INACTIVE') {
      throw new AppError('Akun anggota Anda tidak aktif untuk meminjam barang', 403);
    }

    const { items, startDate, endDate, purpose } = payload;
    const loanCode = await this.generateLoanCode();

    // Verify stock availability
    for (const item of items) {
      const invItem = await prisma.inventoryItem.findUnique({
        where: { id: parseInt(item.inventoryItemId) },
      });

      if (!invItem) {
        throw new AppError(`Barang dengan ID ${item.inventoryItemId} tidak ditemukan`, 404);
      }

      const requestedQty = parseInt(item.quantity) || 1;
      if (invItem.availableQuantity < requestedQty) {
        throw new AppError(`Stok '${invItem.name}' tidak mencukupi (Tersedia: ${invItem.availableQuantity}, Diminta: ${requestedQty})`, 400);
      }
    }

    return await prisma.$transaction(async (tx) => {
      const loan = await tx.loan.create({
        data: {
          loanCode,
          borrowerType: 'MEMBER',
          memberId: member.id,
          borrowerName: member.fullName,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          purpose,
          status: 'PENDING',
          loanItems: {
            create: items.map((i) => ({
              inventoryItemId: parseInt(i.inventoryItemId),
              quantity: parseInt(i.quantity) || 1,
              notes: i.notes || null,
            })),
          },
          statusLogs: {
            create: [
              {
                status: 'PENDING',
                changedById: userId,
                notes: `Pengajuan peminjaman diajukan oleh ${member.fullName}`,
              },
            ],
          },
        },
        include: {
          loanItems: { include: { inventoryItem: true } },
        },
      });

      // Create notification for Super Admin
      const admins = await tx.user.findMany({ where: { role: 'SUPER_ADMIN' } });
      for (const admin of admins) {
        await tx.notification.create({
          data: {
            userId: admin.id,
            title: 'Pengajuan Peminjaman Baru',
            message: `${member.fullName} mengajukan peminjaman ${loan.loanItems.length} jenis barang (${loan.loanCode})`,
            type: 'WARNING',
            link: '/admin/loans',
          },
        });
      }

      return loan;
    });
  }

  // Admin creates loan directly (internal, outside, or institutional)
  static async createAdminLoan(adminUserId, payload) {
    const { borrowerType, memberId, borrowerName, institutionId, items, startDate, endDate, purpose, status = 'APPROVED', deductStock = true, adminNotes } = payload;
    const loanCode = await this.generateLoanCode();

    // Check stock if deducting
    if (deductStock) {
      for (const item of items) {
        const invItem = await prisma.inventoryItem.findUnique({
          where: { id: parseInt(item.inventoryItemId) },
        });
        if (!invItem) {
          throw new AppError(`Barang dengan ID ${item.inventoryItemId} tidak ditemukan`, 404);
        }
        const requestedQty = parseInt(item.quantity) || 1;
        if (invItem.availableQuantity < requestedQty) {
          throw new AppError(`Stok '${invItem.name}' tidak mencukupi (Tersedia: ${invItem.availableQuantity}, Diminta: ${requestedQty})`, 400);
        }
      }
    }

    return await prisma.$transaction(async (tx) => {
      const loan = await tx.loan.create({
        data: {
          loanCode,
          borrowerType: borrowerType || 'MEMBER',
          memberId: memberId ? parseInt(memberId) : null,
          borrowerName,
          institutionId: institutionId ? parseInt(institutionId) : null,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          purpose,
          status,
          adminNotes,
          approvedById: adminUserId,
          loanItems: {
            create: items.map((i) => ({
              inventoryItemId: parseInt(i.inventoryItemId),
              quantity: parseInt(i.quantity) || 1,
              notes: i.notes || null,
            })),
          },
          statusLogs: {
            create: [
              {
                status,
                changedById: adminUserId,
                notes: `Peminjaman langsung dicatat oleh Super Admin`,
              },
            ],
          },
        },
        include: {
          loanItems: { include: { inventoryItem: true } },
        },
      });

      // Deduct stock if status is APPROVED or BORROWED and deductStock is true
      if (deductStock && (status === 'APPROVED' || status === 'BORROWED')) {
        for (const item of items) {
          await tx.inventoryItem.update({
            where: { id: parseInt(item.inventoryItemId) },
            data: {
              availableQuantity: {
                decrement: parseInt(item.quantity) || 1,
              },
            },
          });
        }
      }

      return loan;
    });
  }

  // Admin Approve Loan
  static async approveLoan(id, adminUserId, adminNotes) {
    const loan = await this.getById(id);

    if (loan.status !== 'PENDING') {
      throw new AppError(`Peminjaman tidak dapat disetujui karena berstatus ${loan.status}`, 400);
    }

    // Check stock availability again
    for (const item of loan.loanItems) {
      if (item.inventoryItem.availableQuantity < item.quantity) {
        throw new AppError(`Stok barang '${item.inventoryItem.name}' tidak mencukupi untuk disetujui`, 400);
      }
    }

    return await prisma.$transaction(async (tx) => {
      // 1. Update loan status
      const updated = await tx.loan.update({
        where: { id: parseInt(id) },
        data: {
          status: 'APPROVED',
          adminNotes: adminNotes || loan.adminNotes,
          approvedById: adminUserId,
        },
      });

      // 2. Reduce stock
      for (const item of loan.loanItems) {
        await tx.inventoryItem.update({
          where: { id: item.inventoryItemId },
          data: {
            availableQuantity: { decrement: item.quantity },
          },
        });
      }

      // 3. Log status
      await tx.loanStatusLog.create({
        data: {
          loanId: loan.id,
          status: 'APPROVED',
          changedById: adminUserId,
          notes: adminNotes || 'Disetujui oleh Super Admin',
        },
      });

      // 4. Notify member
      if (loan.member?.userId) {
        await tx.notification.create({
          data: {
            userId: loan.member.userId,
            title: 'Peminjaman Disetujui',
            message: `Pengajuan peminjaman Anda (${loan.loanCode}) telah disetujui. Silakan ambil barang di gudang inventaris.`,
            type: 'SUCCESS',
            link: '/member/loans',
          },
        });
      }

      return updated;
    });
  }

  // Admin Reject Loan
  static async rejectLoan(id, adminUserId, adminNotes) {
    const loan = await this.getById(id);

    if (loan.status !== 'PENDING') {
      throw new AppError(`Peminjaman tidak dapat ditolak karena berstatus ${loan.status}`, 400);
    }

    return await prisma.$transaction(async (tx) => {
      const updated = await tx.loan.update({
        where: { id: parseInt(id) },
        data: {
          status: 'REJECTED',
          adminNotes: adminNotes || 'Pengajuan peminjaman tidak disetujui',
        },
      });

      await tx.loanStatusLog.create({
        data: {
          loanId: loan.id,
          status: 'REJECTED',
          changedById: adminUserId,
          notes: adminNotes || 'Pengajuan ditolak oleh Super Admin',
        },
      });

      if (loan.member?.userId) {
        await tx.notification.create({
          data: {
            userId: loan.member.userId,
            title: 'Peminjaman Ditolak',
            message: `Pengajuan peminjaman (${loan.loanCode}) ditolak. Catatan: ${adminNotes || '-'}`,
            type: 'WARNING',
            link: '/member/loans',
          },
        });
      }

      return updated;
    });
  }

  // Admin Mark as Borrowed (Barang Diserahkan ke Peminjam)
  static async markBorrowed(id, adminUserId, notes, borrowProof = null) {
    const loan = await this.getById(id);

    if (loan.status !== 'APPROVED') {
      throw new AppError(`Hanya peminjaman berstatus Disetujui (APPROVED) yang dapat ditandai telah dipinjam`, 400);
    }

    return await prisma.$transaction(async (tx) => {
      const updated = await tx.loan.update({
        where: { id: parseInt(id) },
        data: {
          status: 'BORROWED',
          ...(borrowProof ? { borrowProof } : {}),
        },
      });

      await tx.loanStatusLog.create({
        data: {
          loanId: loan.id,
          status: 'BORROWED',
          changedById: adminUserId,
          notes: notes || 'Barang telah diserahterimakan kepada peminjam',
        },
      });

      return updated;
    });
  }

  // Mark as Returned (Barang Dikembalikan)
  static async returnLoan(id, adminUserId, { adminNotes, itemConditions, returnProof = null, userRole = 'SUPER_ADMIN' }) {
    const loan = await this.getById(id);

    if (userRole === 'ANGGOTA' && loan.member?.userId !== adminUserId) {
      throw new AppError('Anda tidak memiliki izin untuk mengembalikan peminjaman anggota lain', 403);
    }

    if (loan.status !== 'BORROWED' && loan.status !== 'APPROVED' && loan.status !== 'OVERDUE') {
      throw new AppError(`Peminjaman dengan status ${loan.status} tidak dapat dikembalikan`, 400);
    }

    return await prisma.$transaction(async (tx) => {
      // 1. Update loan status & return date
      const updated = await tx.loan.update({
        where: { id: parseInt(id) },
        data: {
          status: 'RETURNED',
          returnDate: new Date(),
          adminNotes: adminNotes || loan.adminNotes,
          ...(returnProof ? { returnProof } : {}),
        },
      });

      // 2. Restore available quantity and update condition
      for (const item of loan.loanItems) {
        let conditionAfter = 'GOOD';
        if (itemConditions && Array.isArray(itemConditions)) {
          const cond = itemConditions.find((c) => parseInt(c.inventoryItemId) === item.inventoryItemId);
          if (cond?.conditionAfter) conditionAfter = cond.conditionAfter;
        }

        await tx.loanItem.update({
          where: { id: item.id },
          data: { conditionAfter },
        });

        await tx.inventoryItem.update({
          where: { id: item.inventoryItemId },
          data: {
            availableQuantity: { increment: item.quantity },
            condition: conditionAfter, // update item condition
          },
        });
      }

      // 3. Log status
      await tx.loanStatusLog.create({
        data: {
          loanId: loan.id,
          status: 'RETURNED',
          changedById: adminUserId,
          notes: adminNotes || 'Barang telah diterima kembali di gudang inventaris',
        },
      });

      // 4. Notify member
      if (loan.member?.userId) {
        await tx.notification.create({
          data: {
            userId: loan.member.userId,
            title: 'Peminjaman Selesai',
            message: `Peminjaman barang (${loan.loanCode}) telah selesai dikembalikan. Terima kasih.`,
            type: 'INFO',
            link: '/member/loans',
          },
        });
      }

      return updated;
    });
  }

  static async delete(id) {
    const loan = await this.getById(id);

    // If deleting approved or borrowed loan, restore stock
    if (loan.status === 'APPROVED' || loan.status === 'BORROWED') {
      for (const item of loan.loanItems) {
        await prisma.inventoryItem.update({
          where: { id: item.inventoryItemId },
          data: { availableQuantity: { increment: item.quantity } },
        });
      }
    }

    return await prisma.loan.delete({
      where: { id: parseInt(id) },
    });
  }

  // Cetak Bukti Peminjaman PDF
  static async generateLoanReceipt(id) {
    const loan = await this.getById(id);

    const columns = [
      { header: 'No', key: 'no', align: 'center' },
      { header: 'Kode Barang', key: 'code', align: 'center' },
      { header: 'Nama Barang', key: 'name' },
      { header: 'Jumlah', key: 'qty', align: 'center' },
      { header: 'Kondisi Awal', key: 'condBefore', align: 'center' },
      { header: 'Catatan', key: 'notes' },
    ];

    const rows = loan.loanItems.map((item, idx) => ({
      no: idx + 1,
      code: item.inventoryItem.code,
      name: item.inventoryItem.name,
      qty: item.quantity,
      condBefore: item.conditionBefore === 'GOOD' ? 'Baik' : 'Ada Catatan',
      notes: item.notes || '-',
    }));

    const subtitle = `No. Surat: ${loan.loanCode} | Peminjam: ${loan.borrowerName} | Tgl Pinjam: ${new Date(loan.startDate).toLocaleDateString('id-ID')} s/d ${new Date(loan.endDate).toLocaleDateString('id-ID')}`;

    return await generatePDF({
      title: 'Surat Bukti Peminjaman Barang Inventaris',
      subtitle,
      columns,
      rows,
    });
  }
}

