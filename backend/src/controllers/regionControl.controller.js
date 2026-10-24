import { RegionControlService } from '../services/regionControl.service.js';
import { sendSuccess } from '../utils/response.js';

export class RegionControlController {
  // Task Points
  static async getAllTaskPoints(req, res, next) {
    try {
      const { regionId, categoryId, picMemberId, search, page, limit } = req.query;
      const { data, meta } = await RegionControlService.getAllTaskPoints({
        regionId,
        categoryId,
        picMemberId,
        search,
        page,
        limit,
      });

      return sendSuccess(res, {
        statusCode: 200,
        message: 'Daftar titik tugas berhasil dimuat',
        data,
        meta,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getTaskPointById(req, res, next) {
    try {
      const data = await RegionControlService.getTaskPointById(req.params.id);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Detail titik tugas berhasil dimuat',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createTaskPoint(req, res, next) {
    try {
      const data = await RegionControlService.createTaskPoint(req.body);
      return sendSuccess(res, {
        statusCode: 201,
        message: 'Titik tugas berhasil ditambahkan',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateTaskPoint(req, res, next) {
    try {
      const data = await RegionControlService.updateTaskPoint(req.params.id, req.body);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Titik tugas berhasil diperbarui',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteTaskPoint(req, res, next) {
    try {
      await RegionControlService.deleteTaskPoint(req.params.id);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Titik tugas berhasil dihapus',
      });
    } catch (error) {
      next(error);
    }
  }

  // Field Reports
  static async getFieldReports(req, res, next) {
    try {
      const { regionId, status, isResolved, taskPointId, memberId, startDate, endDate, page, limit } = req.query;
      const { data, meta } = await RegionControlService.getFieldReports({
        regionId,
        status,
        isResolved,
        taskPointId,
        memberId,
        startDate,
        endDate,
        page,
        limit,
      });

      return sendSuccess(res, {
        statusCode: 200,
        message: 'Daftar laporan lapangan berhasil dimuat',
        data,
        meta,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createFieldReport(req, res, next) {
    try {
      const files = req.files || [];
      const data = await RegionControlService.createFieldReport(req.user.id, req.body, files);
      return sendSuccess(res, {
        statusCode: 201,
        message: 'Laporan kondisi lapangan berhasil dikirim',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async respondFieldReport(req, res, next) {
    try {
      const data = await RegionControlService.respondFieldReport(req.params.id, req.user.id, req.body);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Tanggapan laporan berhasil disimpan',
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}

