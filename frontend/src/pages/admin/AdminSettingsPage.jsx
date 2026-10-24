import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings,
  Layers,
  MapPin,
  Building2,
  Sliders,
  Sparkles,
  Plus,
  Trash2,
  Save,
  CheckCircle,
  Upload,
  Image as ImageIcon,
  RotateCw,
  Eye,
  Check,
  AlertCircle,
  ExternalLink,
  ShieldAlert,
  Users,
  Download,
  FileText,
} from 'lucide-react';
import { Modal } from '../../components/ui/Modal.jsx';
import { ResetDataModal } from '../../components/admin/ResetDataModal.jsx';
import { useThemeStore } from '../../store/themeStore.js';
import api from '../../api/axios.js';

export const AdminSettingsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('org'); // Default to 'org' branding so user immediately sees it!
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const { branding, setBranding, fetchBranding } = useThemeStore();

  const [categories, setCategories] = useState([]);
  const [regions, setRegions] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [customFields, setCustomFields] = useState([]);

  // Full Organization & Branding State
  const [orgSettings, setOrgSettings] = useState({
    orgName: 'Administrasi Rojabiyyah 2026',
    orgTagline: 'Haul Ke-5 & Logistik Terpadu',
    logoUrl: '/logo-rojabiyyah.png',
    address: 'Bumi Damai Al-Muhibbin Tambakberas Jombang',
    contactPhone: '08123456789',
    contactEmail: 'sekretariat@rojabiyyaah.org',
  });

  const [brandingForm, setBrandingForm] = useState({
    appName: 'Administrasi Rojabiyyah 2026',
    appSubtitle: 'Haul Ke-5 & Logistik Terpadu',
    logoUrl: '/logo-rojabiyyah.png',
    subTheme: 'Haul ke-5 Al-Maghfurlah K.H. Moch. Djamaluddin Achmad & Rojabiyyah 2026',
    heroTitlePrefix: 'Aplikasi Administrasi',
    heroTitleHighlight: 'Haul Ke-5 & Rojabiyyah 2026',
    footerText: '© 2026 Aplikasi Administrasi Haul Ke-5 & Rojabiyyah 2026.',
    // Kop Dokumen Cetak
    kopNama: 'ADMINISTRASI ROJABIYYAAH 2026 • LOGISTIK',
    kopSubtitle: 'Haul ke-5 Al-Maghfurlah K.H. Moch. Djamaluddin Achmad & Rojabiyyah 2026',
    kopSubtitleSingkat: 'Haul Ke-5 & Rojabiyyah 2026',
    googleDriveUrl: 'https://drive.google.com/drive/folders/1l91WsFBV_sZ89DlvzvSXlgedX0pOwsfa?usp=sharing',
  });

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const logoInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New Category Form
  const [newCat, setNewCat] = useState({ name: '', type: 'INVENTORY', description: '' });

  // New Region Form
  const [newReg, setNewReg] = useState({ name: '', code: '', description: '' });

  // New Institution Form
  const [newInst, setNewInst] = useState({ name: '', contactPerson: '', phone: '', address: '' });

  // New Custom Field Form
  const [newCustomField, setNewCustomField] = useState({
    module: 'INVENTORY',
    fieldName: '',
    fieldLabel: '',
    fieldType: 'TEXT',
    isRequired: false,
  });

  const fetchAllSettings = async () => {
    try {
      setLoading(true);
      const [catsRes, regRes, instRes, cfRes, orgRes] = await Promise.all([
        api.get('/settings/categories'),
        api.get('/regions'),
        api.get('/institutions'),
        api.get('/settings/custom-fields'),
        api.get('/settings/organization'),
      ]);

      setCategories(catsRes.data.data || []);
      setRegions(regRes.data.data || []);
      setInstitutions(instRes.data.data || []);
      setCustomFields(cfRes.data.data || []);

      if (orgRes.data.data) {
        const orgData = orgRes.data.data;
        setOrgSettings({
          orgName: orgData.orgName || 'Administrasi Rojabiyyah 2026',
          orgTagline: orgData.orgTagline || 'Haul Ke-5 & Logistik Terpadu',
          logoUrl: orgData.logoUrl || '/logo-rojabiyyah.png',
          address: orgData.address || '',
          contactPhone: orgData.contactPhone || '',
          contactEmail: orgData.contactEmail || '',
        });

        const b = orgData.branding || {};
        setBrandingForm({
          appName: b.appName || orgData.orgName || 'Administrasi Rojabiyyah 2026',
          appSubtitle: b.appSubtitle || orgData.orgTagline || 'Haul Ke-5 & Logistik Terpadu',
          logoUrl: b.logoUrl || orgData.logoUrl || '/logo-rojabiyyah.png',
          subTheme: b.subTheme || 'Haul ke-5 Al-Maghfurlah K.H. Moch. Djamaluddin Achmad & Rojabiyyah 2026',
          heroTitlePrefix: b.heroTitlePrefix || 'Aplikasi Administrasi',
          heroTitleHighlight: b.heroTitleHighlight || 'Haul Ke-5 & Rojabiyyah 2026',
          footerText: b.footerText || '© 2026 Aplikasi Administrasi Haul Ke-5 & Rojabiyyah 2026.',
          kopNama: b.kopNama || 'ADMINISTRASI ROJABIYYAAH 2026 • LOGISTIK',
          kopSubtitle: b.kopSubtitle || 'Haul ke-5 Al-Maghfurlah K.H. Moch. Djamaluddin Achmad & Rojabiyyah 2026',
          kopSubtitleSingkat: b.kopSubtitleSingkat || 'Haul Ke-5 & Rojabiyyah 2026',
          googleDriveUrl: b.googleDriveUrl || 'https://drive.google.com/drive/folders/1l91WsFBV_sZ89DlvzvSXlgedX0pOwsfa?usp=sharing',
        });

        setLogoPreview(b.logoUrl || orgData.logoUrl || '/logo-rojabiyyah.png');
      }
    } catch (err) {
      console.error('Gagal mengambil pengaturan sistem:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllSettings();
  }, []);

  // Category Handlers
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await api.post('/settings/categories', newCat);
      setNewCat({ name: '', type: 'INVENTORY', description: '' });
      fetchAllSettings();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal membuat kategori');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Yakin ingin menghapus kategori ini?')) return;
    try {
      await api.delete(`/settings/categories/${id}`);
      fetchAllSettings();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus kategori');
    }
  };

  // Region Handlers
  const handleCreateRegion = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await api.post('/regions', newReg);
      setNewReg({ name: '', code: '', description: '' });
      fetchAllSettings();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal membuat wilayah');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRegion = async (id) => {
    if (!window.confirm('Yakin ingin menghapus wilayah ini?')) return;
    try {
      await api.delete(`/regions/${id}`);
      fetchAllSettings();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus wilayah');
    }
  };

  // Institution Handlers
  const handleCreateInstitution = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await api.post('/institutions', newInst);
      setNewInst({ name: '', contactPerson: '', phone: '', address: '' });
      fetchAllSettings();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal membuat lembaga');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteInstitution = async (id) => {
    if (!window.confirm('Yakin ingin menghapus lembaga ini?')) return;
    try {
      await api.delete(`/institutions/${id}`);
      fetchAllSettings();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus lembaga');
    }
  };

  // Custom Field Handlers
  const handleCreateCustomField = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await api.post('/settings/custom-fields', newCustomField);
      setNewCustomField({
        module: 'INVENTORY',
        fieldName: '',
        fieldLabel: '',
        fieldType: 'TEXT',
        isRequired: false,
      });
      fetchAllSettings();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menambah kolom dinamis');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCustomField = async (id) => {
    if (!window.confirm('Yakin ingin menghapus kolom dinamis ini?')) return;
    try {
      await api.delete(`/settings/custom-fields/${id}`);
      fetchAllSettings();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus kolom');
    }
  };

  // Logo file selection
  const handleLogoFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetDefaultLogo = () => {
    setLogoFile(null);
    setLogoPreview('/logo-rojabiyyah.png');
    setBrandingForm((prev) => ({ ...prev, logoUrl: '/logo-rojabiyyah.png' }));
  };

  // Save All Organization & Branding Settings
  const handleSaveAllBranding = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setSaveSuccess(false);

      let finalLogoUrl = brandingForm.logoUrl;

      // 1. If new logo file was selected, upload it first
      if (logoFile) {
        const logoFormData = new FormData();
        logoFormData.append('logo', logoFile);
        const uploadRes = await api.post('/settings/organization/logo', logoFormData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        finalLogoUrl = uploadRes.data.data.logoUrl;
      }

      // 2. Save full branding and organization settings
      const payload = {
        orgName: brandingForm.appName,
        orgTagline: brandingForm.appSubtitle,
        logoUrl: finalLogoUrl,
        address: orgSettings.address,
        contactPhone: orgSettings.contactPhone,
        contactEmail: orgSettings.contactEmail,
        branding: {
          ...brandingForm,
          logoUrl: finalLogoUrl,
        },
      };

      const res = await api.put('/settings/organization', payload);
      const updatedBranding = res.data.data?.branding || payload.branding;

      // Update theme store & state
      setBranding(updatedBranding);
      setBrandingForm(updatedBranding);
      setLogoFile(null);
      setLogoPreview(updatedBranding.logoUrl);

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
      alert('Pengaturan identitas, judul, logo, dan teks berhasil disimpan! Halaman depan kini langsung diperbarui.');
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan pengaturan branding');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFullLogoUrl = (url) => {
    if (!url) return '/logo-rojabiyyah.png';
    if (url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('/uploads')) return `http://localhost:5000${url}`;
    return url;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-indigo-400" />
            Pengaturan Sistem & Branding
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Ubah identitas sistem, judul aplikasi, logo, sub-tema acara, master kategori, wilayah kerja, dan kolom dinamis.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <a
            href="/PRD_SISTEM_ADMINISTRASI_ROJABIYYAH_2026.docx"
            download="PRD_SISTEM_ADMINISTRASI_ROJABIYYAH_2026.docx"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/35 text-blue-300 border border-blue-500/30 text-xs font-semibold transition-all shadow-sm active:scale-95"
            title="Unduh Dokumen PRD & Flowchart Sistem format Word (.docx)"
          >
            <FileText className="w-4 h-4 text-blue-400" />
            <span>Unduh Dokumen PRD (.docx)</span>
          </a>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/10">
        {[
          { key: 'org', label: 'Identitas, Judul & Logo', icon: Sparkles },
          { key: 'categories', label: 'Master Kategori', icon: Layers },
          { key: 'regions', label: 'Wilayah Operasional', icon: MapPin },
          { key: 'institutions', label: 'Lembaga / Mitra Luar', icon: Building2 },
          { key: 'customFields', label: 'Kolom Kustom Dinamis', icon: Sliders },
          { key: 'users_nav', label: 'Kelola Pengelola Admin (5)', icon: Users, isLink: true },
          { key: 'danger', label: 'Reset Data Operasional', icon: Trash2 },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => {
                if (tab.isLink) {
                  navigate('/admin/users');
                } else {
                  setActiveTab(tab.key);
                }
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 flex-shrink-0 ${
                tab.isLink
                  ? 'bg-rose-950/40 text-rose-300 hover:bg-rose-900/50 border border-rose-500/30'
                  : activeTab === tab.key
                  ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 shadow-glow'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: IDENTITAS, JUDUL & LOGO (FITUR UTAMA SESUAI PERMINTAAN USER) */}
      {activeTab === 'org' && (
        <div className="space-y-6">
          {saveSuccess && (
            <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2.5 shadow-lg">
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span>Perubahan identitas, judul, logo, dan nama acara berhasil disimpan dan langsung aktif di seluruh sistem!</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Form Pengaturan Lengkap */}
            <div className="lg:col-span-7 glass-card p-6 border border-white/10 shadow-glass space-y-6">
              <div className="border-b border-white/10 pb-3">
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  Formulir Kustomisasi Judul, Logo & Teks
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Sesuaikan teks dan logo sesuai tema kegiatan saat ini (otomatis tampil di halaman depan/landing, header, footer, & laporan).
                </p>
              </div>

              <form onSubmit={handleSaveAllBranding} className="space-y-4 text-xs">
                {/* 1. LOGO UPLOAD & PREVIEW */}
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 space-y-3">
                  <label className="block font-bold text-slate-200">
                    Logo Aplikasi / Organisasi <span className="text-rose-400">*</span>
                  </label>

                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    {/* Logo Box */}
                    <div className="w-20 h-20 rounded-2xl bg-slate-950 border-2 border-dashed border-cyan-500/40 p-2 flex items-center justify-center flex-shrink-0 shadow-glow relative overflow-hidden group">
                      <img
                        src={getFullLogoUrl(logoPreview || brandingForm.logoUrl)}
                        alt="Logo Preview"
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <div className="flex-1 space-y-2 text-center sm:text-left">
                      <p className="text-[11px] text-slate-300 font-medium">
                        Pilih file logo baru (Format PNG transparan, JPG, SVG, atau WEBP).
                      </p>
                      
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                        <button
                          type="button"
                          onClick={() => logoInputRef.current?.click()}
                          className="px-3.5 py-1.5 rounded-lg bg-cyan-600/30 hover:bg-cyan-600/40 border border-cyan-500/40 text-cyan-300 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Unggah File Logo</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleResetDefaultLogo}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-white/10 text-xs font-medium transition-all"
                          title="Gunakan logo bawaan"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                          <span>Logo Bawaan</span>
                        </button>
                      </div>

                      <input
                        type="file"
                        ref={logoInputRef}
                        accept="image/*"
                        onChange={handleLogoFileChange}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. NAMA APLIKASI & SUBTITLE HEADER */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-200 mb-1">
                      Nama Aplikasi / Judul Header <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="misal: Administrasi Rojabiyyah 2026"
                      value={brandingForm.appName}
                      onChange={(e) => setBrandingForm({ ...brandingForm, appName: e.target.value })}
                      className="w-full glass-input"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-200 mb-1">
                      Sub-Judul Header Navbar
                    </label>
                    <input
                      type="text"
                      placeholder="misal: Haul Ke-5 & Logistik Terpadu"
                      value={brandingForm.appSubtitle}
                      onChange={(e) => setBrandingForm({ ...brandingForm, appSubtitle: e.target.value })}
                      className="w-full glass-input"
                    />
                  </div>
                </div>

                {/* 3. SUB-TEMA ACARA (BADGE PILL DI ATAS HERO TITLE) */}
                <div>
                  <label className="block font-bold text-slate-200 mb-1">
                    Sub-Tema Acara (Badge Pill di Atas Judul Halaman Depan) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="misal: Haul ke-5 Al-Maghfurlah K.H. Moch. Djamaluddin Achmad & Rojabiyyah 2026"
                    value={brandingForm.subTheme}
                    onChange={(e) => setBrandingForm({ ...brandingForm, subTheme: e.target.value })}
                    className="w-full glass-input"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Ditampilkan pada badge pil emas di halaman depan, surat jalan, dan kop bukti peminjaman.
                  </p>
                </div>

                {/* 4. JUDUL UTAMA HALAMAN DEPAN (PREFIX & HIGHLIGHT GRADIENT) */}
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 space-y-3">
                  <span className="block font-bold text-cyan-300 text-xs">
                    Format Judul Utama Halaman Depan (Hero Heading)
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">
                        Teks Judul Depan (Warna Putih)
                      </label>
                      <input
                        type="text"
                        placeholder="misal: Aplikasi Administrasi"
                        value={brandingForm.heroTitlePrefix}
                        onChange={(e) => setBrandingForm({ ...brandingForm, heroTitlePrefix: e.target.value })}
                        className="w-full glass-input"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">
                        Teks Sorotan (Warna Gradient AI)
                      </label>
                      <input
                        type="text"
                        placeholder="misal: Haul Ke-5 & Rojabiyyah 2026"
                        value={brandingForm.heroTitleHighlight}
                        onChange={(e) => setBrandingForm({ ...brandingForm, heroTitleHighlight: e.target.value })}
                        className="w-full glass-input font-bold text-cyan-300"
                      />
                    </div>
                  </div>
                </div>

                {/* 5. TEKS FOOTER / HAK CIPTA */}
                <div>
                  <label className="block font-bold text-slate-200 mb-1">
                    Teks Hak Cipta / Footer Bawah
                  </label>
                  <input
                    type="text"
                    placeholder="misal: © 2026 Aplikasi Administrasi Haul Ke-5 & Rojabiyyah 2026."
                    value={brandingForm.footerText}
                    onChange={(e) => setBrandingForm({ ...brandingForm, footerText: e.target.value })}
                    className="w-full glass-input"
                  />
                </div>

                {/* 5b. KOP DOKUMEN CETAK */}
                <div className="pt-2 border-t border-white/5 space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="block font-bold text-amber-300 text-xs uppercase tracking-wider">🖨️ Kop Dokumen Cetak</span>
                    <span className="text-[10px] text-slate-500 bg-slate-800/60 px-2 py-0.5 rounded-full">Surat Jalan • Stiker • Bukti Peminjaman</span>
                  </div>
                  <p className="text-[11px] text-slate-400 -mt-1">Ubah sekali, otomatis berlaku di semua dokumen yang dicetak.</p>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Nama Kop (Baris Utama Tebal)
                    </label>
                    <input
                      type="text"
                      placeholder="misal: ADMINISTRASI ROJABIYYAAH 2026 • LOGISTIK"
                      value={brandingForm.kopNama || ''}
                      onChange={(e) => setBrandingForm({ ...brandingForm, kopNama: e.target.value })}
                      className="w-full glass-input font-mono"
                    />
                    <p className="text-[10px] text-slate-500 mt-0.5">Teks ini tampil di header semua dokumen cetak (uppercase otomatis).</p>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Sub-Judul Kop / Tema Acara (Lengkap)
                    </label>
                    <input
                      type="text"
                      placeholder="misal: Haul ke-5 Al-Maghfurlah K.H. Moch. Djamaluddin Achmad & Rojabiyyah 2026"
                      value={brandingForm.kopSubtitle || ''}
                      onChange={(e) => setBrandingForm({ ...brandingForm, kopSubtitle: e.target.value })}
                      className="w-full glass-input"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Sub-Judul Singkat (untuk Stiker & QR Code)
                    </label>
                    <input
                      type="text"
                      placeholder="misal: Haul Ke-5 & Rojabiyyah 2026"
                      value={brandingForm.kopSubtitleSingkat || ''}
                      onChange={(e) => setBrandingForm({ ...brandingForm, kopSubtitleSingkat: e.target.value })}
                      className="w-full glass-input"
                    />
                  </div>

                  {/* Preview Kop */}
                  <div className="mt-2 p-3 bg-white rounded-xl border border-slate-300 shadow-sm">
                    <div className="flex items-center gap-2 border-b-2 border-slate-900 pb-2 mb-1">
                      <div className="w-7 h-7 bg-slate-200 rounded flex items-center justify-center text-[9px] text-slate-500 font-bold flex-shrink-0">Logo</div>
                      <div>
                        <span className="text-[11px] font-black uppercase tracking-tight text-slate-900 block leading-tight">
                          {brandingForm.kopNama || 'ADMINISTRASI ROJABIYYAAH 2026 • LOGISTIK'}
                        </span>
                        <span className="text-[9px] font-bold text-emerald-800">
                          {brandingForm.kopSubtitle || 'Haul ke-5 Al-Maghfurlah K.H. Moch. Djamaluddin Achmad & Rojabiyyah 2026'}
                        </span>
                      </div>
                    </div>
                    <p className="text-[9px] text-slate-400 text-center">Preview Kop Dokumen Cetak</p>
                  </div>
                </div>

                {/* 5c. GOOGLE DRIVE PUSAT BERKAS & DOKUMENTASI */}
                <div className="pt-2 border-t border-white/5 space-y-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="block font-bold text-cyan-300 text-xs uppercase tracking-wider flex items-center gap-1.5">
                      📁 Link Google Drive Pusat Berkas
                    </span>
                    <span className="text-[10px] text-slate-500 bg-slate-800/60 px-2 py-0.5 rounded-full">
                      Admin Upload & Anggota Download
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 -mt-1">
                    Folder Google Drive resmi untuk upload foto, video, desain materi, dan dokumen kegiatan yang dapat diakses oleh anggota.
                  </p>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      URL / Tautan Folder Google Drive
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        placeholder="https://drive.google.com/drive/folders/..."
                        value={brandingForm.googleDriveUrl || ''}
                        onChange={(e) => setBrandingForm({ ...brandingForm, googleDriveUrl: e.target.value })}
                        className="w-full glass-input text-xs"
                      />
                      {brandingForm.googleDriveUrl && (
                        <a
                          href={brandingForm.googleDriveUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-2.5 rounded-xl bg-cyan-600/30 hover:bg-cyan-600/40 border border-cyan-500/40 text-cyan-300 text-xs font-bold flex items-center gap-1 flex-shrink-0 transition-all shadow-sm"
                          title="Uji coba buka Google Drive di tab baru"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Tes Buka</span>
                        </a>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Pastikan setelan izin akses folder Google Drive disetel ke <em>"Siapa saja yang memiliki link (Pelihat / Editor)"</em> agar anggota dapat mengunduh berkas.
                    </p>
                  </div>
                </div>

                {/* 6. KONTAK & ALAMAT SEKRETARIAT (OPSIONAL) */}
                <div className="pt-2 border-t border-white/5 space-y-3">
                  <span className="block font-bold text-slate-300 text-xs">Informasi Kontak & Sekretariat (Untuk Surat & Cetak)</span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-400 mb-1">Nomor Kontak / WhatsApp</label>
                      <input
                        type="text"
                        value={orgSettings.contactPhone || ''}
                        onChange={(e) => setOrgSettings({ ...orgSettings, contactPhone: e.target.value })}
                        className="w-full glass-input"
                        placeholder="misal: 08123456789"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-400 mb-1">Email Resmi</label>
                      <input
                        type="email"
                        value={orgSettings.contactEmail || ''}
                        onChange={(e) => setOrgSettings({ ...orgSettings, contactEmail: e.target.value })}
                        className="w-full glass-input"
                        placeholder="misal: sekretariat@rojabiyyah.org"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-400 mb-1">Alamat Lengkap</label>
                    <textarea
                      rows="2"
                      value={orgSettings.address || ''}
                      onChange={(e) => setOrgSettings({ ...orgSettings, address: e.target.value })}
                      className="w-full glass-input"
                      placeholder="misal: Bumi Damai Al-Muhibbin Tambakberas Jombang"
                    />
                  </div>
                </div>

                {/* SUBMIT BUTTON */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl gradient-btn font-bold text-white text-xs shadow-glow flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Menyimpan Perubahan...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Simpan Perubahan Judul, Logo & Teks</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Right Column: PRATINJAU LANGSUNG (LIVE PREVIEW) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="glass-card p-5 border border-cyan-500/30 shadow-glow sticky top-20">
                <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                  <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5 uppercase tracking-wider">
                    <Eye className="w-4 h-4 text-cyan-400" />
                    Pratinjau Langsung Halaman Depan
                  </span>
                  <span className="text-[10px] text-slate-400">Update Real-Time</span>
                </div>

                {/* Mini Preview Mockup */}
                <div className="rounded-2xl border border-white/15 bg-slate-950 p-4 space-y-6 shadow-2xl relative overflow-hidden">
                  {/* Mock Navbar */}
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-slate-900 border border-white/20 p-1 flex items-center justify-center flex-shrink-0">
                        <img
                          src={getFullLogoUrl(logoPreview || brandingForm.logoUrl)}
                          alt="Logo"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-extrabold text-xs text-white truncate leading-tight">
                          {brandingForm.appName || 'Administrasi Rojabiyyah 2026'}
                        </p>
                        <p className="text-[9px] text-cyan-400 font-semibold truncate">
                          {brandingForm.appSubtitle || 'Haul Ke-5 & Logistik Terpadu'}
                        </p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[9px] bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 font-bold">
                      Masuk
                    </span>
                  </div>

                  {/* Mock Center Hero */}
                  <div className="text-center py-4 space-y-3">
                    {/* Badge Pill */}
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-900 border border-cyan-500/30 text-cyan-300 text-[9px] font-semibold">
                      <Sparkles className="w-3 h-3 text-amber-400 flex-shrink-0" />
                      <span className="truncate max-w-[200px]">
                        {brandingForm.subTheme || 'Sub-Tema Kegiatan'}
                      </span>
                    </div>

                    {/* Hero Title */}
                    <h4 className="text-lg font-black text-white leading-tight">
                      {brandingForm.heroTitlePrefix || 'Aplikasi Administrasi'}{' '}
                      <span className="gradient-ai-text block sm:inline">
                        {brandingForm.heroTitleHighlight || 'Haul Ke-5 & Rojabiyyah 2026'}
                      </span>
                    </h4>

                    {/* Mock Buttons */}
                    <div className="flex items-center justify-center gap-2 pt-2">
                      <span className="px-3 py-1.5 rounded-lg gradient-btn text-[10px] font-bold text-white shadow-glow">
                        Pendaftaran Anggota
                      </span>
                      <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-white/20 text-[10px] font-semibold text-slate-300">
                        Masuk Petugas
                      </span>
                    </div>
                  </div>

                  {/* Mock Footer */}
                  <div className="pt-3 border-t border-white/10 text-center text-[9px] text-slate-400">
                    {brandingForm.footerText || '© 2026 Hak Cipta Aplikasi.'}
                  </div>
                </div>

                {/* Mini Preview: KOP DOKUMEN CETAK (SURAT JALAN & STIKER) */}
                <div className="rounded-2xl border border-amber-500/30 bg-white p-4 shadow-xl space-y-3 text-slate-900 mt-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1">
                      📄 Pratinjau Kop Surat Jalan & Stiker Label
                    </span>
                    <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">
                      Live Mockup
                    </span>
                  </div>

                  {/* Header Dokumen Realistis */}
                  <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded bg-slate-100 border border-slate-300 p-0.5 flex items-center justify-center flex-shrink-0">
                        <img
                          src={getFullLogoUrl(logoPreview || brandingForm.logoUrl)}
                          alt="Logo"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[11px] font-black uppercase tracking-tight text-slate-900 block truncate leading-tight">
                          {brandingForm.kopNama || 'ADMINISTRASI ROJABIYYAAH 2026 • LOGISTIK'}
                        </span>
                        <span className="text-[9px] font-bold text-emerald-800 block truncate">
                          {brandingForm.kopSubtitle || 'Haul ke-5 Al-Maghfurlah K.H. Moch. Djamaluddin Achmad & Rojabiyyah 2026'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Sample Sticker Banner */}
                  <div className="bg-slate-900 text-white p-2 rounded-lg text-[9px] flex items-center justify-between">
                    <div className="min-w-0 pr-2">
                      <span className="font-bold text-amber-300 block truncate text-[9px]">
                        {brandingForm.kopNama || 'ADMINISTRASI ROJABIYYAAH 2026 • LOGISTIK'}
                      </span>
                      <span className="text-[8px] text-slate-300 block truncate">
                        {brandingForm.kopSubtitleSingkat || 'Haul Ke-5 & Rojabiyyah 2026'}
                      </span>
                    </div>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-600 text-white font-mono text-[7px] font-extrabold uppercase flex-shrink-0">
                      STIKER BOKS
                    </span>
                  </div>
                </div>

                <div className="mt-4 p-3 rounded-xl bg-slate-900/60 border border-white/5 text-[11px] text-slate-400 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span>
                    Setelah Anda menekan tombol <strong>Simpan Pengaturan Branding</strong>, semua dokumen (Surat Jalan, Lembar Stiker A4, Bukti Peminjaman) dan tampilan halaman utama akan langsung tersinkronisasi.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MASTER KATEGORI */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="glass-card p-5 border border-white/10">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-400" />
              Tambah Kategori Baru
            </h3>
            <form onSubmit={handleCreateCategory} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Nama Kategori</label>
                <input
                  type="text"
                  required
                  placeholder="misal: Sound System, Infaq..."
                  value={newCat.name}
                  onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
                  className="w-full glass-input"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Tipe Modul</label>
                <select
                  value={newCat.type}
                  onChange={(e) => setNewCat({ ...newCat, type: e.target.value })}
                  className="w-full glass-input"
                >
                  <option value="INVENTORY" className="bg-slate-900 text-white">Inventaris Barang</option>
                  <option value="TRANSACTION_INCOME" className="bg-slate-900 text-white">Pemasukan Kas (+)</option>
                  <option value="TRANSACTION_EXPENSE" className="bg-slate-900 text-white">Pengeluaran Kas (-)</option>
                  <option value="TASK_POINT" className="bg-slate-900 text-white">Titik Tugas Wilayah</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Keterangan (Opsional)</label>
                <textarea
                  rows="2"
                  value={newCat.description}
                  onChange={(e) => setNewCat({ ...newCat, description: e.target.value })}
                  className="w-full glass-input"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl gradient-btn font-bold shadow-glow disabled:opacity-50"
              >
                Simpan Kategori
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 glass-card p-5 border border-white/10">
            <h3 className="text-sm font-bold text-white mb-3">Daftar Kategori Aktif ({categories.length})</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {categories.map((c) => (
                <div
                  key={c.id}
                  className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-bold text-white">{c.name}</p>
                    <span className="text-[10px] text-indigo-400 font-semibold">{c.type}</span>
                    {c.description && <p className="text-[11px] text-slate-400 mt-0.5">{c.description}</p>}
                  </div>
                  <button
                    onClick={() => handleDeleteCategory(c.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                    title="Hapus Kategori"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: WILAYAH OPERASIONAL */}
      {activeTab === 'regions' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="glass-card p-5 border border-white/10">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-400" />
              Tambah Wilayah Baru
            </h3>
            <form onSubmit={handleCreateRegion} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Nama Wilayah</label>
                <input
                  type="text"
                  required
                  placeholder="misal: Wilayah Utara"
                  value={newReg.name}
                  onChange={(e) => setNewReg({ ...newReg, name: e.target.value })}
                  className="w-full glass-input"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Kode Unik Wilayah</label>
                <input
                  type="text"
                  required
                  placeholder="misal: REG-UTR"
                  value={newReg.code}
                  onChange={(e) => setNewReg({ ...newReg, code: e.target.value.toUpperCase() })}
                  className="w-full glass-input uppercase"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Keterangan Wilayah</label>
                <textarea
                  rows="2"
                  value={newReg.description}
                  onChange={(e) => setNewReg({ ...newReg, description: e.target.value })}
                  className="w-full glass-input"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl gradient-btn font-bold shadow-glow disabled:opacity-50"
              >
                Simpan Wilayah
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 glass-card p-5 border border-white/10">
            <h3 className="text-sm font-bold text-white mb-3">Daftar Wilayah Operasional ({regions.length})</h3>
            <div className="space-y-2">
              {regions.map((r) => (
                <div
                  key={r.id}
                  className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-white text-sm">{r.name}</p>
                      <span className="font-mono text-[10px] text-cyan-400 font-bold px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                        {r.code}
                      </span>
                    </div>
                    {r.description && <p className="text-slate-400 text-[11px] mt-1">{r.description}</p>}
                  </div>
                  <button
                    onClick={() => handleDeleteRegion(r.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                    title="Hapus Wilayah"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: LEMBAGA / MITRA LUAR */}
      {activeTab === 'institutions' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="glass-card p-5 border border-white/10">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-400" />
              Tambah Lembaga / Mitra
            </h3>
            <form onSubmit={handleCreateInstitution} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Nama Lembaga</label>
                <input
                  type="text"
                  required
                  placeholder="misal: Ponpes Al-Muhibbin"
                  value={newInst.name}
                  onChange={(e) => setNewInst({ ...newInst, name: e.target.value })}
                  className="w-full glass-input"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Contact Person</label>
                <input
                  type="text"
                  value={newInst.contactPerson}
                  onChange={(e) => setNewInst({ ...newInst, contactPerson: e.target.value })}
                  className="w-full glass-input"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1">No. Telepon / WA</label>
                <input
                  type="text"
                  value={newInst.phone}
                  onChange={(e) => setNewInst({ ...newInst, phone: e.target.value })}
                  className="w-full glass-input"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl gradient-btn font-bold shadow-glow disabled:opacity-50"
              >
                Simpan Lembaga
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 glass-card p-5 border border-white/10">
            <h3 className="text-sm font-bold text-white mb-3">Daftar Lembaga Mitra Terdaftar ({institutions.length})</h3>
            <div className="space-y-2">
              {institutions.map((inst) => (
                <div
                  key={inst.id}
                  className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-bold text-white text-sm">{inst.name}</p>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      CP: {inst.contactPerson || '-'} • Telp: {inst.phone || '-'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteInstitution(inst.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                    title="Hapus Lembaga"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: KOLOM DINAMIS CUSTOM FIELDS */}
      {activeTab === 'customFields' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="glass-card p-5 border border-white/10">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-400" />
              Tambah Kolom Kustom
            </h3>
            <form onSubmit={handleCreateCustomField} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Pilih Modul</label>
                <select
                  value={newCustomField.module}
                  onChange={(e) => setNewCustomField({ ...newCustomField, module: e.target.value })}
                  className="w-full glass-input"
                >
                  <option value="INVENTORY" className="bg-slate-900 text-white">Inventaris Barang</option>
                  <option value="MEMBER" className="bg-slate-900 text-white">Data Anggota</option>
                  <option value="TASK_POINT" className="bg-slate-900 text-white">Titik Tugas Wilayah</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Nama Kolom (Field Name)</label>
                <input
                  type="text"
                  required
                  placeholder="misal: serial_number"
                  value={newCustomField.fieldName}
                  onChange={(e) => setNewCustomField({ ...newCustomField, fieldName: e.target.value })}
                  className="w-full glass-input"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Label Tampilan</label>
                <input
                  type="text"
                  required
                  placeholder="misal: Nomor Seri Pabrik"
                  value={newCustomField.fieldLabel}
                  onChange={(e) => setNewCustomField({ ...newCustomField, fieldLabel: e.target.value })}
                  className="w-full glass-input"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl gradient-btn font-bold shadow-glow disabled:opacity-50"
              >
                Buat Kolom Dinamis
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 glass-card p-5 border border-white/10">
            <h3 className="text-sm font-bold text-white mb-3">Kolom Dinamis Aktif ({customFields.length})</h3>
            <div className="space-y-2">
              {customFields.map((cf) => (
                <div
                  key={cf.id}
                  className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-white text-sm">{cf.fieldLabel}</p>
                      <span className="font-mono text-[10px] text-purple-400 font-bold px-1.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/20">
                        {cf.fieldName}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Modul: <strong className="text-white">{cf.module}</strong> • Tipe: {cf.fieldType}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteCustomField(cf.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                    title="Hapus Kolom"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: RESET DATA OPERASIONAL (DANGER ZONE) */}
      {activeTab === 'danger' && (
        <div className="space-y-6">
          <div className="glass-card p-6 border border-rose-500/30 bg-rose-950/20 space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center flex-shrink-0 border border-rose-500/30 shadow-lg shadow-rose-950/50">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Pusat Pembersihan & Reset Data Sistem
                </h3>
                <p className="text-xs text-rose-200/90 leading-relaxed max-w-2xl">
                  Fitur ini dirancang khusus untuk mempermudah Super Admin membersihkan seluruh data percobaan / transaksi tanpa harus menghapusnya satu per satu di setiap menu modul.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-2">
              <div className="p-3.5 rounded-xl bg-slate-900/70 border border-white/10 space-y-1">
                <span className="font-bold text-emerald-400 block text-xs">🛡️ Data yang AMAN (Tidak Dihapus):</span>
                <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px] pt-1">
                  <li>Akun Super Admin utama (<code>admin</code>) tetap aktif</li>
                  <li>Pengaturan Nama Organisasi & Logo Sistem</li>
                  <li>Struktur Master Kategori (Kecuali dicentang opsional)</li>
                  <li>Link Google Drive Berkas & Pengaturan Slider</li>
                </ul>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/70 border border-rose-500/20 space-y-1">
                <span className="font-bold text-rose-400 block text-xs">🗑️ Data yang Dapat Dibersihkan Sekaligus:</span>
                <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px] pt-1">
                  <li>Semua transaksi peminjaman barang logistik</li>
                  <li>Semua master barang inventaris & foto barang</li>
                  <li>Biodata pendaftaran anggota & akun non-admin</li>
                  <li>Catatan keuangan kas (pemasukan & pengeluaran)</li>
                  <li>Titik penugasan wilayah & laporan lapangan</li>
                  <li>Riwayat log audit aktivitas & notifikasi</li>
                </ul>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-[11px] text-slate-400">
                Membutuhkan konfirmasi ketik kata <strong>'RESET'</strong> untuk keamanan agar tidak tertekan secara tidak sengaja.
              </p>
              <button
                type="button"
                onClick={() => setIsResetModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-rose-900/40 transition-all self-start sm:self-auto"
              >
                <Trash2 className="w-4 h-4" />
                <span>Buka Formulir Reset Data</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Reset Data Operasional */}
      <ResetDataModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onResetSuccess={() => {
          fetchAllSettings();
        }}
      />
    </div>
  );
};

export default AdminSettingsPage;
