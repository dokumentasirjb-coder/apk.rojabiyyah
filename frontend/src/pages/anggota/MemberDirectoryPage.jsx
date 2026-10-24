import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  MapPin,
  Phone,
  User,
  Lock,
  Save,
  CheckCircle,
  Key,
  Shield,
  Sparkles,
  Briefcase,
  GraduationCap,
  Building,
  Shirt,
  Layers,
} from 'lucide-react';
import { StatusBadge } from '../../components/ui/StatusBadge.jsx';
import { useAuthStore } from '../../store/authStore.js';
import api from '../../api/axios.js';

const SHIRT_SIZES = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

export const MemberDirectoryPage = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('directory'); // 'directory' | 'profile'
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Profile Form
  const [profileData, setProfileData] = useState({
    fullName: '',
    division: '',
    education: '',
    grade: '',
    domicile: '',
    shirtSize: 'L',
    phone: '',
    address: '',
    notes: '',
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Change Password Form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState(null);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/members?limit=100');
      setMembers(res.data.data || []);
    } catch (err) {
      console.error('Gagal mengambil direktori anggota:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyProfile = async () => {
    try {
      const res = await api.get('/auth/me');
      const member = res.data.data?.member;
      if (member) {
        setProfileData({
          fullName: member.fullName || '',
          division: member.division || '',
          education: member.education || '',
          grade: member.grade || '',
          domicile: member.domicile || '',
          shirtSize: member.shirtSize || 'L',
          phone: member.phone || '',
          address: member.address || '',
          notes: member.notes || '',
        });
      }
    } catch (err) {
      console.error('Gagal memuat profil anggota:', err);
    }
  };

  useEffect(() => {
    fetchMembers();
    fetchMyProfile();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!user?.member?.id) return;
    try {
      setIsSavingProfile(true);
      setProfileSuccess(false);
      await api.put(`/members/${user.member.id}`, profileData);
      setProfileSuccess(true);
      fetchMembers();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal memperbarui profil');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Konfirmasi kata sandi tidak cocok');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordError('Kata sandi baru minimal 6 karakter');
      return;
    }

    try {
      setIsSavingPassword(true);
      setPasswordError(null);
      setPasswordSuccess(false);
      await api.put('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
      });
      setPasswordSuccess(true);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Gagal mengganti kata sandi');
    } finally {
      setIsSavingPassword(false);
    }
  };

  const filteredMembers = members.filter((m) => {
    const s = search.toLowerCase();
    return (
      m.fullName?.toLowerCase().includes(s) ||
      m.memberId?.toLowerCase().includes(s) ||
      m.division?.toLowerCase().includes(s) ||
      m.education?.toLowerCase().includes(s) ||
      m.domicile?.toLowerCase().includes(s) ||
      m.region?.name?.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <Users className="w-6 h-6 text-indigo-400" />
          Direktori Anggota & Profil Saya
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Daftar kontak panitia organisasi, divisi tugas, serta pengaturan data profil mandiri Anda.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab('directory')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'directory'
              ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 shadow-glow'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Direktori Panitia ({members.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'profile'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-glow'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profil & Keamanan Akun Saya</span>
        </button>
      </div>

      {/* Tab 1: Directory */}
      {activeTab === 'directory' && (
        <div className="space-y-4">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Cari nama, divisi (DEV), pendidikan, domisili..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full glass-input pl-9 text-xs"
            />
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400">
              <div className="inline-block w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-2" />
              <p className="text-xs">Memuat direktori...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMembers.map((m) => (
                <div
                  key={m.id}
                  className="glass-card p-4 border border-white/10 hover:border-white/20 transition-all shadow-glass flex flex-col justify-between rounded-xl"
                >
                  <div>
                    {/* Top Header Card */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xs uppercase flex-shrink-0 shadow-sm overflow-hidden">
                          {m.fullName.slice(0, 2)}
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-xs truncate">{m.fullName}</h4>
                          <span className="font-mono text-[10px] text-cyan-400 font-bold block">
                            {m.memberId}
                          </span>
                        </div>
                      </div>
                      <StatusBadge status={m.status} />
                    </div>

                    {/* Divisi & Seragam Badges */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                      {m.division && (
                        <span className="px-2 py-0.5 rounded-md bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-semibold text-[10px] flex items-center gap-1">
                          <Briefcase className="w-3 h-3" />
                          <span>{m.division}</span>
                        </span>
                      )}
                      {m.shirtSize && (
                        <span className="px-2 py-0.5 rounded-md bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-bold text-[10px] flex items-center gap-1">
                          <Shirt className="w-3 h-3" />
                          <span>{m.shirtSize}</span>
                        </span>
                      )}
                    </div>

                    {/* Detail Information */}
                    <div className="space-y-1 text-slate-300 text-[11px] pt-2 border-t border-white/5">
                      {m.education && (
                        <p className="flex items-center gap-1.5 truncate text-slate-300">
                          <GraduationCap className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                          <span>{m.education} {m.grade ? `(${m.grade})` : ''}</span>
                        </p>
                      )}
                      {m.domicile && (
                        <p className="flex items-center gap-1.5 truncate text-slate-300">
                          <Building className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                          <span>{m.domicile}</span>
                        </p>
                      )}
                      {m.region?.name && (
                        <p className="flex items-center gap-1.5 truncate text-slate-400 text-[10px]">
                          <MapPin className="w-3 h-3 text-slate-500 flex-shrink-0" />
                          <span>{m.region.name}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Phone / WA Action */}
                  {m.phone && (
                    <div className="mt-3 pt-2 border-t border-white/5">
                      <a
                        href={`https://wa.me/${m.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-mono text-[11px] hover:underline"
                      >
                        <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{m.phone}</span>
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Profile & Security */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Edit Profile Form */}
          <div className="glass-card p-6 border border-white/10 shadow-glass rounded-2xl">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-cyan-400" />
              Perbarui Data Profil Mandiri
            </h3>

            {profileSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Profil Anda berhasil diperbarui!</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={profileData.fullName}
                  onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                  className="w-full glass-input"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Divisi (DEV)</label>
                  <input
                    type="text"
                    value={profileData.division}
                    onChange={(e) => setProfileData({ ...profileData, division: e.target.value })}
                    className="w-full glass-input"
                    placeholder="misal: Fotografer"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Ukuran Seragam</label>
                  <select
                    value={profileData.shirtSize}
                    onChange={(e) => setProfileData({ ...profileData, shirtSize: e.target.value })}
                    className="w-full glass-input"
                  >
                    {SHIRT_SIZES.map((s) => (
                      <option key={s} value={s} className="bg-slate-900 text-white">
                        Ukuran {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Pendidikan</label>
                  <input
                    type="text"
                    value={profileData.education}
                    onChange={(e) => setProfileData({ ...profileData, education: e.target.value })}
                    className="w-full glass-input"
                    placeholder="misal: UNWAHA, IAIBAFA"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Kelas / Tingkat</label>
                  <input
                    type="text"
                    value={profileData.grade}
                    onChange={(e) => setProfileData({ ...profileData, grade: e.target.value })}
                    className="w-full glass-input"
                    placeholder="misal: Semester 4"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Domisili / Pondok</label>
                  <input
                    type="text"
                    value={profileData.domicile}
                    onChange={(e) => setProfileData({ ...profileData, domicile: e.target.value })}
                    className="w-full glass-input"
                    placeholder="misal: Al-Muhibbin, Al-Amanah"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Nomor WhatsApp</label>
                  <input
                    type="text"
                    placeholder="0812xxxxxxxx"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="w-full glass-input"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Alamat Asal / Lengkap</label>
                <textarea
                  rows="2"
                  value={profileData.address}
                  onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                  className="w-full glass-input"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-5 py-2.5 rounded-xl gradient-btn font-bold shadow-glow flex items-center gap-2 disabled:opacity-50 text-white"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingProfile ? 'Menyimpan...' : 'Simpan Profil'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="glass-card p-6 border border-white/10 shadow-glass rounded-2xl">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-400" />
              Ganti Kata Sandi Akun
            </h3>

            {passwordSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Kata sandi berhasil diubah!</span>
              </div>
            )}

            {passwordError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
                {passwordError}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Kata Sandi Saat Ini</label>
                <input
                  type="password"
                  required
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                  }
                  className="w-full glass-input"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Kata Sandi Baru</label>
                <input
                  type="password"
                  required
                  placeholder="Minimal 6 karakter"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                  }
                  className="w-full glass-input"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Konfirmasi Kata Sandi Baru
                </label>
                <input
                  type="password"
                  required
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                  }
                  className="w-full glass-input"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSavingPassword}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold transition-all shadow-glow flex items-center gap-2 disabled:opacity-50"
                >
                  <Lock className="w-4 h-4" />
                  <span>{isSavingPassword ? 'Memperbarui...' : 'Perbarui Kata Sandi'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default MemberDirectoryPage;
