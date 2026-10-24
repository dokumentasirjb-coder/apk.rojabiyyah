import { InstitutionService } from '../services/institution.service.js';
import { sendSuccess } from '../utils/response.js';

export class InstitutionController {
  static async getAll(req, res, next) {
    try {
      const { search } = req.query;
      const data = await InstitutionService.getAll({ search });
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Daftar lembaga berhasil dimuat',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const data = await InstitutionService.getById(req.params.id);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Detail lembaga berhasil dimuat',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const data = await InstitutionService.create(req.body);
      return sendSuccess(res, {
        statusCode: 201,
        message: 'Lembaga berhasil ditambahkan',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const data = await InstitutionService.update(req.params.id, req.body);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Data lembaga berhasil diperbarui',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      await InstitutionService.delete(req.params.id);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Lembaga berhasil dihapus',
      });
    } catch (error) {
      next(error);
    }
  }
}

