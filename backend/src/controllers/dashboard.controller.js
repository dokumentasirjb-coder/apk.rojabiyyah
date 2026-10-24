import { DashboardService } from '../services/dashboard.service.js';
import { sendSuccess } from '../utils/response.js';

export class DashboardController {
  static async getAdminDashboard(req, res, next) {
    try {
      const data = await DashboardService.getAdminDashboard();
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Data analitik dashboard Super Admin berhasil dimuat',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMemberDashboard(req, res, next) {
    try {
      const data = await DashboardService.getMemberDashboard(req.user.id);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Data beranda anggota berhasil dimuat',
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}

