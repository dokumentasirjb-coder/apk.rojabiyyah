import { AdminUserService } from '../services/adminUser.service.js';
import { sendSuccess } from '../utils/response.js';

export class AdminUserController {
  static async getAll(req, res, next) {
    try {
      const result = await AdminUserService.getAllAdminUsers();
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Daftar pengelola Super Admin berhasil diambil',
        data: result.admins,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const { username, email, password, fullName, phone } = req.body;
      const result = await AdminUserService.createAdminUser({
        username,
        email,
        password,
        fullName,
        phone,
        currentUserId: req.user.id,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      return sendSuccess(res, {
        statusCode: 201,
        message: 'Pengelola Super Admin baru berhasil ditambahkan',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const targetUserId = parseInt(req.params.id);
      const { username, email, fullName, phone } = req.body;

      const result = await AdminUserService.updateAdminUser({
        targetUserId,
        username,
        email,
        fullName,
        phone,
        currentUserId: req.user.id,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      return sendSuccess(res, {
        statusCode: 200,
        message: 'Data pengelola Super Admin berhasil diperbarui',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async resetPassword(req, res, next) {
    try {
      const targetUserId = parseInt(req.params.id);
      const { newPassword } = req.body;

      const result = await AdminUserService.resetAdminPassword({
        targetUserId,
        newPassword,
        currentUserId: req.user.id,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      return sendSuccess(res, {
        statusCode: 200,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  static async unlock(req, res, next) {
    try {
      const targetUserId = parseInt(req.params.id);

      const result = await AdminUserService.unlockAdminAccount({
        targetUserId,
        currentUserId: req.user.id,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      return sendSuccess(res, {
        statusCode: 200,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const targetUserId = parseInt(req.params.id);

      const result = await AdminUserService.deleteAdminUser({
        targetUserId,
        currentUserId: req.user.id,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });

      return sendSuccess(res, {
        statusCode: 200,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}

