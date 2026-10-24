import prisma from '../config/prisma.js';
import { AppError } from '../middlewares/error.middleware.js';

export class NotificationService {
  static async getUserNotifications(userId) {
    const notifications = await prisma.notification.findMany({
      where: {
        OR: [{ userId }, { userId: null }],
      },
      orderBy: [{ isRead: 'asc' }, { createdAt: 'desc' }],
      take: 30,
    });

    const unreadCount = await prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });

    return {
      notifications,
      unreadCount,
    };
  }

  static async markAsRead(id, userId) {
    const notification = await prisma.notification.findUnique({
      where: { id: parseInt(id) },
    });

    if (!notification) {
      throw new AppError('Notifikasi tidak ditemukan', 404);
    }

    if (notification.userId && notification.userId !== userId) {
      throw new AppError('Akses tidak diizinkan', 403);
    }

    return await prisma.notification.update({
      where: { id: parseInt(id) },
      data: { isRead: true },
    });
  }

  static async markAllAsRead(userId) {
    return await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: { isRead: true },
    });
  }
}

