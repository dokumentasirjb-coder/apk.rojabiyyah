import React, { useState, useEffect, useRef } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Key,
  Phone,
  MapPin,
  Download,
  Upload,
  FileSpreadsheet,
  Share2,
  Check,
  Briefcase,
  GraduationCap,
  Layers,
  Shirt,
  Building,
  Lock,
  ExternalLink,
  X,
  AlertCircle,
} from 'lucide-react';
import { StatusBadge } from '../../components/ui/StatusBadge.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
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
  'Gresik',
  'Mojokerto',
  'Surabaya',
];

const SHIRT_SIZES = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

export const AdminMembersPage = () => {
  const [members, setMembers] = useState([]);
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });

  // Filters
  const [search, setSearch] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedDomicile, setSelectedDomicile] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Modals & UI States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [selectedMemberForReset, setSelectedMemberForReset] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
  const importFileInputRef = useRef(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Form State
  const [createAccount, setCreateAccount] = useState(false);
  const [formData, setFormData] = useState({
    memberId: '',
    fullName: '',
    division: '',
    education: '',
    grade: '',
    domicile: '',
    shirtSize: 'L',
    phone: '',
    address: '',
    regionId: '',
    status: 'ACTIVE',
    notes: '',
    // User credentials (optional)
    username: '',
    email: '',
    password: '',
    role: 'ANGGOTA',
  });

  const fetchMembers = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 15,
        search: search || undefined,
        division: selectedDivision || undefined,
        domicile: selectedDomicile || undefined,
        regionId: selectedRegion || undefined,
        status: selectedStatus || undefined,
      };
      const res = await api.get('/members', { params });
      setMembers(res.data.data || []);
      setPagination(res.data.meta);
    } catch (err) {
      console.error('Gagal mengambil data anggota:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRegions = async () => {
    try {
      const res = await api.get('/regions');
      setRegions(res.data.data || []);
    } catch {
      // non-blocking
    }
  };

  useEffect(() => {
    fetchRegions();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchMembers(1);
    }, 300);
    return () => clearTimeout(timeout);
  }, [search, selectedDivision, selectedDomicile, selectedRegion, selectedStatus]);

  const handleCopyLink = () => {
    const registrationUrl = `${window.location.origin}/pendaftaran`;
    navigator.clipboard.writeText(registrationUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      const res = await api.get('/members/export', {
        params: {
          search: search || undefined,
          division: selectedDivision || undefined,
          domicile: selectedDomicile || undefined,
          regionId: selectedRegion || undefined,
          status: selectedStatus || undefined,
        },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'data-anggota-rojabiyyaah.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Gagal mengekspor data anggota.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      setIsDownloadingTemplate(true);
      const res = await api.get('/members/template-excel', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'template-import-anggota-rojabiyyaah.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      alert('Gagal mengunduh template Excel.');
    } finally {
      setIsDownloadingTemplate(false);
    }
  };

  const handleImportExcel = async (e) => {
    e.preventDefault();
    if (!importFile) {
      alert('Silakan pilih file Excel (.xlsx / .xls) terlebih dahulu');
      return;
    }

    try {
      setIsImporting(true);
      const data = new FormData();
      data.append('file', importFile);

      const res = await api.post('/members/import-excel', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert(res.data?.message || 'Data anggota berhasil diimpor!');
      setIsImportModalOpen(false);
      setImportFile(null);
      fetchMembers(1);
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mengimpor file Excel');
    } finally {
      setIsImporting(false);
    }
  };

  const handleOpenModal = (member = null) => {
    if (member) {
      setEditingMember(member);
      setCreateAccount(false);
      setFormData({
        memberId: member.memberId,
        fullName: member.fullName,
        division: member.division || '',
        education: member.education || '',
        grade: member.grade || '',
        domicile: member.domicile || '',
        shirtSize: member.shirtSize || 'L',
        phone: member.phone || '',
        address: member.address || '',
        regionId: member.regionId ? String(member.regionId) : '',
        status: member.status,
        notes: member.notes || '',
        username: member.user?.username || '',
        email: member.user?.email || '',
        password: '',
        role: member.user?.role || 'ANGGOTA',
      });
    } else {
      setEditingMember(null);
      setCreateAccount(false);
      setFormData({
        memberId: '',
        fullName: '',
        division: '',
        education: '',
        grade: '',
        domicile: '',
        shirtSize: 'L',
        phone: '',
        address: '',
        regionId: '',
        status: 'ACTIVE',
        notes: '',
        username: '',
        email: '',
        password: '',
        role: 'ANGGOTA',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);

      const payload = {
        fullName: formData.fullName,
        division: formData.division || null,
        education: formData.education || null,
        grade: formData.grade || null,
        domicile: formData.domicile || null,
        shirtSize: formData.shirtSize || null,
        phone: formData.phone || null,
        address: formData.address || null,
        regionId: formData.regionId ? parseInt(formData.regionId) : null,
        status: formData.status,
        notes: formData.notes || null,
      };

      if (editingMember) {
        if (formData.email) payload.email = formData.email;
        if (formData.role) payload.role = formData.role;
        await api.put(`/members/${editingMember.id}`, payload);
      } else {
        if (formData.memberId) payload.memberId = formData.memberId;
        if (createAccount && formData.username && formData.password) {
          payload.username = formData.username;
          payload.email = formData.email;
          payload.password = formData.password;
          payload.role = formData.role;
        }
        await api.post('/members', payload);
      }

      setIsModalOpen(false);
      fetchMembers(pagination.page);
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan data anggota');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      alert('Kata sandi baru minimal 6 karakter');
      return;
    }
    try {
      setIsSubmitting(true);
      await api.post(`/members/${selectedMemberForReset.id}/reset-password`, {
        newPassword,
      });
      alert('Kata sandi berhasil diperbarui');
      setIsResetPasswordOpen(false);
      setNewPassword('');
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mereset kata sandi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/members/${id}`);
      setDeleteConfirmId(null);
      fetchMembers(pagination.page);
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus anggota');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-indigo-400" />
            Manajemen Data Anggota
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Data keanggotaan, penugasan divisi (DEV), pendidikan, domisili, seragam, dan kontrol wilayah.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Copy Public Registration Link Button */}
          <button
            onClick={handleCopyLink}
            type="button"
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 hover:border-cyan-500/50 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
            title="Salin tautan formulir pendaftaran anggota untuk dibagikan di WhatsApp"
          >
            {copiedLink ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-300 font-bold">Link Form Tersalin!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-cyan-400" />
                <span>Salin Link Pendaftaran Anggota</span>
              </>
            )}
          </button>

          {/* Export Excel Button */}
          <button
            onClick={handleExportExcel}
            disabled={isExporting}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-emerald-500/30 hover:border-emerald-400 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-60"
            title="Unduh data dalam format Excel sesuai kolom tabel"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>{isExporting ? 'Mengekspor...' : 'Ekspor Excel'}</span>
          </button>

          {/* Import Excel Button */}
          <button
            type="button"
            onClick={() => {
              setImportFile(null);
              setIsImportModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-indigo-500/30 hover:border-indigo-400 text-indigo-300 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
            title="Impor data anggota langsung dari file Excel tanpa perlu input satu per satu"
          >
            <Upload className="w-4 h-4 text-indigo-400" />
            <span>Impor Excel</span>
          </button>

          {/* Add Member Button */}
          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2 rounded-xl gradient-btn text-xs font-bold flex items-center gap-2 shadow-glow text-white"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Anggota</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-card p-4 border border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Search */}
        <div className="relative lg:col-span-2">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Cari nama, divisi, pendidikan, domisili, no WA..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full glass-input pl-9 text-xs"
          />
        </div>

        {/* Filter Divisi (DEV) */}
        <div>
          <select
            value={selectedDivision}
            onChange={(e) => setSelectedDivision(e.target.value)}
            className="w-full glass-input text-xs"
          >
            <option value="">Semua Divisi (DEV)</option>
            {DIVISIONS.map((d) => (
              <option key={d} value={d} className="bg-slate-900 text-white">
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Filter Domisili */}
        <div>
          <select
            value={selectedDomicile}
            onChange={(e) => setSelectedDomicile(e.target.value)}
            className="w-full glass-input text-xs"
          >
            <option value="">Semua Domisili</option>
            {DOMICILES.map((dom) => (
              <option key={dom} value={dom} className="bg-slate-900 text-white">
                {dom}
              </option>
            ))}
          </select>
        </div>

        {/* Filter Status */}
        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full glass-input text-xs"
          >
            <option value="">Semua Status</option>
            <option value="ACTIVE" className="bg-slate-900 text-white">Aktif</option>
            <option value="INACTIVE" className="bg-slate-900 text-white">Non-Aktif</option>
          </select>
        </div>
      </div>

      {/* Main Table: Matches User Spreadsheet Exactly (NO, NAMA, DEV, PENDIDIKAN, KELAS, DOMISILI, SERAGAM, NO WA, AKSI) */}
      <div className="glass-card border border-white/10 overflow-hidden shadow-glass rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900/90 border-b border-white/10 text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-3 text-center w-12">NO</th>
                <th className="py-3.5 px-4">NAMA</th>
                <th className="py-3.5 px-3">DEV (DIVISI)</th>
                <th className="py-3.5 px-3">PENDIDIKAN</th>
                <th className="py-3.5 px-3 text-center">KELAS</th>
                <th className="py-3.5 px-3">DOMISILI</th>
                <th className="py-3.5 px-3 text-center">SERAGAM</th>
                <th className="py-3.5 px-3">NO WA</th>
                <th className="py-3.5 px-3 text-center">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-slate-400">
                    <div className="inline-block w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-2" />
                    <p>Memuat data anggota...</p>
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan="9">
                    <EmptyState
                      title="Tidak Ada Anggota"
                      message="Belum ada data anggota yang terdaftar atau sesuai dengan filter pencarian."
                    />
                  </td>
                </tr>
              ) : (
                members.map((member, index) => {
                  const rowNumber = (pagination.page - 1) * pagination.limit + index + 1;
                  return (
                    <tr key={member.id} className="hover:bg-white/5 transition-colors">
                      {/* NO */}
                      <td className="py-3 px-3 text-center font-mono text-slate-400 font-semibold">
                        {rowNumber}
                      </td>

                      {/* NAMA */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex-shrink-0 flex items-center justify-center text-white font-bold text-[10px] uppercase shadow-sm">
                            {member.fullName.slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-bold text-white text-xs">{member.fullName}</p>
                            <span className="text-[10px] font-mono text-cyan-400 font-medium">
                              {member.memberId}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* DEV (DIVISI) */}
                      <td className="py-3 px-3">
                        {member.division ? (
                          <span className="inline-block px-2 py-0.5 rounded-md bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-semibold text-[11px]">
                            {member.division}
                          </span>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </td>

                      {/* PENDIDIKAN */}
                      <td className="py-3 px-3">
                        <span className="text-slate-300 font-medium">
                          {member.education || '-'}
                        </span>
                      </td>

                      {/* KELAS */}
                      <td className="py-3 px-3 text-center">
                        <span className="text-slate-400 text-[11px]">
                          {member.grade || '-'}
                        </span>
                      </td>

                      {/* DOMISILI */}
                      <td className="py-3 px-3">
                        <span className="text-slate-300 font-medium flex items-center gap-1">
                          <Building className="w-3 h-3 text-slate-500 flex-shrink-0" />
                          <span>{member.domicile || '-'}</span>
                        </span>
                      </td>

                      {/* SERAGAM */}
                      <td className="py-3 px-3 text-center">
                        {member.shirtSize ? (
                          <span className="inline-block px-2 py-0.5 rounded-md bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-bold font-mono text-[11px]">
                            {member.shirtSize}
                          </span>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </td>

                      {/* NO WA */}
                      <td className="py-3 px-3">
                        {member.phone ? (
                          <a
                            href={`https://wa.me/${member.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-400 hover:text-emerald-300 hover:underline font-mono text-[11px] flex items-center gap-1"
                          >
                            <Phone className="w-3 h-3 flex-shrink-0" />
                            <span>{member.phone}</span>
                          </a>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </td>

                      {/* AKSI */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {member.userId && (
                            <button
                              onClick={() => {
                                setSelectedMemberForReset(member);
                                setIsResetPasswordOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                              title="Reset Password Akun"
                            >
                              <Key className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenModal(member)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                            title="Ubah Data"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(member.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

        {/* Pagination Bar */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <span>
              Total {pagination.total} anggota • Halaman {pagination.page} dari {pagination.totalPages}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => fetchMembers(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="px-3 py-1 rounded-lg bg-slate-900 border border-white/10 text-slate-300 disabled:opacity-40"
              >
                Sebelumnya
              </button>
              <button
                onClick={() => fetchMembers(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="px-3 py-1 rounded-lg bg-slate-900 border border-white/10 text-slate-300 disabled:opacity-40"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ====================== MODAL TAMBAH / UBAH ANGGOTA ====================== */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMember ? 'Ubah Data Anggota' : 'Tambah Anggota Baru'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Baris 1: ID Anggota & Nama Lengkap */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                ID Anggota (Opsional, otomatis jika kosong)
              </label>
              <input
                type="text"
                placeholder="RJB-XXX"
                value={formData.memberId}
                onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
                className="w-full glass-input"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Nama Lengkap <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="misal: M. Nasrul Wathon"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full glass-input"
              />
            </div>
          </div>

          {/* Baris 2: DEV & Pendidikan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Divisi Tugas (DEV)</label>
              <select
                value={formData.division}
                onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                className="w-full glass-input"
              >
                <option value="">Pilih Divisi (DEV)</option>
                {DIVISIONS.map((d) => (
                  <option key={d} value={d} className="bg-slate-900 text-white">
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Pendidikan</label>
              <input
                type="text"
                placeholder="misal: Abiturent, UNWAHA, IAIBAFA, MAN 3"
                value={formData.education}
                onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                className="w-full glass-input"
              />
            </div>
          </div>

          {/* Baris 3: Kelas & Domisili */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Kelas / Tingkat</label>
              <input
                type="text"
                placeholder="misal: XII IPA 1, Semester 4"
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                className="w-full glass-input"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Domisili / Pondok</label>
              <input
                type="text"
                placeholder="misal: Al-Muhibbin, Al-Amanah, Gresik"
                value={formData.domicile}
                onChange={(e) => setFormData({ ...formData, domicile: e.target.value })}
                className="w-full glass-input"
              />
            </div>
          </div>

          {/* Baris 4: Seragam & No WA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Ukuran Seragam</label>
              <div className="flex gap-2">
                {SHIRT_SIZES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setFormData({ ...formData, shirtSize: s })}
                    className={`flex-1 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                      formData.shirtSize === s
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                        : 'bg-slate-900 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">No. WhatsApp</label>
              <input
                type="text"
                placeholder="0812xxxxxxxx"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full glass-input"
              />
            </div>
          </div>

          {/* Baris 5: Wilayah & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Wilayah Penempatan</label>
              <select
                value={formData.regionId}
                onChange={(e) => setFormData({ ...formData, regionId: e.target.value })}
                className="w-full glass-input"
              >
                <option value="">Pilih Wilayah Operasional</option>
                {regions.map((r) => (
                  <option key={r.id} value={r.id} className="bg-slate-900 text-white">
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Status Keanggotaan</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full glass-input"
              >
                <option value="ACTIVE" className="bg-slate-900 text-white">Aktif</option>
                <option value="INACTIVE" className="bg-slate-900 text-white">Non-Aktif</option>
              </select>
            </div>
          </div>

          {/* Akun Login (Opsional untuk Tambah Anggota Baru) */}
          {!editingMember && (
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-cyan-400" />
                    Buat Akun Login untuk Anggota Ini?
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Jika tidak dicentang, data anggota tetap tersimpan tanpa akses login ke sistem.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={createAccount}
                  onChange={(e) => setCreateAccount(e.target.checked)}
                  className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                />
              </div>

              {createAccount && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-white/5">
                  <div>
                    <label className="block text-[11px] font-semibold text-indigo-300 mb-1">Username</label>
                    <input
                      type="text"
                      required
                      placeholder="username"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full glass-input text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-indigo-300 mb-1">Email</label>
                    <input
                      type="email"
                      placeholder="email@domain.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full glass-input text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-indigo-300 mb-1">Kata Sandi</label>
                    <input
                      type="text"
                      required
                      placeholder="min 6 karakter"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full glass-input text-xs"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tombol Simpan */}
          <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl gradient-btn text-white font-bold disabled:opacity-60"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Data'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ====================== MODAL RESET PASSWORD ====================== */}
      <Modal
        isOpen={isResetPasswordOpen}
        onClose={() => setIsResetPasswordOpen(false)}
        title="Reset Kata Sandi Anggota"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
          <p className="text-slate-400">
            Setel ulang kata sandi login untuk anggota{' '}
            <strong className="text-white">{selectedMemberForReset?.fullName}</strong>.
          </p>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Kata Sandi Baru</label>
            <input
              type="text"
              required
              placeholder="Minimal 6 karakter"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full glass-input"
            />
          </div>

          <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsResetPasswordOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-900 border border-white/10 text-slate-300"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl gradient-btn text-white font-bold disabled:opacity-60"
            >
              {isSubmitting ? 'Menyimpan...' : 'Reset Kata Sandi'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ====================== MODAL KONFIRMASI HAPUS ====================== */}
      <Modal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        title="Konfirmasi Hapus Data"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-300">
            Apakah Anda yakin ingin menghapus anggota ini? Tindakan ini tidak dapat dibatalkan.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setDeleteConfirmId(null)}
              className="px-4 py-2 rounded-xl bg-slate-900 border border-white/10 text-slate-300"
            >
              Batal
            </button>
            <button
              onClick={() => handleDelete(deleteConfirmId)}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold"
            >
              Hapus Anggota
            </button>
          </div>
        </div>
      </Modal>

      {/* ====================== MODAL IMPOR EXCEL ====================== */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Impor Data Anggota dari File Excel"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleImportExcel} className="space-y-4 text-xs">
          {/* Format Guidance Banner */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-indigo-500/30 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-indigo-300 flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-indigo-400" />
                Format Kolom Excel yang Didukung:
              </span>
              <button
                type="button"
                onClick={handleDownloadTemplate}
                disabled={isDownloadingTemplate}
                className="text-[11px] font-bold text-amber-400 hover:text-amber-300 underline flex items-center gap-1 disabled:opacity-50"
              >
                <Download className="w-3 h-3" />
                <span>{isDownloadingTemplate ? 'Mengunduh...' : 'Unduh Template Excel'}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Pastikan kolom di file Excel Anda memiliki susunan nama kolom berikut (sama seperti format tabel anggota Anda):
            </p>
            <div className="grid grid-cols-4 gap-1.5 pt-1 text-[10.5px] font-mono">
              <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 border border-white/10 text-center font-bold">NO</span>
              <span className="px-2 py-1 rounded bg-slate-800 text-rose-300 border border-rose-500/30 text-center font-bold">NAMA *</span>
              <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 border border-white/10 text-center">DEV</span>
              <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 border border-white/10 text-center">PENDIDIKAN</span>
              <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 border border-white/10 text-center">KELAS</span>
              <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 border border-white/10 text-center">DOMISILI</span>
              <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 border border-white/10 text-center">SERAGAM</span>
              <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 border border-white/10 text-center">NO WA</span>
            </div>
            <p className="text-[10px] text-slate-400 italic">
              * Kolom NAMA wajib terisi. Nomor Anggota (RJB-XXX) akan dibuatkan secara berurutan otomatis oleh sistem.
            </p>
          </div>

          {/* File Picker / Dropzone */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Pilih File Excel (.xlsx / .xls / .csv) <span className="text-rose-400">*</span>
            </label>
            <input
              type="file"
              ref={importFileInputRef}
              accept=".xlsx,.xls,.csv"
              onChange={(e) => setImportFile(e.target.files?.[0] || null)}
              className="hidden"
            />
            <div
              onClick={() => importFileInputRef.current?.click()}
              className={`p-6 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-colors ${
                importFile
                  ? 'border-emerald-500/50 bg-emerald-500/10'
                  : 'border-white/20 hover:border-indigo-400 bg-slate-900/60 hover:bg-slate-900'
              }`}
            >
              {importFile ? (
                <div className="flex flex-col items-center gap-1.5 text-center">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-white text-xs mt-1">{importFile.name}</span>
                  <span className="text-[11px] text-slate-400">
                    {(importFile.size / 1024).toFixed(1)} KB — Klik untuk mengganti file
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1.5 text-center">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                    <Upload className="w-5 h-5" />
                  </div>
                  <span className="font-semibold text-white text-xs mt-1">
                    Klik di sini untuk memilih file Excel
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Mendukung file spreadsheet Microsoft Excel (.xlsx, .xls)
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsImportModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-900 border border-white/10 text-slate-300"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isImporting || !importFile}
              className="px-5 py-2 rounded-xl gradient-btn text-white font-bold flex items-center gap-2 disabled:opacity-50"
            >
              {isImporting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Mengimpor Data...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Mulai Impor Data</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default AdminMembersPage;
