import { Router } from 'express';
import { TransactionController } from '../controllers/transaction.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { isSuperAdmin } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { upload } from '../utils/upload.js';
import { createTransactionSchema, updateTransactionSchema } from '../validators/transaction.validator.js';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Transactions
 *   description: Manajemen Rekap Keuangan Organisasi (Pemasukan & Pengeluaran)
 */

router.get('/summary', TransactionController.getSummary);
router.get('/export', isSuperAdmin, TransactionController.export);
router.get('/', isSuperAdmin, TransactionController.getAll);
router.get('/:id', isSuperAdmin, TransactionController.getById);
router.post('/', isSuperAdmin, upload.single('proofFile'), validate(createTransactionSchema), TransactionController.create);
router.put('/:id', isSuperAdmin, upload.single('proofFile'), validate(updateTransactionSchema), TransactionController.update);
router.delete('/:id', isSuperAdmin, TransactionController.delete);

export default router;

