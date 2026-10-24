import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  Camera,
  Upload,
  Save,
  Key,
  ShieldCheck,
  CheckCircle2,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Home,
  Shirt,
  Eye,
  EyeOff,
  RefreshCw,
  Sparkles,
  QrCode,
  IdCard,
  AlertCircle,
  X,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore.js';
import { toast } from '../../store/toastStore.js';
import { getImageUrl } from '../../lib/utils.js';
import api from '../../api/axios.js';

const DIVISIONS = [
  'Koordinator',
  'Wakil Koordinator',
  'PJ Desain',
  'Fotografer',
  'Videografer',
  'Perkabelan',
  'Proyektor',
  'Live Streaming / Desain Grafis',
  'Shooting / Editor',
  'Logistik & Perlengkapan',
  'Humas & Akomodasi',
];

const EDUCATIONS = [
  'Abiturent',
  'UNWAHA',
  'IAIBAFA',
  'MAN 3 Jombang',
  'MTs FH',
  'MA FH',
  'MMP',
  'MMA',
  'Umum / Mahasiswa',
];

const DOMICILES = [
  'Al-Muhibbin',
  'Al-Ikhlas',
  'Al-Amanah',
  'Al-Mardliyah',
  'Al-Asror',
  'Jombang',
  'Lainnya / Luar',
];

const SHIRT_SIZES = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

