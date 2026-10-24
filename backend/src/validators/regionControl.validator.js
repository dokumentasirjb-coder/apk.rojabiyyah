import { z } from 'zod';

export const createTaskPointSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Nama titik tugas wajib diisi' }).min(2),
    regionId: z.union([z.number(), z.string().regex(/^\d+$/).transform(Number)]),
    categoryId: z.union([z.number(), z.string().regex(/^\d+$/).transform(Number)]).optional().nullable(),
    categoryName: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    picMemberId: z.union([z.number(), z.string().regex(/^\d+$/).transform(Number)]).optional().nullable(),
    schedule: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
  }),
});

export const updateTaskPointSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID harus berupa angka'),
  }),
  body: z.object({
    name: z.string().min(2).optional(),
    regionId: z.union([z.number(), z.string().regex(/^\d+$/).transform(Number)]).optional(),
    categoryId: z.union([z.number(), z.string().regex(/^\d+$/).transform(Number)]).optional().nullable(),
    categoryName: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    picMemberId: z.union([z.number(), z.string().regex(/^\d+$/).transform(Number)]).optional().nullable(),
    schedule: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
  }),
});

export const createFieldReportSchema = z.object({
  body: z.object({
    taskPointId: z.union([z.number(), z.string().regex(/^\d+$/).transform(Number)]),
    status: z.enum(['GOOD', 'ATTENTION_NEEDED', 'DAMAGED']).default('GOOD'),
    description: z.string({ required_error: 'Deskripsi laporan wajib diisi' }).min(3),
  }),
});

export const respondFieldReportSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID harus berupa angka'),
  }),
  body: z.object({
    adminResponse: z.string({ required_error: 'Tanggapan admin wajib diisi' }).min(2),
    isResolved: z.boolean().default(false),
  }),
});

