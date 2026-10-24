import { z } from 'zod';

export const createInventorySchema = z.object({
  body: z.object({
    code: z.string({ required_error: 'Kode barang wajib diisi' }).min(2),
    name: z.string({ required_error: 'Nama barang wajib diisi' }).min(2),
    categoryId: z.union([z.number(), z.string().regex(/^\d+$/).transform(Number)]),
    quantity: z.union([z.number(), z.string().regex(/^\d+$/).transform(Number)]).default(1),
    condition: z.enum(['GOOD', 'SLIGHTLY_DAMAGED', 'DAMAGED']).default('GOOD'),
    location: z.string({ required_error: 'Lokasi penyimpanan wajib diisi' }).min(2),
    source: z.enum(['INTERNAL', 'LOAN_FROM_INSTITUTION']).default('INTERNAL'),
    institutionId: z.union([z.number(), z.string().regex(/^\d+$/).transform(Number)]).optional().nullable(),
    notes: z.string().optional().nullable(),
    customFields: z.any().optional(),
  }),
});

export const updateInventorySchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID harus berupa angka'),
  }),
  body: z.object({
    code: z.string().min(2).optional(),
    name: z.string().min(2).optional(),
    categoryId: z.union([z.number(), z.string().regex(/^\d+$/).transform(Number)]).optional(),
    quantity: z.union([z.number(), z.string().regex(/^\d+$/).transform(Number)]).optional(),
    condition: z.enum(['GOOD', 'SLIGHTLY_DAMAGED', 'DAMAGED']).optional(),
    location: z.string().min(2).optional(),
    source: z.enum(['INTERNAL', 'LOAN_FROM_INSTITUTION']).optional(),
    institutionId: z.union([z.number(), z.string().regex(/^\d+$/).transform(Number)]).optional().nullable(),
    notes: z.string().optional().nullable(),
    customFields: z.any().optional(),
  }),
});

