import { Router } from 'express';
import { MemberController } from '../controllers/member.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { isSuperAdmin } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { upload } from '../utils/upload.js';
import {
  createMemberSchema,
  updateMemberSchema,
  resetMemberPasswordSchema,
  publicMemberRegisterSchema,
} from '../validators/member.validator.js';
import { authLimiter } from '../middlewares/rateLimiter.middleware.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Members
 *   description: Manajemen Data Anggota Organisasi
 */

// Public Member Registration (PPSB form without mandatory login)
router.post('/public-register', authLimiter, validate(publicMemberRegisterSchema), MemberController.publicRegister);

// Protected routes below
router.use(authenticate);

router.get('/export', isSuperAdmin, MemberController.exportExcel);
router.get('/template-excel', isSuperAdmin, MemberController.downloadTemplate);
router.post('/import-excel', isSuperAdmin, upload.single('file'), MemberController.importExcel);
router.get('/', MemberController.getAll);
router.get('/:id', MemberController.getById);
router.post('/', isSuperAdmin, upload.single('avatar'), validate(createMemberSchema), MemberController.create);
router.put('/:id', upload.single('avatar'), validate(updateMemberSchema), MemberController.update);
router.delete('/:id', isSuperAdmin, MemberController.delete);
router.post('/:id/reset-password', isSuperAdmin, validate(resetMemberPasswordSchema), MemberController.resetPassword);

export default router;

