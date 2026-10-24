import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    usernameOrEmail: z.string({
      required_error: 'Username atau email wajib diisi',
    }).min(1, 'Username atau email tidak boleh kosong'),
    password: z.string({
      required_error: 'Kata sandi wajib diisi',
    }).min(6, 'Kata sandi minimal 6 karakter'),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string({
      required_error: 'Kata sandi saat ini wajib diisi',
    }),
    newPassword: z.string({
      required_error: 'Kata sandi baru wajib diisi',
    }).min(6, 'Kata sandi baru minimal 6 karakter'),
    confirmPassword: z.string({
      required_error: 'Konfirmasi kata sandi baru wajib diisi',
    }),
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Konfirmasi kata sandi tidak cocok dengan kata sandi baru',
    path: ['confirmPassword'],
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    newPassword: z.string({
      required_error: 'Kata sandi baru wajib diisi',
    }).min(6, 'Kata sandi baru minimal 6 karakter'),
  }),
});

export const registerSchema = z.object({
  body: z.object({
    fullName: z.string({ required_error: 'Nama lengkap wajib diisi' }).min(2, 'Nama minimal 2 karakter'),
    username: z.string({ required_error: 'Username wajib diisi' }).min(3, 'Username minimal 3 karakter').regex(/^[a-zA-Z0-9_]+$/, 'Username hanya boleh huruf, angka, dan underscore'),
    email: z.string({ required_error: 'Email wajib diisi' }).email('Format email tidak valid'),
    password: z.string({ required_error: 'Kata sandi wajib diisi' }).min(6, 'Kata sandi minimal 6 karakter'),
    phone: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    regionId: z.union([z.number(), z.string().regex(/^\d+$/).transform(Number)]).optional().nullable(),
  }),
});

