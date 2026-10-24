import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { isSuperAdmin, isAnggota } from '../middlewares/role.middleware.js';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Statistik dan Ringkasan Analitik Sistem
 */

router.get('/admin', isSuperAdmin, DashboardController.getAdminDashboard);
router.get('/member', isAnggota, DashboardController.getMemberDashboard);

export default router;

