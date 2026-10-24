import { z } from 'zod';

export const memberLoanRequestSchema = z.object({
  body: z.object({
    items: z.array(
      z.object({
        inventoryItemId: z.union([z.number(), z.string().regex(/^\d+$/).transform(Number)]),
        quantity: z.union([z.number(), z.string().regex(/^\d+$/).transform(Number)]).default(1),
        notes: z.string().optional().nullable(),
      })
    ).min(1, 'Minimal pilih 1 barang untuk dipinjam'),
    startDate: z.string({ required_error: 'Tanggal mulai pinjam wajib diisi' }),
    endDate: z.string({ required_error: 'Tanggal pengembalian wajib diisi' }),
    purpose: z.string({ required_error: 'Keperluan peminjaman wajib diisi' }).min(3),
  }),
});

export const adminCreateLoanSchema = z.object({
  body: z.object({
    borrowerType: z.enum(['MEMBER', 'OUTSIDE']).default('MEMBER'),
    memberId: z.union([z.number(), z.string().regex(/^\d+$/).transform(Number)]).optional().nullable(),
    borrowerName: z.string({ required_error: 'Nama peminjam wajib diisi' }).min(2),
    institutionId: z.union([z.number(), z.string().regex(/^\d+$/).transform(Number)]).optional().nullable(),
    items: z.array(
      z.object({
        inventoryItemId: z.union([z.number(), z.string().regex(/^\d+$/).transform(Number)]),
        quantity: z.union([z.number(), z.string().regex(/^\d+$/).transform(Number)]).default(1),
        notes: z.string().optional().nullable(),
      })
    ).min(1, 'Minimal pilih 1 barang'),
    startDate: z.string({ required_error: 'Tanggal mulai pinjam wajib diisi' }),
    endDate: z.string({ required_error: 'Tanggal selesai pinjam wajib diisi' }),
    purpose: z.string({ required_error: 'Keperluan pinjam wajib diisi' }).min(2),
    status: z.enum(['PENDING', 'APPROVED', 'BORROWED']).default('APPROVED'),
    deductStock: z.boolean().optional().default(true),
    adminNotes: z.string().optional().nullable(),
  }),
});

export const loanActionSchema = z.object({
  body: z.object({
    adminNotes: z.string().optional().nullable(),
    itemConditions: z.array(
      z.object({
        inventoryItemId: z.union([z.number(), z.string().regex(/^\d+$/).transform(Number)]),
        conditionAfter: z.enum(['GOOD', 'SLIGHTLY_DAMAGED', 'DAMAGED']).default('GOOD'),
        notes: z.string().optional().nullable(),
      })
    ).optional(),
  }),
});

