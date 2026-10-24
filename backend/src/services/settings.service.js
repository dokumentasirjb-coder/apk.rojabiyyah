import prisma from '../config/prisma.js';
import { AppError } from '../middlewares/error.middleware.js';

export class SettingsService {
  // --- Category Settings ---
  static async getCategories({ type }) {
    const where = {};
    if (type) where.type = type;
    return await prisma.category.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  static async createCategory(data) {
    const exists = await prisma.category.findFirst({
      where: { name: data.name, type: data.type },
    });
    if (exists) {
      throw new AppError(`Kategori '${data.name}' untuk tipe ${data.type} sudah ada`, 400);
    }
    return await prisma.category.create({ data });
  }

  static async updateCategory(id, data) {
    const exists = await prisma.category.findUnique({ where: { id: parseInt(id) } });
    if (!exists) throw new AppError('Kategori tidak ditemukan', 404);
    return await prisma.category.update({
      where: { id: parseInt(id) },
      data,
    });
  }

  static async deleteCategory(id) {
    const exists = await prisma.category.findUnique({ where: { id: parseInt(id) } });
    if (!exists) throw new AppError('Kategori tidak ditemukan', 404);
    return await prisma.category.delete({
      where: { id: parseInt(id) },
    });
  }

  // --- Custom Fields Settings ---
  static async getCustomFields({ module }) {
    const where = {};
    if (module) where.module = module;
    return await prisma.customField.findMany({
      where,
      orderBy: { id: 'asc' },
    });
  }

  static async createCustomField(data) {
    const exists = await prisma.customField.findFirst({
      where: { name: data.name, module: data.module },
    });
    if (exists) {
      throw new AppError(`Custom field '${data.name}' pada modul ${data.module} sudah ada`, 400);
    }
    return await prisma.customField.create({ data });
  }

  static async updateCustomField(id, data) {
    const exists = await prisma.customField.findUnique({ where: { id: parseInt(id) } });
    if (!exists) throw new AppError('Custom field tidak ditemukan', 404);
    return await prisma.customField.update({
      where: { id: parseInt(id) },
      data,
    });
  }

  static async deleteCustomField(id) {
    const exists = await prisma.customField.findUnique({ where: { id: parseInt(id) } });
    if (!exists) throw new AppError('Custom field tidak ditemukan', 404);
    return await prisma.customField.delete({
      where: { id: parseInt(id) },
    });
  }

  // --- Organization & Branding Settings ---
  static getDefaultBranding() {
    return {
      appName: 'Administrasi Rojabiyyah 2026',
      appSubtitle: 'Haul Ke-5 & Logistik Terpadu',
      logoUrl: '/logo-rojabiyyah.png',
      subTheme: 'Haul ke-5 Al-Maghfurlah K.H. Moch. Djamaluddin Achmad & Rojabiyyah 2026',
      heroTitlePrefix: 'Aplikasi Administrasi',
      heroTitleHighlight: 'Haul Ke-5 & Rojabiyyah 2026',
      footerText: '© 2026 Aplikasi Administrasi Haul Ke-5 & Rojabiyyah 2026.',
      kopNama: 'ADMINISTRASI ROJABIYYAAH 2026 • LOGISTIK',
      kopSubtitle: 'Haul ke-5 Al-Maghfurlah K.H. Moch. Djamaluddin Achmad & Rojabiyyah 2026',
      kopSubtitleSingkat: 'Haul Ke-5 & Rojabiyyah 2026',
      googleDriveUrl: 'https://drive.google.com/drive/folders/1l91WsFBV_sZ89DlvzvSXlgedX0pOwsfa?usp=sharing',
    };
  }

  static async getOrganizationSettings() {
    let settings = await prisma.organizationSetting.findFirst();
    if (!settings) {
      settings = await prisma.organizationSetting.create({
        data: {
          orgName: 'Administrasi Rojabiyyah 2026',
          orgTagline: 'Haul Ke-5 & Logistik Terpadu',
          logoUrl: '/logo-rojabiyyah.png',
        },
      });
    }

    const themeConfig = settings.themeConfig || {};
    const storedBranding = themeConfig.branding || {};
    const defaultBranding = this.getDefaultBranding();

    const mergedBranding = {
      ...defaultBranding,
      ...storedBranding,
      appName: storedBranding.appName || settings.orgName || defaultBranding.appName,
      appSubtitle: storedBranding.appSubtitle || settings.orgTagline || defaultBranding.appSubtitle,
      logoUrl: storedBranding.logoUrl || settings.logoUrl || defaultBranding.logoUrl,
    };

    return {
      ...settings,
      branding: mergedBranding,
    };
  }

  static async getPublicBranding() {
    const org = await this.getOrganizationSettings();
    return org.branding || this.getDefaultBranding();
  }

  static async updateOrganizationSettings(data) {
    let settings = await prisma.organizationSetting.findFirst();
    if (!settings) {
      settings = await prisma.organizationSetting.create({
        data: {
          orgName: data.orgName || 'Administrasi Rojabiyyah 2026',
          orgTagline: data.orgTagline || 'Haul Ke-5 & Logistik Terpadu',
          logoUrl: data.logoUrl || '/logo-rojabiyyah.png',
        },
      });
    }

    const currentTheme = settings.themeConfig || {};
    let updatedTheme = { ...currentTheme };

    let updatePayload = {};

    if (data.branding) {
      const currentBranding = currentTheme.branding || this.getDefaultBranding();
      const newBranding = {
        ...currentBranding,
        ...data.branding,
      };
      updatedTheme.branding = newBranding;

      updatePayload.orgName = newBranding.appName || settings.orgName;
      updatePayload.orgTagline = newBranding.appSubtitle || settings.orgTagline;
      updatePayload.logoUrl = newBranding.logoUrl || settings.logoUrl;
    }

    if (data.orgName) updatePayload.orgName = data.orgName;
    if (data.orgTagline !== undefined) updatePayload.orgTagline = data.orgTagline;
    if (data.logoUrl !== undefined) updatePayload.logoUrl = data.logoUrl;
    if (data.address !== undefined) updatePayload.address = data.address;
    if (data.contactPhone !== undefined) updatePayload.contactPhone = data.contactPhone;
    if (data.contactEmail !== undefined) updatePayload.contactEmail = data.contactEmail;
    if (data.themeConfig) {
      updatedTheme = { ...updatedTheme, ...data.themeConfig };
    }

    updatePayload.themeConfig = updatedTheme;

    const updated = await prisma.organizationSetting.update({
      where: { id: settings.id },
      data: updatePayload,
    });

    return {
      ...updated,
      branding: updatedTheme.branding || this.getDefaultBranding(),
    };
  }

  static async uploadLogo(file) {
    const logoUrl = `/uploads/${file.filename}`;
    let settings = await prisma.organizationSetting.findFirst();
    if (!settings) {
      settings = await prisma.organizationSetting.create({
        data: {
          orgName: 'Administrasi Rojabiyyah 2026',
          orgTagline: 'Haul Ke-5 & Logistik Terpadu',
          logoUrl,
        },
      });
    }

    const currentTheme = settings.themeConfig || {};
    const currentBranding = currentTheme.branding || this.getDefaultBranding();
    currentBranding.logoUrl = logoUrl;
    currentTheme.branding = currentBranding;

    await prisma.organizationSetting.update({
      where: { id: settings.id },
      data: {
        logoUrl,
        themeConfig: currentTheme,
      },
    });

    return { logoUrl, branding: currentBranding };
  }

  // --- Slider / Banner Settings ---
  static async getSliders() {
    const org = await this.getOrganizationSettings();
    const themeConfig = org.themeConfig || {};
    const banners = themeConfig.sliderBanners || [];

    if (banners.length === 0) {
      return [
        {
          id: 'default-1',
          title: 'Haul ke-5 Al-Maghfurlah K.H. Moch. Djamaluddin Achmad & Rojabiyyah 2026',
          subtitle: 'Meneladani Jejak Perjuangan, Mempererat Ukhuwah, dan Menjaga Amanah Kebersamaan',
          imageUrl: 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&w=1600&q=80',
          order: 1,
          isActive: true,
        },
        {
          id: 'default-2',
          title: 'Sistem Logistik & Inventaris Terpadu',
          subtitle: 'Manajemen peralatan, audio visual, cetak stiker barcode & surat jalan resmi',
          imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1600&q=80',
          order: 2,
          isActive: true,
        },
        {
          id: 'default-3',
          title: 'Pendaftaran Anggota & Penugasan Panitia',
          subtitle: 'Formulir pendaftaran mandiri terbuka tanpa mewajibkan akun login',
          imageUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1600&q=80',
          order: 3,
          isActive: true,
        },
      ];
    }

    return banners.sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  static async addSlider({ title, subtitle, imageUrl, order = 0 }) {
    const org = await this.getOrganizationSettings();
    const themeConfig = org.themeConfig || {};
    const banners = themeConfig.sliderBanners || [];

    const newBanner = {
      id: `slide_${Date.now()}`,
      title: title || '',
      subtitle: subtitle || '',
      imageUrl,
      order: parseInt(order) || banners.length + 1,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    banners.push(newBanner);
    themeConfig.sliderBanners = banners;

    await prisma.organizationSetting.update({
      where: { id: org.id },
      data: { themeConfig },
    });

    return newBanner;
  }

  static async deleteSlider(sliderId) {
    const org = await this.getOrganizationSettings();
    const themeConfig = org.themeConfig || {};
    let banners = themeConfig.sliderBanners || [];

    banners = banners.filter((b) => String(b.id) !== String(sliderId));
    themeConfig.sliderBanners = banners;

    await prisma.organizationSetting.update({
      where: { id: org.id },
      data: { themeConfig },
    });

    return { success: true };
  }

  static async updateSliders(newBanners) {
    const org = await this.getOrganizationSettings();
    const themeConfig = org.themeConfig || {};
    themeConfig.sliderBanners = newBanners;

    await prisma.organizationSetting.update({
      where: { id: org.id },
      data: { themeConfig },
    });

    return newBanners;
  }

  // --- Pembagian Wilayah & Penugasan (Duty Assignments Matrix) ---
  static getDefaultDutyAssignments() {
    return {
      projectorAssignments: [
        { id: 'p-1', group: 'Titik A', titikGroup: 'Titik A', titik: 'Titik A', kode: 'Titik A', wilayah: 'Serambi Masjid & Kantor Al-Muhibbin', korwil: 'M. Mufti Zuchaily', operator: 'Alfani Ramadhani', lcdNdalem: 'Ndalem Al-Mardhiyah', proyektorNo: 'Proyektor 1', petugasProyektor: 'Ahmad Anggota', petugasKabel: 'M. Mufti Zuchaily', notes: 'Posko Wilayah Titik A' },
        { id: 'p-2', group: 'Titik A', titikGroup: 'Titik A', titik: 'LCD Khufad', kode: 'LCD', wilayah: 'Khufad', korwil: 'M. Mufti Zuchaily', operator: 'Alfani Ramadhani', lcdNdalem: 'Khufad', proyektorNo: '-', petugasProyektor: '', petugasKabel: 'Alfani Ramadhani', notes: 'Layar LCD Ndalem' },
        { id: 'p-3', group: 'Titik A', titikGroup: 'Titik A', titik: 'LCD Al-Muhibbin', kode: 'LCD', wilayah: 'Ndalem Al-Muhibbin', korwil: 'M. Mufti Zuchaily', operator: 'Alfani Ramadhani', lcdNdalem: 'Ndalem Al-Muhibbin', proyektorNo: '-', petugasProyektor: '', petugasKabel: '', notes: 'Layar LCD Ndalem' },
        { id: 'p-4', group: 'Titik A', titikGroup: 'Titik A', titik: 'Proyektor 1', kode: 'Proyektor 1', wilayah: 'Kantor Al-Muhibbin', korwil: 'M. Mufti Zuchaily', operator: 'Alfani Ramadhani', lcdNdalem: '-', proyektorNo: 'Proyektor 1', petugasProyektor: '', petugasKabel: '', notes: 'Proyektor 1' },
        { id: 'p-5', group: 'Titik B', titikGroup: 'Titik B', titik: 'Titik B', kode: 'Titik B', wilayah: 'Masjid Al-Muhibbin & Sekitar', korwil: 'Akhsanul Khakim', operator: 'Alfani Ramadhani', lcdNdalem: '-', proyektorNo: 'Proyektor 2', petugasProyektor: 'Akhsanul Khakim', petugasKabel: 'M. Mufti Zuchaily', notes: 'Posko Wilayah Titik B' },
        { id: 'p-6', group: 'Titik B', titikGroup: 'Titik B', titik: 'Proyektor 2', kode: 'Proyektor 2', wilayah: 'Serambi Masjid Selatan', korwil: 'Akhsanul Khakim', operator: 'Alfani Ramadhani', lcdNdalem: '-', proyektorNo: 'Proyektor 2', petugasProyektor: 'M. Dakwa Addaroin', petugasKabel: 'Alfani Ramadhani', notes: 'Proyektor 2' },
        { id: 'p-7', group: 'Titik B', titikGroup: 'Titik B', titik: 'Proyektor 3', kode: 'Proyektor 3', wilayah: 'Dalam Masjid', korwil: 'Akhsanul Khakim', operator: '', lcdNdalem: '-', proyektorNo: 'Proyektor 3', petugasProyektor: 'M. Bilya', petugasKabel: '', notes: 'Proyektor 3' },
        { id: 'p-8', group: 'Titik B', titikGroup: 'Titik B', titik: 'Proyektor 4', kode: 'Proyektor 4', wilayah: 'Serambi Masjid Utara', korwil: 'Akhsanul Khakim', operator: '', lcdNdalem: '-', proyektorNo: 'Proyektor 4', petugasProyektor: 'Rehan Faiz', petugasKabel: '', notes: 'Proyektor 4' },
        { id: 'p-9', group: 'Titik B', titikGroup: 'Titik B', titik: 'Proyektor 5', kode: 'Proyektor 5', wilayah: 'Serambi Masjid Timur', korwil: 'Akhsanul Khakim', operator: '', lcdNdalem: '-', proyektorNo: 'Proyektor 5', petugasProyektor: 'Gempur Joko Sasmito', petugasKabel: '', notes: 'Proyektor 5' },
        { id: 'p-10', group: 'Titik B', titikGroup: 'Titik B', titik: 'Proyektor 6', kode: 'Proyektor 6', wilayah: 'Kanopi', korwil: 'Akhsanul Khakim', operator: '', lcdNdalem: '-', proyektorNo: 'Proyektor 6', petugasProyektor: '', petugasKabel: '', notes: 'Proyektor 6' },
        { id: 'p-11', group: 'Titik B', titikGroup: 'Titik B', titik: 'Proyektor 7', kode: 'Proyektor 7', wilayah: 'Depan Hanafi', korwil: 'Akhsanul Khakim', operator: '', lcdNdalem: '-', proyektorNo: 'Proyektor 7', petugasProyektor: '', petugasKabel: '', notes: 'Proyektor 7' },
        { id: 'p-12', group: 'Titik C', titikGroup: 'Titik C', titik: 'Titik C', kode: 'Titik C', wilayah: 'Gedung MTs Fattah Hasyim', korwil: 'Nauval Hanif', operator: "Zidane Ni'ami Akbar", lcdNdalem: '-', proyektorNo: 'Proyektor 8', petugasProyektor: 'Nauval Hanif', petugasKabel: "Zidane Ni'ami Akbar", notes: 'Posko Wilayah Titik C' },
        { id: 'p-13', group: 'Titik C', titikGroup: 'Titik C', titik: 'Proyektor 8', kode: 'Proyektor 8', wilayah: 'MTs FH lt 1', korwil: 'Nauval Hanif', operator: "Zidane Ni'ami Akbar", lcdNdalem: '-', proyektorNo: 'Proyektor 8', petugasProyektor: 'Nauval Hanif', petugasKabel: 'Tata Latando Wahyudi', notes: 'Proyektor 8' },
        { id: 'p-14', group: 'Titik C', titikGroup: 'Titik C', titik: 'Proyektor 9', kode: 'Proyektor 9', wilayah: 'MTs FH lt 2', korwil: 'Nauval Hanif', operator: '', lcdNdalem: '-', proyektorNo: 'Proyektor 9', petugasProyektor: 'M. Salman Al-Farisi', petugasKabel: '', notes: 'Proyektor 9' },
        { id: 'p-15', group: 'Titik C', titikGroup: 'Titik C', titik: 'Proyektor 10', kode: 'Proyektor 10', wilayah: 'MTs FH lt 3', korwil: 'Nauval Hanif', operator: '', lcdNdalem: '-', proyektorNo: 'Proyektor 10', petugasProyektor: '', petugasKabel: '', notes: 'Proyektor 10' },
        { id: 'p-16', group: 'Titik D', titikGroup: 'Titik D', titik: 'Titik D', kode: 'Titik D', wilayah: 'Gedung MA Fattah Hasyim & Sekitar', korwil: 'Muhammad Mujtaba', operator: 'M. Farid Syafiqur R.', lcdNdalem: '-', proyektorNo: 'Proyektor 11', petugasProyektor: 'Muhammad Mujtaba', petugasKabel: 'M. Farid Syafiqur R.', notes: 'Posko Wilayah Titik D' },
        { id: 'p-17', group: 'Titik D', titikGroup: 'Titik D', titik: 'Proyektor 11', kode: 'Proyektor 11', wilayah: 'MA FH lt 2', korwil: 'Muhammad Mujtaba', operator: '', lcdNdalem: '-', proyektorNo: 'Proyektor 11', petugasProyektor: 'Faza Ahmad', petugasKabel: 'M. Favian Rizal', notes: 'Proyektor 11' },
        { id: 'p-18', group: 'Titik D', titikGroup: 'Titik D', titik: 'Proyektor 12', kode: 'Proyektor 12', wilayah: 'MA FH lt 3', korwil: 'Muhammad Mujtaba', operator: '', lcdNdalem: '-', proyektorNo: 'Proyektor 12', petugasProyektor: 'M. Nur Asyyifa', petugasKabel: 'M. Anwar Anas', notes: 'Proyektor 12' },
        { id: 'p-19', group: 'Titik D', titikGroup: 'Titik D', titik: 'Proyektor 13', kode: 'Proyektor 13', wilayah: 'MA FH lt 4', korwil: 'Muhammad Mujtaba', operator: '', lcdNdalem: '-', proyektorNo: 'Proyektor 13', petugasProyektor: 'Habib Amrullah Aziz', petugasKabel: '', notes: 'Proyektor 13' },
        { id: 'p-20', group: 'Titik D', titikGroup: 'Titik D', titik: 'Proyektor 14', kode: 'Proyektor 14', wilayah: 'Timur Gerbang Al-Muhibbin', korwil: 'Muhammad Mujtaba', operator: '', lcdNdalem: '-', proyektorNo: 'Proyektor 14', petugasProyektor: 'Muhammad Mujtaba', petugasKabel: '', notes: 'Proyektor 14' },
        { id: 'p-21', group: 'Titik D', titikGroup: 'Titik D', titik: 'Proyektor 15', kode: 'Proyektor 15', wilayah: 'Timur Bentowak', korwil: 'Muhammad Mujtaba', operator: '', lcdNdalem: '-', proyektorNo: 'Proyektor 15', petugasProyektor: 'Mubarok Ramadhani', petugasKabel: '', notes: 'Proyektor 15' },
        { id: 'p-22', group: 'Titik E', titikGroup: 'Titik E', titik: 'Titik E', kode: 'Titik E', wilayah: 'Area Kampus & Sekitar', korwil: 'Gempur Joko Sasmito', operator: 'M. Albiya Riftanusa', lcdNdalem: '-', proyektorNo: 'Proyektor 16', petugasProyektor: 'Gempur Joko Sasmito', petugasKabel: 'M. Albiya Riftanusa', notes: 'Posko Wilayah Titik E' },
        { id: 'p-23', group: 'Titik E', titikGroup: 'Titik E', titik: 'Proyektor 16', kode: 'Proyektor 16', wilayah: 'Halaman Kampus', korwil: 'Gempur Joko Sasmito', operator: '', lcdNdalem: '-', proyektorNo: 'Proyektor 16', petugasProyektor: 'Muhammad Sholah Muzakky', petugasKabel: 'Mikayla Fachri Maulidy', notes: 'Proyektor 16' },
        { id: 'p-24', group: 'Titik E', titikGroup: 'Titik E', titik: 'Proyektor 17', kode: 'Proyektor 17', wilayah: 'Timur Kantor Rektor', korwil: 'Gempur Joko Sasmito', operator: '', lcdNdalem: '-', proyektorNo: 'Proyektor 17', petugasProyektor: 'M. Lutfi Habibi Maliki', petugasKabel: 'Saiful Ibrahim', notes: 'Proyektor 17' },
        { id: 'p-25', group: 'Titik E', titikGroup: 'Titik E', titik: 'Proyektor 18', kode: 'Proyektor 18', wilayah: 'Depan Gudang Kampus', korwil: 'Gempur Joko Sasmito', operator: '', lcdNdalem: '-', proyektorNo: 'Proyektor 18', petugasProyektor: 'Raffi Ahmad Baihaqi', petugasKabel: '', notes: 'Proyektor 18' },
        { id: 'p-26', group: 'Titik E', titikGroup: 'Titik E', titik: 'Proyektor 19', kode: 'Proyektor 19', wilayah: 'Halaman Barat Bu Mun', korwil: 'Gempur Joko Sasmito', operator: '', lcdNdalem: '-', proyektorNo: 'Proyektor 19', petugasProyektor: 'Ahmad Faizal Alwi', petugasKabel: '', notes: 'Proyektor 19' },
        { id: 'p-27', group: 'Titik E', titikGroup: 'Titik E', titik: 'Proyektor 20', kode: 'Proyektor 20', wilayah: 'Halaman Timur Bu Mun', korwil: 'Gempur Joko Sasmito', operator: '', lcdNdalem: '-', proyektorNo: 'Proyektor 20', petugasProyektor: '', petugasKabel: '', notes: 'Proyektor 20' },
        { id: 'p-28', group: 'Titik F', titikGroup: 'Titik F', titik: 'Titik F', kode: 'Titik F', wilayah: 'Area Putri & Pondok Sekitar', korwil: 'Athaka Ari Tian', operator: 'Ach. Firmansyah', lcdNdalem: '-', proyektorNo: 'Proyektor 21', petugasProyektor: 'Athaka Ari Tian', petugasKabel: 'Ach. Firmansyah', notes: 'Posko Wilayah Titik F' },
        { id: 'p-29', group: 'Titik F', titikGroup: 'Titik F', titik: 'Proyektor 21', kode: 'Proyektor 21', wilayah: 'Halaman FH PI', korwil: 'Athaka Ari Tian', operator: '', lcdNdalem: '-', proyektorNo: 'Proyektor 21', petugasProyektor: 'Fahri Zanuari Anugrah', petugasKabel: '', notes: 'Proyektor 21' },
        { id: 'p-30', group: 'Titik F', titikGroup: 'Titik F', titik: 'Proyektor 22', kode: 'Proyektor 22', wilayah: 'Halaman Al-Muhibbin Putri 2', korwil: 'Athaka Ari Tian', operator: '', lcdNdalem: '-', proyektorNo: 'Proyektor 22', petugasProyektor: '', petugasKabel: '', notes: 'Proyektor 22' },
        { id: 'p-31', group: 'Titik F', titikGroup: 'Titik F', titik: 'Proyektor 23', kode: 'Proyektor 23', wilayah: 'Halaman Al-Mardliyah 2', korwil: 'Athaka Ari Tian', operator: '', lcdNdalem: '-', proyektorNo: 'Proyektor 23', petugasProyektor: '', petugasKabel: '', notes: 'Proyektor 23' },
      ],
      mediaAssignments: [
        { id: 'm-1', hari: 'Rabu', tanggal: '2026-01-28', jam: '08:00 - 11:30 WIB', waktu: 'Pagi', momen: 'Santunan Fakir Miskin', area: 'Kanopi', wilayah: 'Kanopi', fotografer: '', videografer: '', shortVideo: '', notes: 'Santunan Fakir Miskin Pagi' },
        { id: 'm-2', hari: 'Rabu', tanggal: '2026-01-28', jam: '09:00 - 12:00 WIB', waktu: 'Pagi', momen: 'Santunan', area: 'Cangkring', wilayah: 'Cangkring', fotografer: 'M. Nabil Fatich', videografer: '', shortVideo: '', notes: '' },
        { id: 'm-3', hari: 'Rabu', tanggal: '2026-01-28', jam: '06:00 - 10:00 WIB', waktu: 'Pagi', momen: 'Masak-masak', area: 'Dapur Muhibbin', wilayah: 'Dapur Muhibbin', fotografer: "Syafi'i", videografer: '', shortVideo: '', notes: 'Dokumentasi Dapur Al-Muhibbin' },
        { id: 'm-4', hari: 'Rabu', tanggal: '2026-01-28', jam: '09:30 - 12:00 WIB', waktu: 'Pagi', momen: 'Santunan', area: 'TPQ Al-Fattah', wilayah: 'TPQ Al-Fattah', fotografer: '', videografer: '', shortVideo: '', notes: '' },
        { id: 'm-5', hari: 'Rabu', tanggal: '2026-01-28', jam: '08:30 - 11:30 WIB', waktu: 'Pagi', momen: 'Santunan', area: 'Masjid Al-Muhibbin', wilayah: 'Masjid Al-Muhibbin', fotografer: '', videografer: 'Posisi Tengah', shortVideo: 'M. Akmalul Islam', notes: 'Shooting & Kameramen' },
        { id: 'm-6', hari: 'Rabu', tanggal: '2026-01-28', jam: '19:30 - 23:30 WIB', waktu: 'Malam', momen: 'ISHARI', area: 'Masjid Al-Muhibbin', wilayah: 'Masjid Al-Muhibbin', fotografer: '', videografer: 'Posisi Tengah', shortVideo: '', notes: 'Malam Pembukaan ISHARI' },
        { id: 'm-7', hari: 'Kamis', tanggal: '2026-01-29', jam: '06:00 - 11:30 WIB', waktu: 'Pagi', momen: 'Khotmil Quran', area: 'Maqbarah Mbah Djamal', wilayah: 'Maqbarah Mbah Djamal', fotografer: 'Fitri Amalia Zahra, Vinesya Ahmad', videografer: '', shortVideo: '', notes: '' },
        { id: 'm-8', hari: 'Kamis', tanggal: '2026-01-29', jam: '06:00 - 11:30 WIB', waktu: 'Pagi', momen: 'Khotmil Quran', area: 'Maqbarah Mbah Fattah', wilayah: 'Maqbarah Mbah Fattah', fotografer: 'Alya Mahrusah, Nazwa Aghnia', videografer: '', shortVideo: '', notes: '' },
        { id: 'm-9', hari: 'Kamis', tanggal: '2026-01-29', jam: '06:00 - 11:30 WIB', waktu: 'Pagi', momen: 'Khotmil Quran', area: 'Maqbarah Mbah Wahab', wilayah: 'Maqbarah Mbah Wahab', fotografer: '', videografer: '', shortVideo: '', notes: '' },
        { id: 'm-10', hari: 'Kamis', tanggal: '2026-01-29', jam: '06:00 - 11:30 WIB', waktu: 'Pagi', momen: 'Khotmil Quran', area: 'Maqbarah Mbah Usman', wilayah: 'Maqbarah Mbah Usman', fotografer: '', videografer: '', shortVideo: '', notes: '' },
        { id: 'm-11', hari: 'Kamis', tanggal: '2026-01-29', jam: '06:00 - 11:30 WIB', waktu: 'Pagi', momen: 'Khotmil Quran', area: 'Maqbarah Mbah Hamid', wilayah: 'Maqbarah Mbah Hamid', fotografer: '', videografer: '', shortVideo: '', notes: '' },
        { id: 'm-12', hari: 'Kamis', tanggal: '2026-01-29', jam: '06:00 - 11:30 WIB', waktu: 'Pagi', momen: 'Khotmil Quran', area: 'Masjid Al-Muhibbin', wilayah: 'Masjid Al-Muhibbin', fotografer: '', videografer: '', shortVideo: '', notes: '' },
        { id: 'm-13', hari: 'Kamis', tanggal: '2026-01-29', jam: '06:00 - 11:30 WIB', waktu: 'Pagi', momen: 'Khotmil Quran', area: 'Mushollah Al-Fattah & TPQ', wilayah: 'Mushollah Al-Fattah & TPQ', fotografer: '', videografer: '', shortVideo: '', notes: '' },
        { id: 'm-14', hari: 'Kamis', tanggal: '2026-01-29', jam: '12:00 - 15:00 WIB', waktu: 'Siang', momen: 'Prasmanan', area: 'FH Putra', wilayah: 'FH Putra', fotografer: '', videografer: '', shortVideo: '', notes: '' },
        { id: 'm-15', hari: 'Kamis', tanggal: '2026-01-29', jam: '13:00 - 17:00 WIB', waktu: 'Siang', momen: 'Back Up Lapangan', area: 'Kondisional', wilayah: 'Kondisional', fotografer: '', videografer: '', shortVideo: 'Jazeera Azkahaiy Aghna Fauzi', notes: 'Back Up Liputan Lapangan' },
        { id: 'm-16', hari: 'Kamis', tanggal: '2026-01-29', jam: '19:00 - Selesai', waktu: 'Malam', momen: 'Pengajian Umum', area: 'Panggung Utama & Halaman', wilayah: 'Panggung Utama & Halaman', fotografer: 'Nidhom Fahmi', videografer: 'Abdul Hakim', shortVideo: 'Muhammad Afwan Imamul M. & Jazeera Azkahaiy Aghna Fauzi', notes: 'Malam Puncak Haul ke-5' },
        { id: 'm-17', hari: 'Kamis', tanggal: '2026-01-29', jam: '19:00 - Selesai', waktu: 'Malam', momen: 'Pengajian Umum', area: 'Halaman Al-Muhibbin', wilayah: 'Halaman Al-Muhibbin', fotografer: 'M. Habib Fath Al Rahman', videografer: 'Posisi Tengah', shortVideo: '', notes: 'Kameramen Posisi Tengah' },
        { id: 'm-18', hari: 'Kamis', tanggal: '2026-01-29', jam: '19:00 - Selesai', waktu: 'Malam', momen: 'Pengajian Umum', area: 'Depan Kantor Al-Muhibbin', wilayah: 'Depan Kantor Al-Muhibbin', fotografer: 'Hagana Idham Priasmana', videografer: 'Posisi Kanan', shortVideo: '', notes: 'Kameramen Posisi Kanan' },
        { id: 'm-19', hari: 'Kamis', tanggal: '2026-01-29', jam: '19:00 - Selesai', waktu: 'Malam', momen: 'Pengajian Umum', area: 'Masjid dan Kanopi', wilayah: 'Masjid dan Kanopi', fotografer: "Azzam Wahyu Mas’udin", videografer: 'Diaz Nanda Ilyasa', shortVideo: '', notes: 'Liputan Area Masjid' },
        { id: 'm-20', hari: 'Kamis', tanggal: '2026-01-29', jam: '19:00 - Selesai', waktu: 'Malam', momen: 'Pengajian Umum', area: 'Kampus & Timur Kampus', wilayah: 'Kampus & Timur Kampus', fotografer: 'Nabil Fatich', videografer: 'Posisi Kiri', shortVideo: '', notes: 'Kameramen Posisi Kiri' },
        { id: 'm-21', hari: 'Kamis', tanggal: '2026-01-29', jam: '19:00 - Selesai', waktu: 'Malam', momen: 'Pengajian Umum', area: 'Bentowak', wilayah: 'Bentowak', fotografer: 'Ridwan Saputra', videografer: 'Posisi Kanan', shortVideo: '', notes: 'Kameramen Posisi Kanan' },
        { id: 'm-22', hari: 'Kamis', tanggal: '2026-01-29', jam: '19:00 - Selesai', waktu: 'Malam', momen: 'Pengajian Umum', area: 'FH Putri; Mard 2; Mhbn PI', wilayah: 'FH Putri; Mard 2; Mhbn PI', fotografer: 'Maulida Khurriyatul Maghfiroh, Talita tazkiyah', videografer: '', shortVideo: '', notes: '' },
        { id: 'm-23', hari: 'Kamis', tanggal: '2026-01-29', jam: '19:00 - Selesai', waktu: 'Malam', momen: 'Pengajian Umum', area: 'Pondok Al-Munjid', wilayah: 'Pondok Al-Munjid', fotografer: 'Alya Mahrusah, Nazwa Aghnia', videografer: '', shortVideo: '', notes: '' },
      ],
    };
  }

  static async getDutyAssignments() {
    const org = await this.getOrganizationSettings();
    const themeConfig = org.themeConfig || {};
    const stored = themeConfig.dutyAssignments;
    if (stored && Array.isArray(stored.projectorAssignments) && Array.isArray(stored.mediaAssignments)) {
      return stored;
    }
    return this.getDefaultDutyAssignments();
  }

  static async updateDutyAssignments(payload) {
    const org = await this.getOrganizationSettings();
    const themeConfig = org.themeConfig || {};

    const updated = {
      projectorAssignments: Array.isArray(payload.projectorAssignments)
        ? payload.projectorAssignments
        : (themeConfig.dutyAssignments?.projectorAssignments || []),
      mediaAssignments: Array.isArray(payload.mediaAssignments)
        ? payload.mediaAssignments
        : (themeConfig.dutyAssignments?.mediaAssignments || []),
      updatedAt: new Date().toISOString(),
    };

    themeConfig.dutyAssignments = updated;

    await prisma.organizationSetting.update({
      where: { id: org.id },
      data: { themeConfig },
    });

    return updated;
  }

  // --- Reset Database Operasional ---
  static async resetDatabase(userId, options = {}) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'SUPER_ADMIN') {
      throw new AppError('Akses ditolak: Hanya Super Admin yang berhak mereset data', 403);
    }

    const {
      resetLoans = true,
      resetInventory = true,
      resetMembers = true,
      resetFinance = true,
      resetRegionControl = true,
      resetLogsAndNotifications = true,
      resetInstitutions = true,
      resetCategories = false,
    } = options;

    const report = {
      deletedLoans: 0,
      deletedInventory: 0,
      deletedMembers: 0,
      deletedTransactions: 0,
      deletedReports: 0,
      deletedInstitutions: 0,
      deletedLogs: 0,
    };

    // 1. Loans & Loan Items
    if (resetLoans) {
      await prisma.loanStatusLog.deleteMany();
      await prisma.loanItem.deleteMany();
      const res = await prisma.loan.deleteMany();
      report.deletedLoans = res.count;
    }

    // 2. Region Control (Reports, Task Points)
    if (resetRegionControl) {
      await prisma.reportMedia.deleteMany();
      const repRes = await prisma.fieldReport.deleteMany();
      await prisma.taskPoint.deleteMany();
      report.deletedReports = repRes.count;
    }

    // 3. Finance (Transactions)
    if (resetFinance) {
      const trxRes = await prisma.transaction.deleteMany();
      report.deletedTransactions = trxRes.count;
    }

    // 4. Inventory & Custom Field Values
    if (resetInventory) {
      await prisma.customFieldValue.deleteMany({
        where: { customField: { module: 'INVENTORY' } },
      });
      await prisma.loanItem.deleteMany();
      const invRes = await prisma.inventoryItem.deleteMany();
      report.deletedInventory = invRes.count;
    }

    // 5. Institutions
    if (resetInstitutions) {
      const instRes = await prisma.institution.deleteMany();
      report.deletedInstitutions = instRes.count;
    }

    // 6. Members & Non-Admin Accounts
    if (resetMembers) {
      await prisma.customFieldValue.deleteMany({
        where: { customField: { module: 'MEMBER' } },
      });
      const memRes = await prisma.member.deleteMany();
      report.deletedMembers = memRes.count;

      // Delete non-admin user accounts
      await prisma.user.deleteMany({
        where: {
          role: { not: 'SUPER_ADMIN' },
        },
      });
    }

    // 7. Activity Logs & Notifications
    if (resetLogsAndNotifications) {
      const logRes = await prisma.activityLog.deleteMany();
      await prisma.notification.deleteMany();
      report.deletedLogs = logRes.count;
    }

    // 8. Categories (if explicitly requested)
    if (resetCategories) {
      await prisma.category.deleteMany();
      await prisma.category.createMany({
        data: [
          { name: 'MULTIMEDIA & VISUAL', type: 'INVENTORY', description: 'Kamera, Lensa, Switcher, Tripod, Monitor' },
          { name: 'AUDIO & SOUND SYSTEM', type: 'INVENTORY', description: 'Mic Wireless, Mixer, Kabel XLR, Speaker' },
          { name: 'ALAT KOMUNIKASI & HT', type: 'INVENTORY', description: 'Handy Talky, Headset HT, Charger HT' },
          { name: 'INFRASTRUKTUR & PERKABELAN', type: 'INVENTORY', description: 'Kabel Listrik, Rol, HDMI, Splitter, SDI' },
          { name: 'INFAQ & SHODAQOH', type: 'TRANSACTION_INCOME', description: 'Pemasukan sukarela anggota & jamaah' },
          { name: 'KONSUMSI & LOGISTIK', type: 'TRANSACTION_EXPENSE', description: 'Pengeluaran makan, minum, dan operasional tim' },
        ],
      });
    }

    // Log the reset event
    try {
      await prisma.activityLog.create({
        data: {
          userId,
          action: 'RESET_DATABASE',
          module: 'SYSTEM',
          details: 'Super Admin mereset data operasional sistem',
        },
      });
    } catch (e) {
      console.warn('Gagal mencatat log aktivitas reset:', e.message);
    }

    return report;
  }
}
