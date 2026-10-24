import prisma from '../config/prisma.js';
import { AppError } from '../middlewares/error.middleware.js';
import { generateExcel, generatePDF } from '../utils/export.js';

export class TransactionService {
  static async generateTrxCode() {
    const today = new Date();
    const prefix = `TRX-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}`;
    const count = await prisma.transaction.count({
      where: {
        code: { startsWith: prefix },
      },
    });
    return `${prefix}-${String(count + 1).padStart(3, '0')}`;
  }

  static async getAll({ type, categoryId, startDate, endDate, search, page = 1, limit = 15 }) {
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};
    if (type) where.type = type;
    if (categoryId) where.categoryId = parseInt(categoryId);

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    if (search) {
      where.OR = [
        { code: { contains: search } },
        { description: { contains: search } },
        { category: { name: { contains: search } } },
      ];
    }

    const [total, transactions] = await Promise.all([
      prisma.transaction.count({ where }),
      prisma.transaction.findMany({
        where,
        skip,
        take,
        include: {
          category: true,
          createdBy: { select: { id: true, username: true } },
        },
        orderBy: { date: 'desc' },
      }),
    ]);

    return {
      data: transactions,
      meta: {
        total,
        page: parseInt(page),
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  static async getById(id) {
    const trx = await prisma.transaction.findUnique({
      where: { id: parseInt(id) },
      include: {
        category: true,
        createdBy: { select: { id: true, username: true } },
      },
    });

    if (!trx) {
      throw new AppError('Transaksi tidak ditemukan', 404);
    }

    return trx;
  }

  static async getSummary({ startDate, endDate }) {
    const where = {};
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const [incomeGroup, expenseGroup] = await Promise.all([
      prisma.transaction.aggregate({
        where: { ...where, type: 'INCOME' },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.transaction.aggregate({
        where: { ...where, type: 'EXPENSE' },
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    const totalIncome = Number(incomeGroup._sum.amount || 0);
    const totalExpense = Number(expenseGroup._sum.amount || 0);
    const balance = totalIncome - totalExpense;

    return {
      totalIncome,
      totalExpense,
      balance,
      incomeCount: incomeGroup._count,
      expenseCount: expenseGroup._count,
    };
  }

  static async create(userId, payload, proofFile = null) {
    const { type, categoryId, amount, date, description } = payload;
    const code = await this.generateTrxCode();

    return await prisma.transaction.create({
      data: {
        code,
        type,
        categoryId: parseInt(categoryId),
        amount: parseFloat(amount),
        date: new Date(date),
        description,
        proofFile,
        createdById: userId,
      },
      include: {
        category: true,
      },
    });
  }

  static async update(id, payload, proofFile = null) {
    await this.getById(id);

    const updateData = {};
    if (payload.type) updateData.type = payload.type;
    if (payload.categoryId) updateData.categoryId = parseInt(payload.categoryId);
    if (payload.amount !== undefined) updateData.amount = parseFloat(payload.amount);
    if (payload.date) updateData.date = new Date(payload.date);
    if (payload.description) updateData.description = payload.description;
    if (proofFile) updateData.proofFile = proofFile;

    return await prisma.transaction.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        category: true,
      },
    });
  }

  static async delete(id) {
    await this.getById(id);
    return await prisma.transaction.delete({
      where: { id: parseInt(id) },
    });
  }

  static async exportData({ format = 'excel', type, categoryId, startDate, endDate }) {
    const where = {};
    if (type) where.type = type;
    if (categoryId) where.categoryId = parseInt(categoryId);
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: { category: true },
      orderBy: { date: 'asc' },
    });

    const columns = [
      { header: 'No', key: 'no', width: 6, align: 'center' },
      { header: 'Kode Transaksi', key: 'code', width: 16, align: 'center' },
      { header: 'Tanggal', key: 'date', width: 14, align: 'center' },
      { header: 'Jenis', key: 'type', width: 14, align: 'center' },
      { header: 'Kategori', key: 'category', width: 22 },
      { header: 'Nominal (Rp)', key: 'amount', width: 18, align: 'right' },
      { header: 'Keterangan', key: 'description', width: 35 },
    ];

    const rows = transactions.map((t, idx) => ({
      no: idx + 1,
      code: t.code,
      date: new Date(t.date).toLocaleDateString('id-ID'),
      type: t.type === 'INCOME' ? 'Pemasukan' : 'Pengeluaran',
      category: t.category.name,
      amount: Number(t.amount).toLocaleString('id-ID'),
      description: t.description,
    }));

    if (format === 'pdf') {
      return {
        buffer: await generatePDF({
          title: 'Rekap Laporan Keuangan Rojabiyyaah',
          subtitle: `Periode: ${startDate || 'Awal'} s/d ${endDate || 'Sekarang'}`,
          columns,
          rows,
        }),
        mimeType: 'application/pdf',
        filename: `Rekap_Keuangan_${Date.now()}.pdf`,
      };
    }

    return {
      buffer: await generateExcel({
        title: 'Rekap Laporan Keuangan Kas Rojabiyyaah',
        sheetName: 'Keuangan',
        columns,
        rows,
      }),
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      filename: `Rekap_Keuangan_${Date.now()}.xlsx`,
    };
  }
}

