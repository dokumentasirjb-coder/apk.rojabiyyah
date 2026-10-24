import { SettingsService } from '../services/settings.service.js';
import { sendSuccess } from '../utils/response.js';

export class SettingsController {
  // Category
  static async getCategories(req, res, next) {
    try {
      const { type } = req.query;
      const data = await SettingsService.getCategories({ type });
      return sendSuccess(res, { statusCode: 200, message: 'Daftar kategori berhasil dimuat', data });
    } catch (error) {
      next(error);
    }
  }

  static async createCategory(req, res, next) {
    try {
      const data = await SettingsService.createCategory(req.body);
      return sendSuccess(res, { statusCode: 201, message: 'Kategori berhasil dibuat', data });
    } catch (error) {
      next(error);
    }
  }

  static async updateCategory(req, res, next) {
    try {
      const data = await SettingsService.updateCategory(req.params.id, req.body);
      return sendSuccess(res, { statusCode: 200, message: 'Kategori berhasil diperbarui', data });
    } catch (error) {
      next(error);
    }
  }

  static async deleteCategory(req, res, next) {
    try {
      await SettingsService.deleteCategory(req.params.id);
      return sendSuccess(res, { statusCode: 200, message: 'Kategori berhasil dihapus' });
    } catch (error) {
      next(error);
    }
  }

  // Custom Fields
  static async getCustomFields(req, res, next) {
    try {
      const { module } = req.query;
      const data = await SettingsService.getCustomFields({ module });
      return sendSuccess(res, { statusCode: 200, message: 'Daftar custom fields berhasil dimuat', data });
    } catch (error) {
      next(error);
    }
  }

  static async createCustomField(req, res, next) {
    try {
      const data = await SettingsService.createCustomField(req.body);
      return sendSuccess(res, { statusCode: 201, message: 'Custom field berhasil dibuat', data });
    } catch (error) {
      next(error);
    }
  }

  static async updateCustomField(req, res, next) {
    try {
      const data = await SettingsService.updateCustomField(req.params.id, req.body);
      return sendSuccess(res, { statusCode: 200, message: 'Custom field berhasil diperbarui', data });
    } catch (error) {
      next(error);
    }
  }

  static async deleteCustomField(req, res, next) {
    try {
      await SettingsService.deleteCustomField(req.params.id);
      return sendSuccess(res, { statusCode: 200, message: 'Custom field berhasil dihapus' });
    } catch (error) {
      next(error);
    }
  }

  // Organization & Branding Settings
  static async getOrganizationSettings(req, res, next) {
    try {
      const data = await SettingsService.getOrganizationSettings();
      return sendSuccess(res, { statusCode: 200, message: 'Pengaturan organisasi & branding berhasil dimuat', data });
    } catch (error) {
      next(error);
    }
  }

  static async getPublicBranding(req, res, next) {
    try {
      const data = await SettingsService.getPublicBranding();
      return sendSuccess(res, { statusCode: 200, message: 'Branding publik berhasil dimuat', data });
    } catch (error) {
      next(error);
    }
  }

  static async updateOrganizationSettings(req, res, next) {
    try {
      const data = await SettingsService.updateOrganizationSettings(req.body);
      return sendSuccess(res, { statusCode: 200, message: 'Pengaturan organisasi & branding berhasil diperbarui', data });
    } catch (error) {
      next(error);
    }
  }

  static async uploadLogo(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'File gambar logo wajib diunggah' });
      }
      const data = await SettingsService.uploadLogo(req.file);
      return sendSuccess(res, { statusCode: 200, message: 'Logo organisasi berhasil diunggah', data });
    } catch (error) {
      next(error);
    }
  }

  // Sliders
  static async getSliders(req, res, next) {
    try {
      const data = await SettingsService.getSliders();
      return sendSuccess(res, { statusCode: 200, message: 'Daftar slider berhasil dimuat', data });
    } catch (error) {
      next(error);
    }
  }

  static async addSlider(req, res, next) {
    try {
      let imageUrl = req.body.imageUrl;
      if (req.file) {
        imageUrl = `/uploads/${req.file.filename}`;
      }
      if (!imageUrl) {
        return res.status(400).json({ success: false, message: 'File gambar atau URL foto wajib disertakan' });
      }

      const data = await SettingsService.addSlider({
        title: req.body.title,
        subtitle: req.body.subtitle,
        imageUrl,
        order: req.body.order,
      });

      return sendSuccess(res, { statusCode: 201, message: 'Foto slider berhasil ditambahkan', data });
    } catch (error) {
      next(error);
    }
  }

  static async deleteSlider(req, res, next) {
    try {
      await SettingsService.deleteSlider(req.params.id);
      return sendSuccess(res, { statusCode: 200, message: 'Foto slider berhasil dihapus' });
    } catch (error) {
      next(error);
    }
  }

  static async updateSliders(req, res, next) {
    try {
      const data = await SettingsService.updateSliders(req.body.sliders || req.body);
      return sendSuccess(res, { statusCode: 200, message: 'Susunan slider berhasil diperbarui', data });
    } catch (error) {
      next(error);
    }
  }

  // Duty Assignments Matrix
  static async getDutyAssignments(req, res, next) {
    try {
      const data = await SettingsService.getDutyAssignments();
      return sendSuccess(res, { statusCode: 200, message: 'Data pembagian penugasan wilayah berhasil dimuat', data });
    } catch (error) {
      next(error);
    }
  }

  static async updateDutyAssignments(req, res, next) {
    try {
      const data = await SettingsService.updateDutyAssignments(req.body);
      return sendSuccess(res, { statusCode: 200, message: 'Pembagian penugasan wilayah berhasil diperbarui', data });
    } catch (error) {
      next(error);
    }
  }

  // Reset Database Operasional
  static async resetDatabase(req, res, next) {
    try {
      const report = await SettingsService.resetDatabase(req.user.id, req.body);
      return sendSuccess(res, {
        statusCode: 200,
        message: 'Data operasional sistem berhasil dibersihkan / direset',
        data: report,
      });
    } catch (error) {
      next(error);
    }
  }
}

