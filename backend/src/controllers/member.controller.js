import { MemberService } from '../services/member.service.js';
import { sendSuccess } from '../utils/response.js';

export class MemberController {
  static async getAll(req, res, next) {
    try {
      const { search, regionId, status, page, limit } = req.query;
      const { data, meta } = await MemberService.getAll({ search, regionId, status, page, limit });
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Daftar anggota berhasil dimuat',
        data,
        meta,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const data = await MemberService.getById(req.params.id);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Detail anggota berhasil dimuat',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const avatarPath = req.file ? `/uploads/${req.file.filename}` : null;
      const data = await MemberService.create(req.body, avatarPath);
      return sendSuccess(res, {
        statusCode: 201,
        message: 'Anggota berhasil didaftarkan',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const avatarPath = req.file ? `/uploads/${req.file.filename}` : null;
      const data = await MemberService.update(
        req.params.id,
        req.body,
        avatarPath,
        req.user.id,
        req.user.role
      );
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Data anggota berhasil diperbarui',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      await MemberService.delete(req.params.id);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Anggota berhasil dihapus',
      });
    } catch (error) {
      next(error);
    }
  }

  static async resetPassword(req, res, next) {
    try {
      await MemberService.resetPassword(req.params.id, req.body.newPassword);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Kata sandi anggota berhasil direset',
      });
    } catch (error) {
      next(error);
    }
  }

  static async publicRegister(req, res, next) {
    try {
      const data = await MemberService.publicRegister({
        ...req.body,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });
      return sendSuccess(res, {
        statusCode: 201,
        message: 'Pendaftaran anggota berhasil! Data Anda telah tersimpan di sistem.',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async exportExcel(req, res, next) {
    try {
      const { search, regionId, status, division, domicile } = req.query;
      const buffer = await MemberService.exportData({ search, regionId, status, division, domicile });
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="data-anggota-rojabiyyaah.xlsx"');
      return res.send(buffer);
    } catch (error) {
      next(error);
    }
  }

  static async downloadTemplate(req, res, next) {
    try {
      const buffer = await MemberService.generateTemplate();
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="template-import-anggota-rojabiyyaah.xlsx"');
      return res.send(buffer);
    } catch (error) {
      next(error);
    }
  }

  static async importExcel(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Silakan pilih file Excel (.xlsx / .xls) untuk diimpor',
        });
      }
      const result = await MemberService.importExcel(
        req.file.path,
        req.user.id,
        req.ip,
        req.get('user-agent')
      );
      return sendSuccess(res, {
        statusCode: 201,
        message: `Berhasil mengimpor ${result.totalImported} data anggota dari file Excel`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

