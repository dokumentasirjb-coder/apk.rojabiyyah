import { TransactionService } from '../services/transaction.service.js';
import { sendSuccess } from '../utils/response.js';

export class TransactionController {
  static async getAll(req, res, next) {
    try {
      const { type, categoryId, startDate, endDate, search, page, limit } = req.query;
      const { data, meta } = await TransactionService.getAll({
        type,
        categoryId,
        startDate,
        endDate,
        search,
        page,
        limit,
      });

      return sendSuccess(res, {
        statusCode: 200,
        message: 'Daftar transaksi berhasil dimuat',
        data,
        meta,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const data = await TransactionService.getById(req.params.id);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Detail transaksi berhasil dimuat',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getSummary(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      const data = await TransactionService.getSummary({ startDate, endDate });
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Ringkasan keuangan berhasil dimuat',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const proofFile = req.file ? `/uploads/${req.file.filename}` : null;
      const data = await TransactionService.create(req.user.id, req.body, proofFile);
      return sendSuccess(res, {
        statusCode: 201,
        message: 'Transaksi kas berhasil dicatat',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const proofFile = req.file ? `/uploads/${req.file.filename}` : null;
      const data = await TransactionService.update(req.params.id, req.body, proofFile);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Transaksi kas berhasil diperbarui',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      await TransactionService.delete(req.params.id);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Transaksi kas berhasil dihapus',
      });
    } catch (error) {
      next(error);
    }
  }

  static async export(req, res, next) {
    try {
      const { format, type, categoryId, startDate, endDate } = req.query;
      const { buffer, mimeType, filename } = await TransactionService.exportData({
        format,
        type,
        categoryId,
        startDate,
        endDate,
      });

      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
      return res.send(buffer);
    } catch (error) {
      next(error);
    }
  }
}

