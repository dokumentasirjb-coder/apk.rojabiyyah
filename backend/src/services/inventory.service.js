import prisma from '../config/prisma.js';
import { AppError } from '../middlewares/error.middleware.js';
import { generateExcel } from '../utils/export.js';

export class InventoryService {
  static async getAll({ search, categoryId, condition, source, availableOnly, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' }) {
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};
    if (categoryId) where.categoryId = parseInt(categoryId);
    if (condition) where.condition = condition;
    if (source) where.source = source;
    if (availableOnly === 'true' || availableOnly === true) {
      where.availableQuantity = { gt: 0 };
    }

    if (search) {
      where.OR = [
        { code: { contains: search } },
        { name: { contains: search } },
        { location: { contains: search } },
        { category: { name: { contains: search } } },
        { institution: { name: { contains: search } } },
      ];
    }

    const [total, items] = await Promise.all([
      prisma.inventoryItem.count({ where }),
      prisma.inventoryItem.findMany({
        where,
        skip,
        take,
        include: {
          category: true,
          institution: true,
          _count: {
            select: {
              loanItems: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
      }),
    ]);

    return {
      data: items,
      meta: {
        total,
        page: parseInt(page),
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  static async getById(id) {
    const item = await prisma.inventoryItem.findUnique({
      where: { id: parseInt(id) },
      include: {
        category: true,
        institution: true,
        loanItems: {
          include: {
            loan: {
              include: {
                member: true,
              },
            },
          },
          orderBy: { loan: { createdAt: 'desc' } },
          take: 10,
        },
      },
    });

    if (!item) {
      throw new AppError('Barang inventaris tidak ditemukan', 404);
    }

    // Fetch custom field values
    const customValues = await prisma.customFieldValue.findMany({
      where: {
        recordId: parseInt(id),
        customField: { module: 'INVENTORY' },
      },
      include: { customField: true },
    });

    return {
      ...item,
      customValues,
    };
  }

  static async create(payload, photoPath = null) {
    const { code, name, categoryId, quantity, condition, location, source, institutionId, notes, customFields } = payload;

    const existing = await prisma.inventoryItem.findUnique({ where: { code } });
    if (existing) {
      throw new AppError(`Barang dengan kode '${code}' sudah ada`, 409);
    }

    const qty = parseInt(quantity) || 1;

    const item = await prisma.inventoryItem.create({
      data: {
        code,
        name,
        categoryId: parseInt(categoryId),
        quantity: qty,
        availableQuantity: qty,
        condition: condition || 'GOOD',
        location,
        source: source || 'INTERNAL',
        institutionId: institutionId ? parseInt(institutionId) : null,
        photo: photoPath,
        notes,
      },
      include: {
        category: true,
        institution: true,
      },
    });

    // Save custom fields if provided
    if (customFields && typeof customFields === 'object') {
      const entries = Object.entries(customFields);
      for (const [fieldId, val] of entries) {
        await prisma.customFieldValue.create({
          data: {
            customFieldId: parseInt(fieldId),
            recordId: item.id,
            value: String(val),
          },
        });
      }
    }

    return item;
  }

  static async update(id, payload, photoPath = null) {
    const existing = await prisma.inventoryItem.findUnique({ where: { id: parseInt(id) } });
    if (!existing) {
      throw new AppError('Barang inventaris tidak ditemukan', 404);
    }

    const updateData = {};
    if (payload.code) updateData.code = payload.code;
    if (payload.name) updateData.name = payload.name;
    if (payload.categoryId) updateData.categoryId = parseInt(payload.categoryId);
    if (payload.condition) updateData.condition = payload.condition;
    if (payload.location) updateData.location = payload.location;
    if (payload.source) updateData.source = payload.source;
    if (payload.institutionId !== undefined) {
      updateData.institutionId = payload.institutionId ? parseInt(payload.institutionId) : null;
    }
    if (payload.notes !== undefined) updateData.notes = payload.notes;
    if (photoPath) updateData.photo = photoPath;

    // Adjust quantity & availableQuantity if quantity changed
    if (payload.quantity !== undefined) {
      const newQty = parseInt(payload.quantity);
      const diff = newQty - existing.quantity;
      updateData.quantity = newQty;
      updateData.availableQuantity = Math.max(0, existing.availableQuantity + diff);
    }

    const item = await prisma.inventoryItem.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        category: true,
        institution: true,
      },
    });

    // Update custom fields if provided
    if (payload.customFields && typeof payload.customFields === 'object') {
      const entries = Object.entries(payload.customFields);
      for (const [fieldId, val] of entries) {
        await prisma.customFieldValue.upsert({
          where: {
            id: (await prisma.customFieldValue.findFirst({
              where: { customFieldId: parseInt(fieldId), recordId: item.id },
            }))?.id || 0,
          },
          update: { value: String(val) },
          create: {
            customFieldId: parseInt(fieldId),
            recordId: item.id,
            value: String(val),
          },
        });
      }
    }

    return item;
  }

  static async delete(id) {
    const existing = await prisma.inventoryItem.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: { loanItems: true },
        },
      },
    });

    if (!existing) {
      throw new AppError('Barang inventaris tidak ditemukan', 404);
    }

    if (existing._count.loanItems > 0) {
      throw new AppError('Barang ini memiliki riwayat peminjaman dan tidak dapat dihapus', 400);
    }

    return await prisma.inventoryItem.delete({
      where: { id: parseInt(id) },
    });
  }

  static async exportData({ search, categoryId, condition }) {
    const where = {};
    if (categoryId) where.categoryId = parseInt(categoryId);
    if (condition) where.condition = condition;
    if (search) {
      where.OR = [
        { code: { contains: search } },
        { name: { contains: search } },
        { location: { contains: search } },
      ];
    }

    const items = await prisma.inventoryItem.findMany({
      where,
      include: { category: true, institution: true },
      orderBy: { code: 'asc' },
    });

    const columns = [
      { header: 'No', key: 'no', width: 6, align: 'center' },
      { header: 'Kode Barang', key: 'code', width: 15, align: 'center' },
      { header: 'Nama Barang', key: 'name', width: 35 },
      { header: 'Kategori', key: 'category', width: 22 },
      { header: 'Total Stok', key: 'quantity', width: 12, align: 'center' },
      { header: 'Stok Tersedia', key: 'availableQuantity', width: 14, align: 'center' },
      { header: 'Kondisi', key: 'condition', width: 16, align: 'center' },
      { header: 'Lokasi Simpan', key: 'location', width: 25 },
      { header: 'Sumber', key: 'source', width: 22 },
    ];

    const conditionMap = {
      GOOD: 'Baik',
      SLIGHTLY_DAMAGED: 'Rusak Ringan',
      DAMAGED: 'Rusak Berat',
    };

    const rows = items.map((item, idx) => ({
      no: idx + 1,
      code: item.code,
      name: item.name,
      category: item.category.name,
      quantity: item.quantity,
      availableQuantity: item.availableQuantity,
      condition: conditionMap[item.condition] || item.condition,
      location: item.location,
      source: item.source === 'LOAN_FROM_INSTITUTION' ? `Pinjaman (${item.institution?.name || 'Mitra'})` : 'Milik Sendiri',
    }));

    return await generateExcel({
      title: 'Laporan Rekap Data Inventaris Rojabiyyaah',
      sheetName: 'Inventaris',
      columns,
      rows,
    });
  }
}

