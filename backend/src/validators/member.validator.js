import { z } from 'zod';

export const createMemberSchema = z.object({
  body: z.object({
    username: z.string().min(3, 'Username minimal 3 karakter').optional().nullable(),
    email: z.string().email('Format email tidak valid').optional().nullable(),
    password: z.string().min(6, 'Password minimal 6 karakter').optional().nullable(),
    role: z.enum(['SUPER_ADMIN', 'ANGGOTA']).default('ANGGOTA'),
    memberId: z.string().optional().nullable(), // auto-generated if omitted
    fullName: z.string({ required_error: 'Nama lengkap wajib diisi' }).min(2, 'Nama minimal 2 karakter'),
    division: z.string().optional().nullable(), // DEV
    education: z.string().optional().nullable(), // PENDIDIKAN
    grade: z.string().optional().nullable(), // KELAS
    domicile: z.string().optional().nullable(), // DOMISILI
    shirtSize: z.string().optional().nullable(), // SERAGAM
    phone: z.string().optional().nullable(), // NO WA
    address: z.string().optional().nullable(),
    regionId: z.union([z.number(), z.string().regex(/^\d+$/).transform(Number)]).optional().nullable(),
    status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
    notes: z.string().optional().nullable(),
  }),
});

export const publicMemberRegisterSchema = z.object({
  body: z.object({
    fullName: z.string({ required_error: 'Nama lengkap wajib diisi' }).min(2, 'Nama minimal 2 karakter'),
    division: z.string().optional().nullable(), // DEV
    education: z.string().optional().nullable(), // PENDIDIKAN
    grade: z.string().optional().nullable(), // KELAS
    domicile: z.string().optional().nullable(), // DOMISILI
    shirtSize: z.string().optional().nullable(), // SERAGAM
    phone: z.string().optional().nullable(), // NO WA
    address: z.string().optional().nullable(),
    regionId: z.union([z.number(), z.string().regex(/^\d+$/).transform(Number)]).optional().nullable(),
    createAccount: z.boolean().optional().default(false),
    username: z.string().min(3).optional().nullable(),
    email: z.string().email('Format email tidak valid').optional().nullable(),
    password: z.string().min(6).optional().nullable(),
  }),
});

export const updateMemberSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID harus berupa angka'),
  }),
  body: z.object({
    fullName: z.string().min(2).optional(),
    division: z.string().optional().nullable(),
    education: z.string().optional().nullable(),
    grade: z.string().optional().nullable(),
    domicile: z.string().optional().nullable(),
    shirtSize: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    regionId: z.union([z.number(), z.string().regex(/^\d+$/).transform(Number)]).optional().nullable(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
    role: z.enum(['SUPER_ADMIN', 'ANGGOTA']).optional(),
    notes: z.string().optional().nullable(),
    email: z.string().email('Format email tidak valid').optional().nullable(),
  }),
});

export const resetMemberPasswordSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID harus berupa angka'),
  }),
  body: z.object({
    newPassword: z.string({ required_error: 'Kata sandi baru wajib diisi' }).min(6, 'Minimal 6 karakter'),
  }),
});

