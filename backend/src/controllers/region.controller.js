import { RegionService } from '../services/region.service.js';
import { sendSuccess } from '../utils/response.js';

export class RegionController {
  static async getAll(req, res, next) {
    try {
      const data = await RegionService.getAll();
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Daftar wilayah berhasil dimuat',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const data = await RegionService.getById(req.params.id);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Detail wilayah berhasil dimuat',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const data = await RegionService.create(req.body);
      return sendSuccess(res, {
        statusCode: 201,
        message: 'Wilayah berhasil ditambahkan',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const data = await RegionService.update(req.params.id, req.body);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Wilayah berhasil diperbarui',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      await RegionService.delete(req.params.id);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Wilayah berhasil dihapus',
      });
    } catch (error) {
      next(error);
    }
  }
}

