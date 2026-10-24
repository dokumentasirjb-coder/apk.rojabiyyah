import { z } from 'zod';

export const createTransactionSchema = z.object({
  body: z.object({
    type: z.enum(['INCOME', 'EXPENSE'], { required_error: 'Tipe transaksi wajib dipilih' }),
    categoryId: z.union([z.number(), z.string().regex(/^\d+$/).transform(Number)]),
    amount: z.union([z.number(), z.string().regex(/^\d+(\.\d+)?$/).transform(Number)]),
    date: z.string({ required_error: 'Tanggal transaksi wajib diisi' }),
    description: z.string({ required_error: 'Keterangan transaksi wajib diisi' }).min(3),
  }),
});

export const updateTransactionSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID harus berupa angka'),
  }),
  body: z.object({
    type: z.enum(['INCOME', 'EXPENSE']).optional(),
    categoryId: z.union([z.number(), z.string().regex(/^\d+$/).transform(Number)]).optional(),
    amount: z.union([z.number(), z.string().regex(/^\d+(\.\d+)?$/).transform(Number)]).optional(),
    date: z.string().optional(),
    description: z.string().min(3).optional(),
  }),
});

