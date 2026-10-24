import { Router } from 'express';
import { RegionController } from '../controllers/region.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { isSuperAdmin } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createRegionSchema, updateRegionSchema } from '../validators/region.validator.js';

const router = Router();

router.get('/', RegionController.getAll);
router.get('/:id', RegionController.getById);
router.post('/', authenticate, isSuperAdmin, validate(createRegionSchema), RegionController.create);
router.put('/:id', authenticate, isSuperAdmin, validate(updateRegionSchema), RegionController.update);
router.delete('/:id', authenticate, isSuperAdmin, RegionController.delete);

export default router;