export const MemberProfilePage = () => {
  const { user, setUser, checkAuth } = useAuthStore();
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'security'
  const [loading, setLoading] = useState(false);
  const [submittingProfile, setSubmittingProfile] = useState(false);
  const [submittingPassword, setSubmittingPassword] = useState(false);

  // Profile Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    division: '',
    education: '',
    grade: '',
    domicile: '',
    shirtSize: '',
    address: '',
  });

  // Avatar State
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  // Password Form State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Initialize data from current user
  useEffect(() => {
    if (user) {
      const member = user.member || {};
      setFormData({
        fullName: member.fullName || '',
        email: user.email || '',
        phone: member.phone || '',
        division: member.division || '',
        education: member.education || '',
        grade: member.grade || '',
        domicile: member.domicile || '',
        shirtSize: member.shirtSize || '',
        address: member.address || '',
      });

      if (member.avatar) {
        setAvatarPreview(getImageUrl(member.avatar));
      } else {
        setAvatarPreview(null);
      }
    }
  }, [user]);

  // Handle avatar file selection
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('File yang dipilih harus berupa gambar (JPG, PNG, WEBP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran foto maksimal 5 MB');
      return;
    }

    setAvatarFile(file);
    const objectUrl = URL.createObjectURL(file);
    setAvatarPreview(objectUrl);
  };

  const handleCancelAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(user?.member?.avatar ? getImageUrl(user.member.avatar) : null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Submit Profile update
  const handleSubmitProfile = async (e) => {
    e.preventDefault();

    if (!formData.fullName.trim()) {
      toast.error('Nama lengkap wajib diisi');
      return;
    }

    const memberId = user?.member?.id;
    if (!memberId) {
      toast.error('Data profil anggota tidak ditemukan. Hubungi Administrator.');
      return;
    }

    try {
      setSubmittingProfile(true);

      const submitData = new FormData();
      submitData.append('fullName', formData.fullName);
      submitData.append('email', formData.email);
      submitData.append('phone', formData.phone || '');
      submitData.append('division', formData.division || '');
      submitData.append('education', formData.education || '');
      submitData.append('grade', formData.grade || '');
      submitData.append('domicile', formData.domicile || '');
      submitData.append('shirtSize', formData.shirtSize || '');
      submitData.append('address', formData.address || '');

      if (avatarFile) {
        submitData.append('avatar', avatarFile);
      }

      const res = await api.put(`/members/${memberId}`, submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Update state locally and trigger checkAuth to synchronize all components
      await checkAuth();

      toast.success('Profil dan foto anggota berhasil diperbarui!');
      setAvatarFile(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memperbarui profil');
    } finally {
      setSubmittingProfile(false);
    }
  };

  // Submit Password Change
  const handleSubmitPassword = async (e) => {
    e.preventDefault();

    if (!passwordData.currentPassword) {
      toast.error('Kata sandi saat ini wajib diisi');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Kata sandi baru minimal 6 karakter');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Konfirmasi kata sandi baru tidak cocok');
      return;
    }

    try {
      setSubmittingPassword(true);
      await api.put('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword,
      });

      toast.success('Kata sandi berhasil diperbarui! Silakan gunakan sandi baru untuk login berikutnya.');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengubah kata sandi');
    } finally {
      setSubmittingPassword(false);
    }
  };

  const member = user?.member || {};

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-[#800020]/40 to-slate-900 p-6 border border-white/10 shadow-xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-[#800020]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#800020] to-rose-700 p-0.5 shadow-glow flex items-center justify-center flex-shrink-0">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold text-white tracking-wide">
                  Pengaturan Profil & Akun
                </h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                  {member.memberId || 'RJB-ANGGOTA'}
                </span>
              </div>
              <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Kelola identitas resmi, foto profil anggota, nomor kontak, serta keamanan akun Anda di portal Administrasi Rojabiyyah.
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 bg-slate-950/70 p-1.5 rounded-xl border border-white/10 self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'profile'
                  ? 'bg-gradient-to-r from-[#800020] to-rose-700 text-white shadow-glow'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Data Profil & Foto</span>
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'security'
                  ? 'bg-gradient-to-r from-[#800020] to-rose-700 text-white shadow-glow'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Key className="w-4 h-4" />
              <span>Keamanan Kata Sandi</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Digital ID Card Preview & Photo Manager */}
        <div className="lg:col-span-5 space-y-6">
          {/* Official Digital Member Card */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#800020] via-slate-900 to-slate-950 border border-rose-500/30 shadow-2xl p-6 text-white">
            {/* Background Ornaments */}
            <div className="absolute top-0 right-0 w-44 h-44 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Card Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5 relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-slate-950/80 border border-white/20 p-1 flex items-center justify-center overflow-hidden shadow-sm">
                  <img src="/logo-rojabiyyah.png" alt="Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h3 className="font-extrabold text-xs tracking-wider uppercase text-white">
                    ROJABIYYAAH 2026
                  </h3>
                  <span className="text-[10px] text-amber-300 font-semibold tracking-widest uppercase block">
                    KARTU IDENTITAS ANGGOTA
                  </span>
                </div>
              </div>
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg bg-black/40 border border-white/15 text-rose-300">
                {member.memberId || 'RJB-000'}
              </span>
            </div>

            {/* Card Body */}
            <div className="flex flex-col items-center text-center relative z-10">
              {/* Photo Frame */}
              <div className="relative group">
                <div className="w-28 h-28 rounded-2xl p-1 bg-gradient-to-tr from-amber-400 via-rose-500 to-[#800020] shadow-glow overflow-hidden">
                  <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center overflow-hidden">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Foto Profil"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#800020] to-rose-700 flex items-center justify-center text-white font-extrabold text-3xl uppercase">
                        {(formData.fullName || user?.username || 'AN').slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Camera Trigger */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-2 rounded-xl bg-[#800020] text-white hover:bg-rose-700 border-2 border-slate-950 shadow-lg transition-transform hover:scale-110"
                  title="Ganti Foto Profil"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              {/* Member Details */}
              <h2 className="text-lg font-bold text-white mt-4 tracking-wide">
                {formData.fullName || user?.username || 'Nama Anggota'}
              </h2>
              <span className="text-xs text-amber-300 font-medium mt-0.5">
                {formData.division || 'Anggota Relawan'}
              </span>

              {/* Status Badge */}
              <div className="mt-3 flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Anggota Aktif
                </span>
                {member.region?.name && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    <MapPin className="w-3 h-3" />
                    {member.region.name}
                  </span>
                )}
              </div>
            </div>

            {/* Card Footer Barcode & Info */}
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-300 relative z-10">
              <div className="flex flex-col text-left">
                <span className="text-[10px] text-slate-400">Username Akun</span>
                <span className="font-mono text-white font-medium">@{user?.username}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400">
                <QrCode className="w-6 h-6 text-rose-300 opacity-80" />
              </div>
            </div>
          </div>

          {/* Photo Management Box */}
          <div className="glass-panel rounded-2xl p-5 border border-white/10 bg-slate-900/60 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Camera className="w-4 h-4 text-rose-400" />
                Upload Foto Profil
              </span>
              {avatarFile && (
                <span className="text-[11px] text-amber-400 font-medium">
                  Foto baru dipilih
                </span>
              )}
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Gunakan foto portrait resmi atau semi-formal yang jelas. Format JPG, PNG, atau WEBP dengan ukuran maksimal 5 MB.
            </p>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-white/10 transition-colors shadow-sm"
              >
                <Upload className="w-4 h-4 text-rose-400" />
                <span>Pilih Foto dari Galeri</span>
              </button>

              {avatarFile && (
                <button
                  type="button"
                  onClick={handleCancelAvatar}
                  className="p-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 transition-colors"
                  title="Batalkan Pilihan Foto"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Edit Form or Password Form */}
        <div className="lg:col-span-7">
          {activeTab === 'profile' ? (
            /* TAB 1: FORM DATA PROFIL */
            <div className="glass-panel rounded-2xl p-6 border border-white/10 bg-slate-900/50 backdrop-blur-xl shadow-xl">
              <div className="border-b border-white/10 pb-4 mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <User className="w-4 h-4 text-rose-400" />
                    Informasi Profil & Penugasan
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Pastikan nomor WhatsApp dan data penugasan Anda terisi dengan benar.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmitProfile} className="space-y-4">
                {/* Nama Lengkap */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nama Lengkap <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Nama lengkap sesuai identitas"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-rose-500 transition-colors"
                  />
                </div>

                {/* Email & No WA */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Email Akun
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="email@contoh.com"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-rose-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      No. WhatsApp / HP
                    </label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="081234567890"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-rose-500 font-mono transition-colors"
                    />
                  </div>
                </div>

                {/* Divisi & Domisili */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Divisi Penugasan
                    </label>
                    <select
                      value={formData.division}
                      onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-rose-500 transition-colors"
                    >
                      <option value="">-- Pilih Divisi Tugas --</option>
                      {DIVISIONS.map((div) => (
                        <option key={div} value={div}>
                          {div}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Domisili Asrama / Pondok
                    </label>
                    <select
                      value={formData.domicile}
                      onChange={(e) => setFormData({ ...formData, domicile: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-rose-500 transition-colors"
                    >
                      <option value="">-- Pilih Domisili --</option>
                      {DOMICILES.map((dom) => (
                        <option key={dom} value={dom}>
                          {dom}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Pendidikan & Kelas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Pendidikan / Instansi
                    </label>
                    <select
                      value={formData.education}
                      onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-rose-500 transition-colors"
                    >
                      <option value="">-- Pilih Pendidikan --</option>
                      {EDUCATIONS.map((edu) => (
                        <option key={edu} value={edu}>
                          {edu}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Kelas / Tingkat / Angkatan
                    </label>
                    <input
                      type="text"
                      value={formData.grade}
                      onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                      placeholder="misal: Abiturent 2024, Semester 6"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-rose-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Ukuran Seragam */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Ukuran Seragam / Kaos
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {SHIRT_SIZES.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setFormData({ ...formData, shirtSize: size })}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                          formData.shirtSize === size
                            ? 'bg-[#800020] text-white border-rose-500/50 shadow-glow'
                            : 'bg-slate-900 text-slate-400 border-white/10 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Alamat Lengkap */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Alamat Lengkap / Asal
                  </label>
                  <textarea
                    rows={2}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Desa, Kecamatan, Kabupaten asal"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-rose-500 transition-colors resize-none"
                  />
                </div>

                {/* Submit Action */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Perubahan foto dan data profil akan langsung tersimpan.
                  </span>
                  <button
                    type="submit"
                    disabled={submittingProfile}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#800020] via-[#94112e] to-[#ab1737] hover:from-[#94112e] hover:to-[#be123c] text-white shadow-glow border border-rose-500/30 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {submittingProfile ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Menyimpan Profil...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Simpan Perubahan Profil</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* TAB 2: FORM GANTI KATA SANDI */
            <div className="glass-panel rounded-2xl p-6 border border-white/10 bg-slate-900/50 backdrop-blur-xl shadow-xl">
              <div className="border-b border-white/10 pb-4 mb-5">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Key className="w-4 h-4 text-amber-400" />
                  Perbarui Kata Sandi Akun
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Gunakan kombinasi kata sandi yang aman untuk melindungi akun portal anggota Anda.
                </p>
              </div>

              <form onSubmit={handleSubmitPassword} className="space-y-4">
                {/* Current Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Kata Sandi Saat Ini <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword.current ? 'text' : 'password'}
                      required
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      placeholder="Masukkan kata sandi lama Anda"
                      className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-rose-500 font-mono transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showPassword.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Kata Sandi Baru <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword.new ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      placeholder="Minimal 6 karakter"
                      className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-rose-500 font-mono transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showPassword.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Ulangi Kata Sandi Baru <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword.confirm ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      placeholder="Ketik ulang kata sandi baru"
                      className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-rose-500 font-mono transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showPassword.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Setelah diperbarui, gunakan kata sandi baru untuk sesi masuk berikutnya.
                  </span>
                  <button
                    type="submit"
                    disabled={submittingPassword}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 text-white shadow-glow border border-amber-500/30 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {submittingPassword ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Mereset Sandi...</span>
                      </>
                    ) : (
                      <>
                        <Key className="w-4 h-4" />
                        <span>Perbarui Kata Sandi</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

