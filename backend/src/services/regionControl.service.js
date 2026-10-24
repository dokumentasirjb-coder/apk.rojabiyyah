import prisma from '../config/prisma.js';
import { AppError } from '../middlewares/error.middleware.js';

export class RegionControlService {
  // --- Task Points ---
  static async getAllTaskPoints({ regionId, categoryId, picMemberId, search, page = 1, limit = 20 }) {
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};
    if (regionId) where.regionId = parseInt(regionId);
    if (categoryId) where.categoryId = parseInt(categoryId);
    if (picMemberId) where.picMemberId = parseInt(picMemberId);

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { address: { contains: search } },
        { categoryName: { contains: search } },
        { region: { name: { contains: search } } },
        { picMember: { fullName: { contains: search } } },
      ];
    }

    const [total, taskPoints] = await Promise.all([
      prisma.taskPoint.count({ where }),
      prisma.taskPoint.findMany({
        where,
        skip,
        take,
        include: {
          region: true,
          category: true,
          picMember: {
            include: { user: true },
          },
          _count: {
            select: { fieldReports: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      data: taskPoints,
      meta: {
        total,
        page: parseInt(page),
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  static async getTaskPointById(id) {
    const tp = await prisma.taskPoint.findUnique({
      where: { id: parseInt(id) },
      include: {
        region: true,
        category: true,
        picMember: {
          include: { user: true },
        },
        fieldReports: {
          include: {
            member: true,
            media: true,
            resolvedBy: { select: { id: true, username: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!tp) {
      throw new AppError('Titik tugas tidak ditemukan', 404);
    }

    return tp;
  }

  static async createTaskPoint(data) {
    let categoryName = data.categoryName;
    if (data.categoryId && !categoryName) {
      const cat = await prisma.category.findUnique({ where: { id: parseInt(data.categoryId) } });
      categoryName = cat?.name || null;
    }

    return await prisma.taskPoint.create({
      data: {
        name: data.name,
        regionId: parseInt(data.regionId),
        categoryId: data.categoryId ? parseInt(data.categoryId) : null,
        categoryName,
        address: data.address,
        picMemberId: data.picMemberId ? parseInt(data.picMemberId) : null,
        schedule: data.schedule,
        notes: data.notes,
      },
      include: {
        region: true,
        picMember: true,
      },
    });
  }

  static async updateTaskPoint(id, data) {
    await this.getTaskPointById(id);

    let categoryName = data.categoryName;
    if (data.categoryId && !categoryName) {
      const cat = await prisma.category.findUnique({ where: { id: parseInt(data.categoryId) } });
      categoryName = cat?.name || null;
    }

    const updateData = {};
    if (data.name) updateData.name = data.name;
    if (data.regionId) updateData.regionId = parseInt(data.regionId);
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId ? parseInt(data.categoryId) : null;
    if (categoryName !== undefined) updateData.categoryName = categoryName;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.picMemberId !== undefined) updateData.picMemberId = data.picMemberId ? parseInt(data.picMemberId) : null;
    if (data.schedule !== undefined) updateData.schedule = data.schedule;
    if (data.notes !== undefined) updateData.notes = data.notes;

    return await prisma.taskPoint.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        region: true,
        picMember: true,
      },
    });
  }

  static async deleteTaskPoint(id) {
    await this.getTaskPointById(id);
    return await prisma.taskPoint.delete({
      where: { id: parseInt(id) },
    });
  }

  // --- Field Reports ---
  static async getFieldReports({ regionId, status, isResolved, taskPointId, memberId, startDate, endDate, page = 1, limit = 15 }) {
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};
    if (status) where.status = status;
    if (isResolved !== undefined) {
      where.isResolved = isResolved === 'true' || isResolved === true;
    }
    if (taskPointId) where.taskPointId = parseInt(taskPointId);
    if (memberId) where.memberId = parseInt(memberId);
    if (regionId) where.taskPoint = { regionId: parseInt(regionId) };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [total, reports] = await Promise.all([
      prisma.fieldReport.count({ where }),
      prisma.fieldReport.findMany({
        where,
        skip,
        take,
        include: {
          taskPoint: {
            include: { region: true, category: true },
          },
          member: true,
          media: true,
          resolvedBy: { select: { id: true, username: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      data: reports,
      meta: {
        total,
        page: parseInt(page),
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  static async createFieldReport(userId, payload, files = []) {
    const member = await prisma.member.findUnique({
      where: { userId },
    });

    if (!member) {
      throw new AppError('Profil anggota tidak ditemukan', 404);
    }

    const { taskPointId, status, description } = payload;

    const taskPoint = await prisma.taskPoint.findUnique({
      where: { id: parseInt(taskPointId) },
      include: { region: true },
    });

    if (!taskPoint) {
      throw new AppError('Titik tugas tidak ditemukan', 404);
    }

    return await prisma.$transaction(async (tx) => {
      const report = await tx.fieldReport.create({
        data: {
          taskPointId: parseInt(taskPointId),
          memberId: member.id,
          status: status || 'GOOD',
          description,
          media: {
            create: files.map((file) => {
              const ext = file.originalname.split('.').pop().toLowerCase();
              const isVideo = ['mp4', 'mov', 'avi', 'mkv'].includes(ext);
              return {
                fileUrl: `/uploads/${file.filename}`,
                fileType: isVideo ? 'VIDEO' : 'IMAGE',
                originalName: file.originalname,
                fileSize: file.size,
              };
            }),
          },
        },
        include: {
          taskPoint: { include: { region: true } },
          member: true,
          media: true,
        },
      });

      // If condition is ATTENTION_NEEDED or DAMAGED, alert Super Admin
      if (status === 'ATTENTION_NEEDED' || status === 'DAMAGED') {
        const admins = await tx.user.findMany({ where: { role: 'SUPER_ADMIN' } });
        for (const admin of admins) {
          await tx.notification.create({
            data: {
              userId: admin.id,
              title: `⚠️ Laporan Kendala: ${taskPoint.name}`,
              message: `Anggota ${member.fullName} melaporkan status [${status === 'DAMAGED' ? 'RUSAK' : 'PERLU PERHATIAN'}]: ${description.slice(0, 80)}...`,
              type: status === 'DAMAGED' ? 'URGENT' : 'WARNING',
              link: '/admin/region-control',
            },
          });
        }
      }

      return report;
    });
  }

  static async respondFieldReport(id, adminUserId, { adminResponse, isResolved }) {
    const report = await prisma.fieldReport.findUnique({
      where: { id: parseInt(id) },
      include: {
        member: true,
        taskPoint: true,
      },
    });

    if (!report) {
      throw new AppError('Laporan lapangan tidak ditemukan', 404);
    }

    return await prisma.$transaction(async (tx) => {
      const updated = await tx.fieldReport.update({
        where: { id: parseInt(id) },
        data: {
          adminResponse,
          isResolved: isResolved !== undefined ? Boolean(isResolved) : report.isResolved,
          resolvedAt: isResolved ? new Date() : null,
          resolvedById: isResolved ? adminUserId : null,
        },
        include: {
          taskPoint: { include: { region: true } },
          member: true,
          media: true,
          resolvedBy: { select: { id: true, username: true } },
        },
      });

      // Notify the member about admin's response
      if (report.member?.userId) {
        await tx.notification.create({
          data: {
            userId: report.member.userId,
            title: 'Tanggapan Laporan Wilayah',
            message: `Admin telah menanggapi laporan Anda di ${report.taskPoint.name}: "${adminResponse}"`,
            type: isResolved ? 'SUCCESS' : 'INFO',
            link: '/member/region-control',
          },
        });
      }

      return updated;
    });
  }
}

