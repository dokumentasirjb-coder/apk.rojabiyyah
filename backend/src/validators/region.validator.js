import { z } from 'zod';

export const createRegionSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Nama wilayah wajib diisi' }).min(2, 'Nama minimal 2 karakter'),
    code: z.string({ required_error: 'Kode wilayah wajib diisi' }).min(2, 'Kode minimal 2 karakter').toUpperCase(),
    description: z.string().optional().nullable(),
  }),
});

export const updateRegionSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID harus berupa angka'),
  }),
  body: z.object({
    name: z.string().min(2, 'Nama minimal 2 karakter').optional(),
    code: z.string().min(2, 'Kode minimal 2 karakter').toUpperCase().optional(),
    description: z.string().optional().nullable(),
  }),
});

