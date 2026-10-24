import { z } from 'zod';

export const createAdminUserSchema = z.object({
  body: z.object({
    username: z
      .string({ required_error: 'Username wajib diisi' })
      .min(3, 'Username minimal 3 karakter')
      .max(30, 'Username maksimal 30 karakter')
      .regex(/^[a-zA-Z0-9_]+$/, 'Username hanya boleh huruf, angka, dan garis bawah (_)'),
    email: z
      .string({ required_error: 'Email wajib diisi' })
      .email('Format email tidak valid'),
    password: z
      .string({ required_error: 'Kata sandi wajib diisi' })
      .min(8, 'Kata sandi minimal 8 karakter demi keamanan')
      .regex(
        /^(?=.*[a-zA-Z])(?=.*\d)/,
        'Kata sandi harus mengandung kombinasi huruf dan angka'
      ),
    fullName: z
      .string()
      .min(2, 'Nama lengkap minimal 2 karakter')
      .optional()
      .nullable(),
    phone: z.string().optional().nullable(),
  }),
});

export const updateAdminUserSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID admin harus berupa angka'),
  }),
  body: z.object({
    username: z
      .string()
      .min(3, 'Username minimal 3 karakter')
      .max(30, 'Username maksimal 30 karakter')
      .regex(/^[a-zA-Z0-9_]+$/, 'Username hanya boleh huruf, angka, dan garis bawah (_)')
      .optional(),
    email: z.string().email('Format email tidak valid').optional(),
    fullName: z.string().min(2, 'Nama lengkap minimal 2 karakter').optional().nullable(),
    phone: z.string().optional().nullable(),
  }),
});

export const resetAdminPasswordSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID admin harus berupa angka'),
  }),
  body: z.object({
    newPassword: z
      .string({ required_error: 'Kata sandi baru wajib diisi' })
      .min(8, 'Kata sandi baru minimal 8 karakter demi keamanan')
      .regex(
        /^(?=.*[a-zA-Z])(?=.*\d)/,
        'Kata sandi harus mengandung kombinasi huruf dan angka'
      ),
  }),
});

