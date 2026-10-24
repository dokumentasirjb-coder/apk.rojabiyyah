import { NotificationService } from '../services/notification.service.js';
import { sendSuccess } from '../utils/response.js';

export class NotificationController {
  static async getNotifications(req, res, next) {
    try {
      const data = await NotificationService.getUserNotifications(req.user.id);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Daftar notifikasi berhasil dimuat',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async markAsRead(req, res, next) {
    try {
      const data = await NotificationService.markAsRead(req.params.id, req.user.id);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Notifikasi ditandai telah dibaca',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async markAllAsRead(req, res, next) {
    try {
      await NotificationService.markAllAsRead(req.user.id);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Semua notifikasi ditandai telah dibaca',
      });
    } catch (error) {
      next(error);
    }
  }
}

