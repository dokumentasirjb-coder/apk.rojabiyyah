import { Router } from 'express';
import { InventoryController } from '../controllers/inventory.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { isSuperAdmin } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { upload } from '../utils/upload.js';
import { createInventorySchema, updateInventorySchema } from '../validators/inventory.validator.js';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Inventory
 *   description: Manajemen Data Inventaris dan Stok Barang
 */

router.get('/export', InventoryController.export);
router.get('/', InventoryController.getAll);
router.get('/:id', InventoryController.getById);
router.post('/', isSuperAdmin, upload.single('photo'), validate(createInventorySchema), InventoryController.create);
router.put('/:id', isSuperAdmin, upload.single('photo'), validate(updateInventorySchema), InventoryController.update);
router.delete('/:id', isSuperAdmin, InventoryController.delete);

export default router;

