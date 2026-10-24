import { z } from 'zod';

export const createInstitutionSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Nama lembaga wajib diisi' }).min(2, 'Nama minimal 2 karakter'),
    contactPerson: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
  }),
});

export const updateInstitutionSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID harus berupa angka'),
  }),
  body: z.object({
    name: z.string().min(2, 'Nama minimal 2 karakter').optional(),
    contactPerson: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
  }),
});

