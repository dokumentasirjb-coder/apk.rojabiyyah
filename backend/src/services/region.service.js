import prisma from '../config/prisma.js';
import { AppError } from '../middlewares/error.middleware.js';

export class RegionService {
  static async getAll() {
    return await prisma.region.findMany({
      include: {
        _count: {
          select: {
            members: true,
            taskPoints: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  static async getById(id) {
    const region = await prisma.region.findUnique({
      where: { id: parseInt(id) },
      include: {
        members: true,
        taskPoints: {
          include: {
            picMember: true,
          },
        },
      },
    });

    if (!region) {
      throw new AppError('Wilayah tidak ditemukan', 404);
    }

    return region;
  }

  static async create(data) {
    return await prisma.region.create({
      data,
    });
  }

  static async update(id, data) {
    await this.getById(id);
    return await prisma.region.update({
      where: { id: parseInt(id) },
      data,
    });
  }

  static async delete(id) {
    await this.getById(id);
    return await prisma.region.delete({
      where: { id: parseInt(id) },
    });
  }
}

