import prisma from '../config/prisma.js';
import { AppError } from '../middlewares/error.middleware.js';

export class InstitutionService {
  static async getAll({ search }) {
    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { contactPerson: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    return await prisma.institution.findMany({
      where,
      include: {
        _count: {
          select: {
            inventoryItems: true,
            loans: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getById(id) {
    const institution = await prisma.institution.findUnique({
      where: { id: parseInt(id) },
      include: {
        inventoryItems: true,
        loans: {
          include: {
            loanItems: {
              include: { inventoryItem: true },
            },
          },
        },
      },
    });

    if (!institution) {
      throw new AppError('Lembaga tidak ditemukan', 404);
    }

    return institution;
  }

  static async create(data) {
    return await prisma.institution.create({
      data,
    });
  }

  static async update(id, data) {
    await this.getById(id);
    return await prisma.institution.update({
      where: { id: parseInt(id) },
      data,
    });
  }

  static async delete(id) {
    await this.getById(id);
    return await prisma.institution.delete({
      where: { id: parseInt(id) },
    });
  }
}

