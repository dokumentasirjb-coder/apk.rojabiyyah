import { LoanService } from '../services/loan.service.js';
import { sendSuccess } from '../utils/response.js';
import { AppError } from '../middlewares/error.middleware.js';

export class LoanController {
  static async getAll(req, res, next) {
    try {
      const { status, borrowerType, memberId, search, page, limit } = req.query;
      const { data, meta } = await LoanService.getAll({ status, borrowerType, memberId, search, page, limit });
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Daftar peminjaman berhasil dimuat',
        data,
        meta,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const data = await LoanService.getById(req.params.id);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Detail peminjaman berhasil dimuat',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMemberLoans(req, res, next) {
    try {
      const { status, page, limit } = req.query;
      const { data, meta } = await LoanService.getMemberLoans(req.user.id, { status, page, limit });
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Daftar peminjaman saya berhasil dimuat',
        data,
        meta,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createMemberRequest(req, res, next) {
    try {
      const data = await LoanService.createMemberRequest(req.user.id, req.body);
      return sendSuccess(res, {
        statusCode: 201,
        message: 'Pengajuan peminjaman berhasil diajukan, menunggu persetujuan admin',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createAdminLoan(req, res, next) {
    try {
      const data = await LoanService.createAdminLoan(req.user.id, req.body);
      return sendSuccess(res, {
        statusCode: 201,
        message: 'Peminjaman berhasil dicatat oleh admin',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async approve(req, res, next) {
    try {
      const { adminNotes } = req.body;
      const data = await LoanService.approveLoan(req.params.id, req.user.id, adminNotes);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Peminjaman berhasil disetujui',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async reject(req, res, next) {
    try {
      const { adminNotes } = req.body;
      const data = await LoanService.rejectLoan(req.params.id, req.user.id, adminNotes);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Peminjaman berhasil ditolak',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async markBorrowed(req, res, next) {
    try {
      const { adminNotes, borrowProof: bodyProof } = req.body;
      const borrowProof = req.file ? `/uploads/${req.file.filename}` : bodyProof || null;
      const data = await LoanService.markBorrowed(req.params.id, req.user.id, adminNotes, borrowProof);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Status peminjaman diperbarui menjadi Dipinjam (Barang Diserahkan)',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async returnLoan(req, res, next) {
    try {
      const returnProof = req.file ? `/uploads/${req.file.filename}` : req.body.returnProof || null;
      const data = await LoanService.returnLoan(req.params.id, req.user.id, {
        ...req.body,
        returnProof,
        userRole: req.user.role,
      });
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Pengembalian barang berhasil dicatat dan stok telah dikembalikan',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      await LoanService.delete(req.params.id);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Data peminjaman berhasil dihapus',
      });
    } catch (error) {
      next(error);
    }
  }

  static async downloadReceipt(req, res, next) {
    try {
      const loan = await LoanService.getById(req.params.id);
      if (req.user.role === 'ANGGOTA' && loan.member?.userId !== req.user.id) {
        throw new AppError('Anda tidak memiliki izin mengunduh bukti peminjaman ini', 403);
      }
      const buffer = await LoanService.generateLoanReceipt(req.params.id);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=Bukti_Peminjaman_${loan.loanCode || req.params.id}.pdf`);
      return res.send(buffer);
    } catch (error) {
      next(error);
    }
  }
}

