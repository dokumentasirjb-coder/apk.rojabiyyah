import { Router } from 'express';
import { LoanController } from '../controllers/loan.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { isSuperAdmin, isAnggota, isAnyUser } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  memberLoanRequestSchema,
  adminCreateLoanSchema,
  loanActionSchema,
} from '../validators/loan.validator.js';

import { upload } from '../utils/upload.js';

export const loanRouter = Router();
export const loanRequestRouter = Router();

// Member loan requests
loanRequestRouter.use(authenticate);
loanRequestRouter.post('/', isAnyUser, validate(memberLoanRequestSchema), LoanController.createMemberRequest);
loanRequestRouter.get('/me', isAnyUser, LoanController.getMemberLoans);
loanRequestRouter.patch('/:id/return', isAnyUser, upload.single('proof'), LoanController.returnLoan);

// Full Loan Management (Admin + Shared Receipts)
loanRouter.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Loans
 *   description: Manajemen Peminjaman Barang & Alur Persetujuan
 */

loanRouter.get('/:id/receipt', LoanController.downloadReceipt);
loanRouter.get('/', isSuperAdmin, LoanController.getAll);
loanRouter.get('/:id', LoanController.getById);
loanRouter.post('/', isSuperAdmin, validate(adminCreateLoanSchema), LoanController.createAdminLoan);
loanRouter.patch('/:id/approve', isSuperAdmin, LoanController.approve);
loanRouter.patch('/:id/reject', isSuperAdmin, LoanController.reject);
loanRouter.patch('/:id/borrow', isSuperAdmin, upload.single('proof'), LoanController.markBorrowed);
loanRouter.patch('/:id/return', isSuperAdmin, upload.single('proof'), LoanController.returnLoan);
loanRouter.delete('/:id', isSuperAdmin, LoanController.delete);

