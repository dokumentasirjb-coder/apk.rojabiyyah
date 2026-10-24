import { z } from 'zod';

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Nama kategori wajib diisi' }).min(2, 'Nama minimal 2 karakter'),
    type: z.enum(['INVENTORY', 'TRANSACTION_INCOME', 'TRANSACTION_EXPENSE', 'TASK_POINT'], {
      required_error: 'Tipe kategori wajib dipilih',
    }),
    description: z.string().optional().nullable(),
  }),
});

export const updateCategorySchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID harus berupa angka'),
  }),
  body: z.object({
    name: z.string().min(2, 'Nama minimal 2 karakter').optional(),
    type: z.enum(['INVENTORY', 'TRANSACTION_INCOME', 'TRANSACTION_EXPENSE', 'TASK_POINT']).optional(),
    description: z.string().optional().nullable(),
  }),
});

export const createCustomFieldSchema = z.object({
  body: z.object({
    module: z.enum(['INVENTORY', 'MEMBER', 'TASK_POINT', 'LOAN', 'TRANSACTION'], {
      required_error: 'Modul wajib dipilih',
    }),
    fieldName: z.string({ required_error: 'Nama field unik wajib diisi' }).regex(/^[a-z0-9_]+$/, 'Hanya huruf kecil, angka, dan underscore'),
    fieldLabel: z.string({ required_error: 'Label field wajib diisi' }).min(2),
    fieldType: z.enum(['TEXT', 'NUMBER', 'SELECT', 'DATE', 'TEXTAREA']).default('TEXT'),
    options: z.any().optional().nullable(),
    isRequired: z.boolean().default(false),
  }),
});

export const updateCustomFieldSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID harus berupa angka'),
  }),
  body: z.object({
    fieldLabel: z.string().min(2).optional(),
    fieldType: z.enum(['TEXT', 'NUMBER', 'SELECT', 'DATE', 'TEXTAREA']).optional(),
    options: z.any().optional().nullable(),
    isRequired: z.boolean().optional(),
  }),
});

export const updateOrgSettingsSchema = z.object({
  body: z.object({
    orgName: z.string().min(2).optional(),
    orgTagline: z.string().optional().nullable(),
    logoUrl: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    contactPhone: z.string().optional().nullable(),
    contactEmail: z.string().email('Format email tidak valid').optional().nullable(),
    themeConfig: z.any().optional(),
    branding: z.object({
      appName: z.string().optional(),
      appSubtitle: z.string().optional(),
      logoUrl: z.string().optional().nullable(),
      subTheme: z.string().optional(),
      heroTitlePrefix: z.string().optional(),
      heroTitleHighlight: z.string().optional(),
      footerText: z.string().optional(),
      kopNama: z.string().optional(),
      kopSubtitle: z.string().optional(),
      kopSubtitleSingkat: z.string().optional(),
      googleDriveUrl: z.string().optional(),
    }).optional(),
  }),
});

