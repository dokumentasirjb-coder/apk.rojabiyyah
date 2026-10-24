import React, { useState, useEffect } from 'react';
import {
  Compass,
  Plus,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  XCircle,
  MapPin,
  Calendar,
  User,
  MessageSquare,
  Clock,
  Layers,
  Edit2,
  Trash2,
  Image,
  Video,
  Camera,
  Tv,
  Zap,
  Volume2,
  FileText,
  Eye,
  X,
  Sparkles,
} from 'lucide-react';
import { StatusBadge } from '../../components/ui/StatusBadge.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { formatDate } from '../../lib/utils.js';
import api from '../../api/axios.js';

const TASK_CATEGORIES = [
  { name: 'Proyektor', icon: Tv, color: 'text-cyan-400 bg-cyan-500/15 border-cyan-500/30' },
  { name: 'Fotografer', icon: Camera, color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30' },
  { name: 'Videografer', icon: Video, color: 'text-purple-400 bg-purple-500/15 border-purple-500/30' },
  { name: 'Perkabelan', icon: Zap, color: 'text-amber-400 bg-amber-500/15 border-amber-500/30' },
  { name: 'Sound System', icon: Volume2, color: 'text-rose-400 bg-rose-500/15 border-rose-500/30' },
  { name: 'Dokumentasi', icon: FileText, color: 'text-blue-400 bg-blue-500/15 border-blue-500/30' },
];

export const AdminRegionControlPage = () => {
  const [activeTab, setActiveTab] = useState('points'); // 'points' | 'reports'
  const [taskPoints, setTaskPoints] = useState([]);
  const [fieldReports, setFieldReports] = useState([]);
  const [regions, setRegions] = useState([]);
  const [members, setMembers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Modals
  const [isPointModalOpen, setIsPointModalOpen] = useState(false);
  const [isRespondModalOpen, setIsRespondModalOpen] = useState(false);
  const [editingPoint, setEditingPoint] = useState(null);
  const [targetReport, setTargetReport] = useState(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [isResolved, setIsResolved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Preview Media Modal
  const [previewMediaUrl, setPreviewMediaUrl] = useState(null);

  // Task Point Form State (Wilayah, Titik, Proyektor/Foto/Video/Kabel, Tanggal, Jam, PIC, Deskripsi)
  const [pointFormData, setPointFormData] = useState({
    name: '',
    regionId: '',
    categoryId: '',
    categoryName: 'Proyektor',
    address: '',
    picMemberId: '',
    taskDate: new Date().toISOString().split('T')[0],
    taskTime: '08:00 - Selesai WIB',
    schedule: '',
    notes: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pointsRes, reportsRes, regionsRes, membersRes, catsRes] = await Promise.all([
        api.get('/task-points?limit=150'),
        api.get('/field-reports?limit=150'),
        api.get('/regions'),
        api.get('/members?limit=150'),
        api.get('/settings/categories?type=TASK_POINT'),
      ]);

      setTaskPoints(pointsRes.data.data || []);
      setFieldReports(reportsRes.data.data || []);
      setRegions(regionsRes.data.data || []);
      setMembers(membersRes.data.data || []);
      setCategories(catsRes.data.data || []);
    } catch (err) {
      console.error('Gagal mengambil data kontrol wilayah:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenPointModal = (point = null) => {
    if (point) {
      setEditingPoint(point);
      // Parse schedule if contains date & time
      let tDate = new Date().toISOString().split('T')[0];
      let tTime = '08:00 - Selesai WIB';
      if (point.schedule) {
        if (point.schedule.includes('•')) {
          const parts = point.schedule.split('•');
          tDate = parts[0]?.trim() || tDate;
          tTime = parts[1]?.trim() || tTime;
        } else {
          tTime = point.schedule;
        }
      }

      setPointFormData({
        name: point.name,
        regionId: String(point.regionId),
        categoryId: point.categoryId ? String(point.categoryId) : '',
        categoryName: point.categoryName || 'Proyektor',
        address: point.address || '',
        picMemberId: point.picMemberId ? String(point.picMemberId) : '',
        taskDate: tDate,
        taskTime: tTime,
        schedule: point.schedule || '',
        notes: point.notes || '',
      });
    } else {
      setEditingPoint(null);
      setPointFormData({
        name: '',
        regionId: regions[0]?.id ? String(regions[0].id) : '',
        categoryId: categories.find(c => c.name === 'Proyektor')?.id ? String(categories.find(c => c.name === 'Proyektor').id) : '',
        categoryName: 'Proyektor',
        address: '',
        picMemberId: members[0]?.id ? String(members[0].id) : '',
        taskDate: new Date().toISOString().split('T')[0],
        taskTime: '08:00 - Selesai WIB',
        schedule: '',
        notes: '',
      });
    }
    setIsPointModalOpen(true);
  };

  const handleSubmitPoint = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      
      // Combine Tanggal & Jam into unified schedule string
      const formattedSchedule = pointFormData.taskDate
        ? `${pointFormData.taskDate} • ${pointFormData.taskTime || 'Fleksibel'}`
        : pointFormData.taskTime || 'Jadwal Acara';

      const payload = {
        name: pointFormData.name,
        regionId: parseInt(pointFormData.regionId),
        categoryId: pointFormData.categoryId ? parseInt(pointFormData.categoryId) : null,
        categoryName: pointFormData.categoryName,
        address: pointFormData.address,
        picMemberId: pointFormData.picMemberId ? parseInt(pointFormData.picMemberId) : null,
        schedule: formattedSchedule,
        notes: pointFormData.notes,
      };

      if (editingPoint) {
        await api.put(`/task-points/${editingPoint.id}`, payload);
      } else {
        await api.post('/task-points', payload);
      }

      setIsPointModalOpen(false);
      fetchData();
      alert(editingPoint ? 'Titik tugas berhasil diperbarui!' : 'Titik tugas baru berhasil ditambahkan!');
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan titik tugas');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePoint = async (id) => {
    if (!window.confirm('Yakin ingin menghapus titik tugas ini beserta seluruh riwayat laporannya?')) return;
    try {
      await api.delete(`/task-points/${id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus titik tugas');
    }
  };

  const handleOpenRespondModal = (report) => {
    setTargetReport(report);
    setAdminResponse(report.adminResponse || '');
    setIsResolved(report.isResolved || false);
    setIsRespondModalOpen(true);
  };

  const handleSubmitResponse = async (e) => {
    e.preventDefault();
    if (!targetReport) return;
    try {
      setIsSubmitting(true);
      await api.patch(`/field-reports/${targetReport.id}/respond`, {
        adminResponse,
        isResolved,
      });
      setIsRespondModalOpen(false);
      fetchData();
      alert('Tanggapan dan status penanganan berhasil diperbarui!');
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan tanggapan laporan');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered task points
  const filteredTaskPoints = taskPoints.filter((tp) => {
    if (selectedRegion && String(tp.regionId) !== String(selectedRegion)) return false;
    if (selectedCategory && tp.categoryName !== selectedCategory) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        tp.name?.toLowerCase().includes(q) ||
        tp.categoryName?.toLowerCase().includes(q) ||
        tp.address?.toLowerCase().includes(q) ||
        tp.notes?.toLowerCase().includes(q) ||
        tp.picMember?.fullName?.toLowerCase().includes(q) ||
        tp.region?.name?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Filtered reports
  const filteredReports = fieldReports.filter((r) => {
    if (selectedRegion && String(r.taskPoint?.regionId) !== String(selectedRegion)) return false;
    if (selectedStatus && r.status !== selectedStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        r.taskPoint?.name?.toLowerCase().includes(q) ||
        r.member?.fullName?.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const criticalCount = fieldReports.filter(
    (r) => !r.isResolved && (r.status === 'ATTENTION_NEEDED' || r.status === 'DAMAGED')
  ).length;

  const getCategoryBadge = (catName) => {
    const found = TASK_CATEGORIES.find((c) => c.name.toLowerCase() === (catName || '').toLowerCase());
    if (found) {
      const Icon = found.icon;
      return (
        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-lg border ${found.color}`}>
          <Icon className="w-3.5 h-3.5" />
          <span>{found.name}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-lg border text-cyan-400 bg-cyan-500/15 border-cyan-500/30">
        <Layers className="w-3.5 h-3.5" />
        <span>{catName || 'Titik Pos'}</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Compass className="w-6 h-6 text-cyan-400" />
            Kontrol Wilayah & Titik Tugas
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Penetapan pos teknis (Proyektor, Fotografer, Videografer, Perkabelan), jadwal tanggal & jam, penugasan PIC, dan tindak lanjut laporan lapangan.
          </p>
        </div>

        {activeTab === 'points' && (
          <button
            onClick={() => handleOpenPointModal()}
            className="px-4 py-2.5 rounded-xl gradient-btn text-xs font-bold flex items-center gap-2 shadow-glow text-white hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah Titik Tugas Baru</span>
          </button>
        )}
      </div>

      {/* Critical Alert Banner */}
      {criticalCount > 0 && (
        <div className="p-4 rounded-2xl glass-card border-rose-500/40 bg-rose-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <p className="text-sm font-bold text-white flex items-center gap-2">
                <span>Perhatian: {criticalCount} Laporan Kendala Lapangan Belum Selesai</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-500/20 text-rose-300 font-extrabold">URGENT</span>
              </p>
              <p className="text-xs text-rose-300/90 mt-0.5">
                Ada titik tugas yang dilaporkan [Rusak / Perlu Perhatian] oleh anggota di lapangan dan membutuhkan respon segera dari Admin.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setActiveTab('reports');
              setSelectedStatus('ATTENTION_NEEDED');
            }}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md self-start sm:self-auto flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Tinjau Laporan</span>
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab('points')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'points'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-glow'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Daftar Titik Tugas & Pos ({taskPoints.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'reports'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-glow'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Laporan Lapangan Anggota ({fieldReports.length})</span>
          {criticalCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          )}
        </button>
      </div>

      {/* Tab 1: Task Points Management */}
      {activeTab === 'points' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="glass-card p-4 border border-white/10 grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="relative sm:col-span-2">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Cari titik tugas, kategori, PIC anggota, lokasi..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full glass-input pl-9 text-xs"
              />
            </div>
            <div>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full glass-input text-xs"
              >
                <option value="">Semua Wilayah</option>
                {regions.map((r) => (
                  <option key={r.id} value={r.id} className="bg-slate-900 text-white">
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full glass-input text-xs"
              >
                <option value="">Semua Kategori Pos</option>
                <option value="Proyektor" className="bg-slate-900 text-white">Proyektor</option>
                <option value="Fotografer" className="bg-slate-900 text-white">Fotografer</option>
                <option value="Videografer" className="bg-slate-900 text-white">Videografer</option>
                <option value="Perkabelan" className="bg-slate-900 text-white">Perkabelan</option>
                <option value="Sound System" className="bg-slate-900 text-white">Sound System</option>
                <option value="Dokumentasi" className="bg-slate-900 text-white">Dokumentasi</option>
              </select>
            </div>
          </div>

          {/* Points Grid Cards */}
          {loading ? (
            <div className="py-16 text-center text-slate-400">
              <div className="inline-block w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mb-2" />
              <p className="text-xs">Memuat data titik tugas wilayah...</p>
            </div>
          ) : filteredTaskPoints.length === 0 ? (
            <EmptyState
              title="Belum Ada Titik Tugas"
              message="Belum ada titik tugas yang sesuai dengan kriteria filter saat ini. Klik tombol Tambah Titik Tugas Baru di atas."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTaskPoints.map((tp) => {
                // Find recent reports for this point
                const pointReports = fieldReports.filter((r) => r.taskPointId === tp.id);
                const latestReport = pointReports[0];
                const hasUnresolved = pointReports.some(
                  (r) => !r.isResolved && (r.status === 'ATTENTION_NEEDED' || r.status === 'DAMAGED')
                );

                return (
                  <div
                    key={tp.id}
                    className={`glass-card p-5 border transition-all flex flex-col justify-between shadow-glass group hover:border-cyan-500/40 ${
                      hasUnresolved ? 'border-amber-500/40 bg-amber-950/10' : 'border-white/10'
                    }`}
                  >
                    <div>
                      {/* Top Header Card */}
                      <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/5">
                        {getCategoryBadge(tp.categoryName || tp.category?.name)}
                        <span className="text-[10px] text-slate-400 font-semibold px-2 py-0.5 rounded bg-slate-900 border border-white/5">
                          {tp.region?.name || 'Wilayah'}
                        </span>
                      </div>

                      {/* Task Point Name */}
                      <h3 className="text-base font-extrabold text-white mb-2 leading-tight">
                        {tp.name}
                      </h3>

                      {/* Details Box */}
                      <div className="space-y-2 text-xs text-slate-300">
                        {/* Alamat / Lokasi */}
                        <p className="flex items-start gap-2">
                          <MapPin className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                          <span className="text-slate-300">{tp.address || 'Lokasi belum ditentukan'}</span>
                        </p>

                        {/* Tanggal & Jam Pelaksanaan */}
                        <p className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                          <span className="font-semibold text-amber-300 font-mono text-[11px]">
                            {tp.schedule || 'Jadwal fleksibel'}
                          </span>
                        </p>

                        {/* PIC Penanggung Jawab */}
                        <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                          <User className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                          <span className="text-slate-400">
                            PIC:{' '}
                            {tp.picMember ? (
                              <strong className="text-white font-bold">
                                {tp.picMember.fullName} ({tp.picMember.memberId})
                              </strong>
                            ) : (
                              <span className="text-amber-400 italic">Belum ditentukan</span>
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Deskripsi Tugas / Instruksi Admin */}
                      {tp.notes && (
                        <div className="mt-3 p-2.5 rounded-xl bg-slate-900/70 border border-white/5 text-[11px]">
                          <span className="font-bold text-slate-400 block mb-0.5 text-[10px] uppercase tracking-wider">
                            Instruksi / Deskripsi Tugas:
                          </span>
                          <p className="text-slate-200 leading-relaxed whitespace-pre-line">{tp.notes}</p>
                        </div>
                      )}

                      {/* Status Laporan Terakhir */}
                      {latestReport && (
                        <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">Laporan Terkini:</span>
                          <StatusBadge status={latestReport.status} />
                        </div>
                      )}
                    </div>

                    {/* Card Footer: Reports Count & Action Buttons */}
                    <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                      <span className="text-slate-400 text-[11px] font-medium">
                        {tp._count?.fieldReports || 0} Laporan Masuk
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenPointModal(tp)}
                          className="p-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition-all"
                          title="Ubah Titik Tugas"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeletePoint(tp.id)}
                          className="p-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 transition-all"
                          title="Hapus Titik Tugas"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Field Reports Timeline */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="glass-card p-4 border border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Cari titik tugas, anggota pelapor, keterangan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full glass-input pl-9 text-xs"
              />
            </div>
            <div>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full glass-input text-xs"
              >
                <option value="">Semua Wilayah</option>
                {regions.map((r) => (
                  <option key={r.id} value={r.id} className="bg-slate-900 text-white">
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full glass-input text-xs"
              >
                <option value="">Semua Status Kondisi</option>
                <option value="GOOD" className="bg-slate-900 text-white">🟢 Kondisi Baik / Lancar</option>
                <option value="ATTENTION_NEEDED" className="bg-slate-900 text-white">🟡 Perlu Perhatian</option>
                <option value="DAMAGED" className="bg-slate-900 text-white">🔴 Terkendala / Rusak</option>
              </select>
            </div>
          </div>

          {/* Reports Timeline / Cards */}
          <div className="space-y-3">
            {filteredReports.length === 0 ? (
              <EmptyState
                title="Tidak Ada Laporan Wilayah"
                message="Belum ada laporan kondisi lapangan yang sesuai dengan filter yang dipilih."
              />
            ) : (
              filteredReports.map((report) => (
                <div
                  key={report.id}
                  className={`p-4 rounded-xl glass-card border transition-all ${
                    !report.isResolved && report.status !== 'GOOD'
                      ? 'border-amber-500/40 bg-amber-950/15'
                      : 'border-white/10'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2 pb-2 border-b border-white/5">
                    <div className="flex items-center gap-2.5">
                      <h4 className="font-bold text-white text-sm">{report.taskPoint?.name}</h4>
                      {getCategoryBadge(report.taskPoint?.categoryName || report.taskPoint?.category?.name)}
                      <StatusBadge status={report.status} />
                      {report.isResolved && (
                        <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Selesai Ditangani
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {formatDate(report.createdAt, true)} oleh <strong className="text-white">{report.member?.fullName}</strong>
                    </span>
                  </div>

                  <p className="text-xs text-slate-200 mt-2 leading-relaxed whitespace-pre-line">{report.description}</p>

                  {/* Media attachments */}
                  {report.media?.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-white/5">
                      <span className="text-[10px] text-slate-400 font-semibold block mb-1.5 flex items-center gap-1">
                        <Camera className="w-3 h-3 text-cyan-400" /> Bukti Foto / Dokumentasi Lapangan:
                      </span>
                      <div className="flex items-center gap-2.5 overflow-x-auto py-1">
                        {report.media.map((m) => {
                          const fullUrl = m.fileUrl.startsWith('http') ? m.fileUrl : `http://localhost:5000${m.fileUrl}`;
                          return (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => setPreviewMediaUrl(fullUrl)}
                              className="w-16 h-16 rounded-xl border border-white/15 overflow-hidden flex-shrink-0 bg-slate-900 flex items-center justify-center hover:scale-105 transition-all shadow-md group relative"
                            >
                              {m.fileType === 'VIDEO' ? (
                                <Video className="w-6 h-6 text-indigo-400" />
                              ) : (
                                <img
                                  src={fullUrl}
                                  alt="Bukti Laporan"
                                  className="w-full h-full object-cover"
                                />
                              )}
                              <span className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <Eye className="w-4 h-4 text-white" />
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Admin Response Box */}
                  {report.adminResponse && (
                    <div className="mt-3 p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs">
                      <span className="font-bold text-indigo-300 block mb-0.5 flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5" /> Tanggapan & Solusi Admin:
                      </span>
                      <p className="text-slate-200 leading-relaxed">{report.adminResponse}</p>
                    </div>
                  )}

                  {/* Action button */}
                  <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-end">
                    <button
                      onClick={() => handleOpenRespondModal(report)}
                      className="px-3.5 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{report.adminResponse ? 'Perbarui Tanggapan' : 'Beri Tanggapan & Tindak Lanjut'}</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Point Modal (Create / Edit Titik Tugas) */}
      <Modal
        isOpen={isPointModalOpen}
        onClose={() => setIsPointModalOpen(false)}
        title={editingPoint ? 'Ubah Titik Tugas Wilayah' : 'Penetapan Titik Tugas Baru (Proyektor, Foto, Video, Kabel)'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmitPoint} className="space-y-4 text-xs">
          {/* Header Note */}
          <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-200 text-xs flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <span>Tentukan wilayah titik tugas, pos kategori, tanggal, jam, PIC anggota, dan rincian instruksi tugas.</span>
          </div>

          {/* Nama Titik Tugas */}
          <div>
            <label className="block font-bold text-slate-200 mb-1">
              Nama Titik Tugas <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="misal: Titik Layar Proyektor 1 (Panggung Utama) / Pos Kamera Kanan"
              value={pointFormData.name}
              onChange={(e) => setPointFormData({ ...pointFormData, name: e.target.value })}
              className="w-full glass-input"
            />
          </div>

          {/* Wilayah & Kategori Pos Tugas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-200 mb-1">
                Wilayah Penugasan <span className="text-rose-400">*</span>
              </label>
              <select
                required
                value={pointFormData.regionId}
                onChange={(e) => setPointFormData({ ...pointFormData, regionId: e.target.value })}
                className="w-full glass-input"
              >
                <option value="">Pilih Wilayah</option>
                {regions.map((r) => (
                  <option key={r.id} value={r.id} className="bg-slate-900 text-white">
                    {r.name} ({r.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-200 mb-1">
                Kategori Pos Tugas <span className="text-rose-400">*</span>
              </label>
              <select
                required
                value={pointFormData.categoryName}
                onChange={(e) => {
                  const selectedName = e.target.value;
                  const foundCat = categories.find(c => c.name === selectedName);
                  setPointFormData({
                    ...pointFormData,
                    categoryName: selectedName,
                    categoryId: foundCat ? String(foundCat.id) : pointFormData.categoryId,
                  });
                }}
                className="w-full glass-input font-bold text-cyan-300"
              >
                <option value="Proyektor" className="bg-slate-900 text-white">📽️ Proyektor</option>
                <option value="Fotografer" className="bg-slate-900 text-white">📸 Fotografer</option>
                <option value="Videografer" className="bg-slate-900 text-white">🎥 Videografer</option>
                <option value="Perkabelan" className="bg-slate-900 text-white">🔌 Perkabelan</option>
                <option value="Sound System" className="bg-slate-900 text-white">🔊 Sound System</option>
                <option value="Dokumentasi" className="bg-slate-900 text-white">📋 Dokumentasi Umum</option>
              </select>
            </div>
          </div>

          {/* Tanggal & Jam Pelaksanaan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-200 mb-1">
                Tanggal Pelaksanaan Tugas <span className="text-rose-400">*</span>
              </label>
              <input
                type="date"
                required
                value={pointFormData.taskDate}
                onChange={(e) => setPointFormData({ ...pointFormData, taskDate: e.target.value })}
                className="w-full glass-input"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-200 mb-1">
                Jam Pelaksanaan Tugas <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="misal: 07:30 - Selesai WIB / 08:00 - 15:00 WIB"
                value={pointFormData.taskTime}
                onChange={(e) => setPointFormData({ ...pointFormData, taskTime: e.target.value })}
                className="w-full glass-input"
              />
            </div>
          </div>

          {/* Penanggung Jawab (PIC Anggota) & Alamat Lokasi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-200 mb-1">
                PIC Anggota (Penanggung Jawab) <span className="text-rose-400">*</span>
              </label>
              <select
                required
                value={pointFormData.picMemberId}
                onChange={(e) => setPointFormData({ ...pointFormData, picMemberId: e.target.value })}
                className="w-full glass-input"
              >
                <option value="">Pilih Anggota sebagai PIC</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id} className="bg-slate-900 text-white">
                    {m.fullName} ({m.memberId})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-200 mb-1">
                Alamat / Lokasi Spesifik
              </label>
              <input
                type="text"
                placeholder="misal: Sayap Kanan Panggung Utama / Pintu Masuk 2"
                value={pointFormData.address}
                onChange={(e) => setPointFormData({ ...pointFormData, address: e.target.value })}
                className="w-full glass-input"
              />
            </div>
          </div>

          {/* Deskripsi Tugas / Instruksi Admin */}
          <div>
            <label className="block font-bold text-slate-200 mb-1">
              Deskripsi Tugas & Instruksi Lapangan
            </label>
            <textarea
              rows="3"
              placeholder="Tuliskan arahan SOP: alat yang harus disiapkan, jalur kabel yang perlu diawasi, sudut pandang kamera, nomor kontak darurat..."
              value={pointFormData.notes}
              onChange={(e) => setPointFormData({ ...pointFormData, notes: e.target.value })}
              className="w-full glass-input"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={() => setIsPointModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-semibold transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl gradient-btn font-bold text-white shadow-glow disabled:opacity-50 transition-all"
            >
              {isSubmitting ? 'Menyimpan...' : editingPoint ? 'Simpan Perubahan Titik' : 'Simpan & Tetapkan Titik Tugas'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Admin Respond Modal */}
      <Modal
        isOpen={isRespondModalOpen}
        onClose={() => setIsRespondModalOpen(false)}
        title="Tanggapan & Solusi Laporan Kondisi Wilayah"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmitResponse} className="space-y-4 text-xs">
          {targetReport && (
            <div className="p-3 rounded-xl bg-slate-900/80 border border-white/10 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs">{targetReport.taskPoint?.name}</span>
                <StatusBadge status={targetReport.status} />
              </div>
              <p className="text-slate-300 text-[11px]">Pelapor: {targetReport.member?.fullName}</p>
              <p className="text-slate-400 italic text-[11px]">"{targetReport.description}"</p>
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-200 mb-1">Tanggapan / Solusi Admin:</label>
            <textarea
              rows="3"
              required
              placeholder="Instruksi penanganan teknis, pengiriman tim cadangan, penggantian kabel/proyektor..."
              value={adminResponse}
              onChange={(e) => setAdminResponse(e.target.value)}
              className="w-full glass-input"
            />
          </div>

          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/60 border border-white/10">
            <input
              type="checkbox"
              id="isResolvedCheck"
              checked={isResolved}
              onChange={(e) => setIsResolved(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-500 focus:ring-0 bg-slate-800 border-slate-700 cursor-pointer"
            />
            <label htmlFor="isResolvedCheck" className="text-slate-200 font-semibold cursor-pointer">
              Tandai kendala ini telah selesai ditangani (Resolved)
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={() => setIsRespondModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl gradient-btn font-bold text-white shadow-glow disabled:opacity-50"
            >
              {isSubmitting ? 'Memproses...' : 'Kirim Tanggapan'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Full Preview Media Modal */}
      {previewMediaUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
          <div className="relative max-w-3xl w-full bg-slate-900 border border-white/15 rounded-2xl p-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <span className="font-bold text-white text-xs flex items-center gap-1.5">
                <Image className="w-4 h-4 text-cyan-400" />
                Bukti Foto / Media Laporan Lapangan
              </span>
              <button
                onClick={() => setPreviewMediaUrl(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-center">
              <img
                src={previewMediaUrl}
                alt="Bukti Laporan"
                className="max-h-[75vh] mx-auto rounded-xl object-contain shadow-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRegionControlPage;
