import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  UserPlus,
  Users,
  Key,
  Edit2,
  Trash2,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle2,
  Eye,
  EyeOff,
  RefreshCw,
  Clock,
  Mail,
  User,
  Phone,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { Modal } from '../../components/ui/Modal.jsx';
import { toast } from '../../store/toastStore.js';
import { useAuthStore } from '../../store/authStore.js';
import api from '../../api/axios.js';

export const AdminUsersPage = () => {
  const { user: currentUser } = useAuthStore();
  const [admins, setAdmins] = useState([]);
  const [meta, setMeta] = useState({ total: 1, maxSlots: 5, remainingSlots: 4, isLimitReached: false });
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    phone: '',
  });

  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin-users');
      setAdmins(res.data.data || []);
      if (res.data.meta) {
        setMeta(res.data.meta);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengambil data pengelola admin');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleOpenAddModal = () => {
    if (meta.isLimitReached) {
      toast.warning(`Batas maksimal ${meta.maxSlots} pengelola Super Admin telah tercapai.`);
      return;
    }
    setFormData({
      username: '',
      email: '',
      password: '',
      fullName: '',
      phone: '',
    });
    setShowPassword(false);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (admin) => {
    setSelectedAdmin(admin);
    setFormData({
      username: admin.username,
      email: admin.email,
      fullName: admin.member?.fullName || '',
      phone: admin.member?.phone || '',
    });
    setIsEditModalOpen(true);
  };

  const handleOpenResetPasswordModal = (admin) => {
    setSelectedAdmin(admin);
    setNewPassword('');
    setShowPassword(false);
    setIsResetPasswordModalOpen(true);
  };

  const handleOpenDeleteModal = (admin) => {
    if (admin.id === currentUser?.id) {
      toast.warning('Demi keamanan, Anda tidak dapat menghapus akun Anda sendiri.');
      return;
    }
    if (admins.length <= 1) {
      toast.warning('Tidak dapat menghapus akun karena merupakan satu-satunya Super Admin tersisa.');
      return;
    }
    setSelectedAdmin(admin);
    setIsDeleteModalOpen(true);
  };

  const handleGenerateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%&*';
    let pass = '';
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    // ensure at least 1 digit and 1 letter
    if (!/\d/.test(pass)) pass += '7';
    if (!/[a-zA-Z]/.test(pass)) pass += 'A';
    setNewPassword(pass);
    setShowPassword(true);
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.email || !formData.password) {
      toast.error('Username, email, dan kata sandi wajib diisi!');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('Kata sandi minimal 8 karakter demi keamanan!');
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/admin-users', formData);
      toast.success(`Pengelola Super Admin '${formData.username}' berhasil dibuat!`);
      setIsAddModalOpen(false);
      fetchAdmins();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menambahkan pengelola admin');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateAdmin = async (e) => {
    e.preventDefault();
    if (!selectedAdmin) return;

    try {
      setSubmitting(true);
      await api.put(`/admin-users/${selectedAdmin.id}`, {
        username: formData.username,
        email: formData.email,
        fullName: formData.fullName,
        phone: formData.phone,
      });
      toast.success('Data pengelola berhasil diperbarui');
      setIsEditModalOpen(false);
      fetchAdmins();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memperbarui data pengelola');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!selectedAdmin) return;

    if (!newPassword || newPassword.length < 8) {
      toast.error('Kata sandi baru minimal 8 karakter demi keamanan');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.patch(`/admin-users/${selectedAdmin.id}/reset-password`, {
        newPassword,
      });
      toast.success(res.data?.message || 'Kata sandi berhasil direset! Sesi akun tersebut telah dicabut.');
      setIsResetPasswordModalOpen(false);
      fetchAdmins();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mereset kata sandi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnlockAccount = async (admin) => {
    try {
      const res = await api.post(`/admin-users/${admin.id}/unlock`);
      toast.success(res.data?.message || `Kunci akun ${admin.username} berhasil dibuka`);
      fetchAdmins();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal membuka kunci akun');
    }
  };

  const handleDeleteAdmin = async () => {
    if (!selectedAdmin) return;
    try {
      setSubmitting(true);
      const res = await api.delete(`/admin-users/${selectedAdmin.id}`);
      toast.success(res.data?.message || 'Pengelola admin berhasil dihapus');
      setIsDeleteModalOpen(false);
      fetchAdmins();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus pengelola admin');
    } finally {
      setSubmitting(false);
    }
  };

  const isAccountLocked = (admin) => {
    if (!admin.lockedUntil) return false;
    return new Date(admin.lockedUntil) > new Date();
  };

  const getLockRemainingMinutes = (admin) => {
    if (!isAccountLocked(admin)) return 0;
    return Math.ceil((new Date(admin.lockedUntil) - new Date()) / 60000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-[#800020]/40 to-slate-900 p-6 border border-white/10 shadow-xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-[#800020]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#800020] to-rose-700 p-0.5 shadow-glow flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold text-white tracking-wide">
                  Pengelola & Hak Akses Admin
                </h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold">
                  Maksimal 5 Orang
                </span>
              </div>
              <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Manajemen akun yang memiliki wewenang Super Admin penuh untuk mengelola inventaris, peminjaman, keuangan, dan seluruh modul aplikasi secara aman.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchAdmins}
              className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/10 transition-colors shadow-sm"
              title="Segarkan Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-rose-400' : ''}`} />
            </button>
            <button
              onClick={handleOpenAddModal}
              disabled={meta.isLimitReached}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all shadow-glow ${
                meta.isLimitReached
                  ? 'bg-slate-800 text-slate-500 border border-white/5 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#800020] via-[#94112e] to-[#ab1737] hover:from-[#94112e] hover:to-[#be123c] text-white border border-rose-500/30 active:scale-95'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Tambah Pengelola</span>
            </button>
          </div>
        </div>
      </div>

      {/* Security Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Slot Quota */}
        <div className="glass-panel rounded-2xl p-4 border border-white/10 bg-slate-900/60 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Slot Kuota Admin</span>
            <div className="w-8 h-8 rounded-lg bg-[#800020]/30 flex items-center justify-center text-rose-400 border border-rose-500/20">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">{meta.total}</span>
              <span className="text-sm text-slate-400">/ {meta.maxSlots} Pengelola</span>
              <span className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded-full border ${
                meta.isLimitReached
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              }`}>
                {meta.isLimitReached ? 'Slot Penuh' : `Tersisa ${meta.remainingSlots} Slot`}
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full h-2 rounded-full bg-slate-800 mt-3 overflow-hidden border border-white/5">
              <div
                className="h-full bg-gradient-to-r from-[#800020] to-rose-500 transition-all duration-500"
                style={{ width: `${(meta.total / meta.maxSlots) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 2: Brute Force Protection */}
        <div className="glass-panel rounded-2xl p-4 border border-white/10 bg-slate-900/60 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Proteksi Brute-Force</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Aktif & Memantau
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Akun akan otomatis terkunci selama 15 menit jika terdeteksi 5 kali gagal memasukkan kata sandi.
            </p>
          </div>
        </div>

        {/* Card 3: Hardened Encryption */}
        <div className="glass-panel rounded-2xl p-4 border border-white/10 bg-slate-900/60 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Keamanan Kriptografi</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 border border-amber-500/20">
              <Key className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-300 px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30">
                Bcrypt 12 Rounds
              </span>
              <span className="text-xs font-bold text-rose-300 px-2 py-0.5 rounded bg-rose-500/15 border border-rose-500/30">
                JWT Hardened
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Pencabutan sesi instan saat sandi direset dan proteksi pembatasan laju request (Rate Limiter).
            </p>
          </div>
        </div>
      </div>

      {/* Admin Table Section */}
      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-xl bg-slate-900/50 backdrop-blur-xl">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-white">Daftar Pengelola Super Admin</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-white/10">
              {admins.length} Terdaftar
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-slate-900/80 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                <th className="py-3 px-4">Pengelola</th>
                <th className="py-3 px-4">Username & Email</th>
                <th className="py-3 px-4">Status Keamanan</th>
                <th className="py-3 px-4">Kontak / WA</th>
                <th className="py-3 px-4">Terdaftar Sejak</th>
                <th className="py-3 px-4 text-right">Aksi Manajemen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-rose-400" />
                      <span>Memuat data pengelola admin...</span>
                    </div>
                  </td>
                </tr>
              ) : admins.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    Belum ada data pengelola admin terdaftar.
                  </td>
                </tr>
              ) : (
                admins.map((admin) => {
                  const isSelf = admin.id === currentUser?.id;
                  const locked = isAccountLocked(admin);
                  const remainingMinutes = getLockRemainingMinutes(admin);

                  return (
                    <tr
                      key={admin.id}
                      className={`hover:bg-white/[0.02] transition-colors ${
                        isSelf ? 'bg-[#800020]/5' : ''
                      }`}
                    >
                      {/* Avatar & Display Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#800020] to-rose-700 flex items-center justify-center text-white font-bold text-sm shadow-glow flex-shrink-0 border border-rose-400/30">
                            {(admin.member?.fullName || admin.username).slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-white">
                                {admin.member?.fullName || admin.username}
                              </span>
                              {isSelf && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                  Akun Anda
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400">
                              {admin.member?.division || 'Super Administrator'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Username & Email */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-mono text-slate-200 font-medium">@{admin.username}</span>
                          <span className="text-slate-400 text-[11px] flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-500" />
                            {admin.email}
                          </span>
                        </div>
                      </td>

                      {/* Security Status */}
                      <td className="py-3.5 px-4">
                        {locked ? (
                          <div className="flex flex-col gap-1 items-start">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                              <Lock className="w-3 h-3 text-rose-400" />
                              Terkunci ({remainingMinutes} mnt)
                            </span>
                            <button
                              onClick={() => handleUnlockAccount(admin)}
                              className="text-[10px] text-amber-400 hover:text-amber-300 hover:underline flex items-center gap-1 font-medium"
                            >
                              <Unlock className="w-3 h-3" /> Buka Kunci Sekarang
                            </button>
                          </div>
                        ) : admin.loginAttempts > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            <AlertTriangle className="w-3 h-3" />
                            {admin.loginAttempts}x Gagal Login
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" />
                            Aktif & Aman
                          </span>
                        )}
                      </td>

                      {/* Phone */}
                      <td className="py-3.5 px-4">
                        {admin.member?.phone ? (
                          <span className="text-slate-300 font-mono text-[11px] flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-500" />
                            {admin.member.phone}
                          </span>
                        ) : (
                          <span className="text-slate-500 italic text-[11px]">-</span>
                        )}
                      </td>

                      {/* Created At */}
                      <td className="py-3.5 px-4">
                        <span className="text-slate-400 text-[11px] flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          {new Date(admin.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Reset Password */}
                          <button
                            onClick={() => handleOpenResetPasswordModal(admin)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 border border-white/5 transition-colors"
                            title="Reset Kata Sandi"
                          >
                            <Key className="w-4 h-4" />
                          </button>

                          {/* Edit Details */}
                          <button
                            onClick={() => handleOpenEditModal(admin)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-blue-300 border border-white/5 transition-colors"
                            title="Edit Data Pengelola"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Delete Admin */}
                          <button
                            onClick={() => handleOpenDeleteModal(admin)}
                            disabled={isSelf || admins.length <= 1}
                            className={`p-1.5 rounded-lg transition-colors border ${
                              isSelf || admins.length <= 1
                                ? 'bg-slate-800/40 text-slate-600 border-white/5 cursor-not-allowed'
                                : 'bg-slate-800 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border-white/5'
                            }`}
                            title={
                              isSelf
                                ? 'Tidak dapat menghapus akun sendiri'
                                : admins.length <= 1
                                ? 'Satu-satunya Super Admin tersisa'
                                : 'Hapus Pengelola'
                            }
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Best Practices Card */}
      <div className="p-4 rounded-2xl bg-slate-900/40 border border-white/10 flex items-start gap-3.5">
        <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5 border border-amber-500/20">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="text-xs text-slate-300 space-y-1">
          <span className="font-semibold text-white block">Panduan Keamanan Pengelola:</span>
          <p className="text-slate-400 leading-relaxed">
            1. Pastikan setiap pengelola menggunakan kata sandi unik dengan kombinasi minimal 8 karakter huruf dan angka.
            <br />
            2. Jangan membagikan akun admin yang sama kepada beberapa orang. Buatlah akun terpisah untuk setiap orang pengelola (hingga 5 orang) agar log aktivitas tercatat dengan akurat.
            <br />
            3. Jika seorang pengelola tidak lagi bertugas, segera lakukan reset kata sandi atau hapus akun tersebut dari daftar ini.
          </p>
        </div>
      </div>

      {/* MODAL 1: Tambah Pengelola Baru */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Tambah Pengelola Super Admin Baru"
        size="md"
      >
        <form onSubmit={handleCreateAdmin} className="space-y-4">
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>Akun ini akan langsung memiliki hak akses penuh (SUPER_ADMIN) ke seluruh modul sistem.</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Username <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                placeholder="misal: admin_ihya, budi_admin"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-rose-500 font-mono"
              />
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Hanya boleh huruf kecil, angka, dan garis bawah (_).</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Email Pengelola <span className="text-rose-400">*</span>
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="admin@rojabiyyah.or.id"
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Nama Lengkap Pengelola (Opsional)
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="Nama lengkap pengelola"
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              No. WhatsApp / HP (Opsional)
            </label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="081234567890"
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-rose-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Kata Sandi <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Minimal 8 karakter kombinasi huruf & angka"
                className="w-full px-3 py-2 pr-10 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-rose-500 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Disarankan minimal 8 karakter dengan perpaduan huruf besar, huruf kecil, dan angka.
            </span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-white/5 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#800020] to-rose-600 hover:from-rose-800 hover:to-rose-700 text-white transition-all shadow-glow flex items-center gap-1.5"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Buat Pengelola Admin</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: Edit Data Pengelola */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Pengelola: ${selectedAdmin?.username}`}
        size="md"
      >
        <form onSubmit={handleUpdateAdmin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Username <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-rose-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Email Pengelola <span className="text-rose-400">*</span>
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Nama Lengkap
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              No. WhatsApp / HP
            </label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-rose-500 font-mono"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-white/5 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#800020] to-rose-600 hover:from-rose-800 hover:to-rose-700 text-white transition-all shadow-glow flex items-center gap-1.5"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <span>Simpan Perubahan</span>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: Reset Kata Sandi */}
      <Modal
        isOpen={isResetPasswordModalOpen}
        onClose={() => setIsResetPasswordModalOpen(false)}
        title={`Reset Kata Sandi: ${selectedAdmin?.username}`}
        size="md"
      >
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Tindakan Keamanan Sesi:</span>
            </div>
            <p className="text-amber-200/80 leading-relaxed">
              Setelah kata sandi direset, sesi login aktif dari pengelola ini akan langsung dicabut (revoke). Akun tersebut harus login kembali menggunakan kata sandi baru.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-300">
                Kata Sandi Baru <span className="text-rose-400">*</span>
              </label>
              <button
                type="button"
                onClick={handleGenerateRandomPassword}
                className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 font-medium"
              >
                <Sparkles className="w-3 h-3" /> Buat Sandi Acak Kuat
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Masukkan kata sandi baru (min. 8 karakter)"
                className="w-full px-3 py-2 pr-10 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-rose-500 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Wajib minimal 8 karakter dengan kombinasi huruf dan angka.
            </span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={() => setIsResetPasswordModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-white/5 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 text-white transition-all shadow-glow flex items-center gap-1.5"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Mereset Sandi...</span>
                </>
              ) : (
                <>
                  <Key className="w-3.5 h-3.5" />
                  <span>Terapkan Kata Sandi Baru</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 4: Konfirmasi Hapus Admin */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Konfirmasi Hapus Pengelola Super Admin"
        size="sm"
      >
        <div className="space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto shadow-glow">
            <Trash2 className="w-6 h-6" />
          </div>

          <div className="text-center space-y-1">
            <h3 className="text-sm font-bold text-white">
              Hapus Akun Pengelola '{selectedAdmin?.username}'?
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Tindakan ini akan mencabut seluruh hak akses Super Admin dari pengguna ini dan tidak dapat dibatalkan.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-white/5 transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={handleDeleteAdmin}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white transition-all shadow-glow flex items-center gap-1.5"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Menghapus...</span>
                </>
              ) : (
                <span>Ya, Hapus Pengelola</span>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

