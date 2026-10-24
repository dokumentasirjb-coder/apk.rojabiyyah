import { Router } from 'express';
import { AdminUserController } from '../controllers/adminUser.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { isSuperAdmin } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createAdminUserSchema,
  updateAdminUserSchema,
  resetAdminPasswordSchema,
} from '../validators/adminUser.validator.js';

const router = Router();

// Semua rute admin user management wajib login dan berstatus SUPER_ADMIN
router.use(authenticate, isSuperAdmin);

router.get('/', AdminUserController.getAll);
router.post('/', validate(createAdminUserSchema), AdminUserController.create);
router.put('/:id', validate(updateAdminUserSchema), AdminUserController.update);
router.patch('/:id/reset-password', validate(resetAdminPasswordSchema), AdminUserController.resetPassword);
router.post('/:id/unlock', AdminUserController.unlock);
router.delete('/:id', AdminUserController.delete);

export default router;

