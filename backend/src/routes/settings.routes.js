import { Router } from 'express';
import { SettingsController } from '../controllers/settings.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { isSuperAdmin } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { upload } from '../utils/upload.js';
import {
  createCategorySchema,
  updateCategorySchema,
  createCustomFieldSchema,
  updateCustomFieldSchema,
  updateOrgSettingsSchema,
} from '../validators/settings.validator.js';

const router = Router();

// Public Routes (Untuk Halaman Landing / Login / Pendaftaran tanpa perlu otentikasi)
router.get('/public-sliders', SettingsController.getSliders);
router.get('/public-branding', SettingsController.getPublicBranding);

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Settings
 *   description: Manajemen Kategori, Custom Fields Dinamis, Branding Organisasi, dan Slider Foto
 */

// Sliders (Admin)
router.get('/sliders', isSuperAdmin, SettingsController.getSliders);
router.post('/sliders', isSuperAdmin, upload.single('image'), SettingsController.addSlider);
router.delete('/sliders/:id', isSuperAdmin, SettingsController.deleteSlider);
router.put('/sliders', isSuperAdmin, SettingsController.updateSliders);

// Categories
router.get('/categories', SettingsController.getCategories);
router.post('/categories', isSuperAdmin, validate(createCategorySchema), SettingsController.createCategory);
router.put('/categories/:id', isSuperAdmin, validate(updateCategorySchema), SettingsController.updateCategory);
router.delete('/categories/:id', isSuperAdmin, SettingsController.deleteCategory);

// Custom Fields
router.get('/custom-fields', SettingsController.getCustomFields);
router.post('/custom-fields', isSuperAdmin, validate(createCustomFieldSchema), SettingsController.createCustomField);
router.put('/custom-fields/:id', isSuperAdmin, validate(updateCustomFieldSchema), SettingsController.updateCustomField);
router.delete('/custom-fields/:id', isSuperAdmin, SettingsController.deleteCustomField);

// Organization & Branding
router.get('/organization', SettingsController.getOrganizationSettings);
router.put('/organization', isSuperAdmin, validate(updateOrgSettingsSchema), SettingsController.updateOrganizationSettings);
router.post('/organization/logo', isSuperAdmin, upload.single('logo'), SettingsController.uploadLogo);

// Duty Assignments Matrix (Wilayah & Penugasan)
router.get('/duty-assignments', SettingsController.getDutyAssignments);
router.put('/duty-assignments', isSuperAdmin, SettingsController.updateDutyAssignments);

// Reset Database Operasional (Super Admin Only)
router.post('/reset-database', isSuperAdmin, SettingsController.resetDatabase);

export default router;

