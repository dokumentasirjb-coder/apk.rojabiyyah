import { InventoryService } from '../services/inventory.service.js';
import { sendSuccess } from '../utils/response.js';

export class InventoryController {
  static async getAll(req, res, next) {
    try {
      const { search, categoryId, condition, source, availableOnly, page, limit, sortBy, sortOrder } = req.query;
      const { data, meta } = await InventoryService.getAll({
        search,
        categoryId,
        condition,
        source,
        availableOnly,
        page,
        limit,
        sortBy,
        sortOrder,
      });

      return sendSuccess(res, {
        statusCode: 200,
        message: 'Daftar inventaris berhasil dimuat',
        data,
        meta,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const data = await InventoryService.getById(req.params.id);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Detail barang inventaris berhasil dimuat',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const photoPath = req.file ? `/uploads/${req.file.filename}` : null;
      let bodyData = req.body;
      if (typeof bodyData.customFields === 'string') {
        try {
          bodyData.customFields = JSON.parse(bodyData.customFields);
        } catch {
          bodyData.customFields = {};
        }
      }

      const data = await InventoryService.create(bodyData, photoPath);
      return sendSuccess(res, {
        statusCode: 201,
        message: 'Barang inventaris berhasil ditambahkan',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const photoPath = req.file ? `/uploads/${req.file.filename}` : null;
      let bodyData = req.body;
      if (typeof bodyData.customFields === 'string') {
        try {
          bodyData.customFields = JSON.parse(bodyData.customFields);
        } catch {
          bodyData.customFields = {};
        }
      }

      const data = await InventoryService.update(req.params.id, bodyData, photoPath);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Barang inventaris berhasil diperbarui',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      await InventoryService.delete(req.params.id);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Barang inventaris berhasil dihapus',
      });
    } catch (error) {
      next(error);
    }
  }

  static async export(req, res, next) {
    try {
      const { search, categoryId, condition } = req.query;
      const buffer = await InventoryService.exportData({ search, categoryId, condition });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=Inventaris_Rojabiyyaah_${Date.now()}.xlsx`);
      return res.send(buffer);
    } catch (error) {
      next(error);
    }
  }
}

