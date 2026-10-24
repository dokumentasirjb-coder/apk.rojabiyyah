import { Router } from 'express';
import { InstitutionController } from '../controllers/institution.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { isSuperAdmin } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createInstitutionSchema, updateInstitutionSchema } from '../validators/institution.validator.js';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Institutions
 *   description: Manajemen Lembaga / Pihak Luar Mitra Peminjaman
 */

router.get('/', InstitutionController.getAll);
router.get('/:id', InstitutionController.getById);
router.post('/', isSuperAdmin, validate(createInstitutionSchema), InstitutionController.create);
router.put('/:id', isSuperAdmin, validate(updateInstitutionSchema), InstitutionController.update);
router.delete('/:id', isSuperAdmin, InstitutionController.delete);

export default router;

