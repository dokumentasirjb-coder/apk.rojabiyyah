import React, { useState, useEffect, useRef } from 'react';
import {
  Compass,
  FileText,
  MapPin,
  Clock,
  Plus,
  Upload,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Video,
  Image,
  Camera,
  MessageSquare,
  Search,
  Filter,
  Layers,
  User,
  Tv,
  Zap,
  Volume2,
  Calendar,
  Sparkles,
  RotateCw,
  X,
  Eye,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { StatusBadge } from '../../components/ui/StatusBadge.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { formatDate } from '../../lib/utils.js';
import { useAuthStore } from '../../store/authStore.js';
import api from '../../api/axios.js';

const TASK_CATEGORIES = [
  { name: 'Proyektor', icon: Tv, color: 'text-cyan-400 bg-cyan-500/15 border-cyan-500/30' },
  { name: 'Fotografer', icon: Camera, color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30' },
  { name: 'Videografer', icon: Video, color: 'text-purple-400 bg-purple-500/15 border-purple-500/30' },
  { name: 'Perkabelan', icon: Zap, color: 'text-amber-400 bg-amber-500/15 border-amber-500/30' },
  { name: 'Sound System', icon: Volume2, color: 'text-rose-400 bg-rose-500/15 border-rose-500/30' },
  { name: 'Dokumentasi', icon: FileText, color: 'text-blue-400 bg-blue-500/15 border-blue-500/30' },
];

export const MemberRegionControlPage = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('my_tasks'); // 'my_tasks' | 'all_points' | 'my_reports'
  
  const [allTaskPoints, setAllTaskPoints] = useState([]);
  const [regions, setRegions] = useState([]);
  const [myReports, setMyReports] = useState([]);
  const [currentMember, setCurrentMember] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Report Modal State
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedTaskPoint, setSelectedTaskPoint] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    taskPointId: '',
    status: 'GOOD',
    description: '',
  });

  // Media files & previews
  const [photoFiles, setPhotoFiles] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // Preview full media modal
  const [previewMediaUrl, setPreviewMediaUrl] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dashRes, pointsRes, reportsRes, regionsRes] = await Promise.all([
        api.get('/dashboard/member'),
        api.get('/task-points?limit=150'),
        api.get('/field-reports?limit=150'),
        api.get('/regions'),
      ]);

      const mem = dashRes.data.data.member || user?.member;
      setCurrentMember(mem);
      setAllTaskPoints(pointsRes.data.data || []);
      setRegions(regionsRes.data.data || []);

      // Filter reports submitted by current member
      const memberId = mem?.id;
      const myFiltered = (reportsRes.data.data || []).filter((r) => r.memberId === memberId);
      setMyReports(myFiltered);
    } catch (err) {
      console.error('Gagal mengambil data kontrol wilayah:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter task points where current logged-in member is PIC
  const myAssignedPoints = allTaskPoints.filter((tp) => {
    if (!currentMember?.id) return false;
    return tp.picMemberId === currentMember.id;
  });

  // Filtered all task points
  const filteredAllPoints = allTaskPoints.filter((tp) => {
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

  // Handle 1-Click Open Report Modal for a specific Task Point
  const handleOpenReportModal = (point = null) => {
    const targetPoint = point || (myAssignedPoints.length > 0 ? myAssignedPoints[0] : allTaskPoints[0]);
    setSelectedTaskPoint(targetPoint);
    setFormData({
      taskPointId: targetPoint?.id ? String(targetPoint.id) : '',
      status: 'GOOD',
      description: '',
    });
    setPhotoFiles([]);
    setPhotoPreviews([]);
    setReportSuccess(false);
    setIsReportModalOpen(true);
  };

  // Handle file additions
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newFiles = [...photoFiles, ...files].slice(0, 5); // limit max 5
    setPhotoFiles(newFiles);

    // Generate previews
    const newPreviews = [];
    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push({ name: file.name, url: reader.result, type: file.type });
        if (newPreviews.length === newFiles.length) {
          setPhotoPreviews([...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePhoto = (index) => {
    const updatedFiles = photoFiles.filter((_, i) => i !== index);
    const updatedPreviews = photoPreviews.filter((_, i) => i !== index);
    setPhotoFiles(updatedFiles);
    setPhotoPreviews(updatedPreviews);
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!formData.taskPointId) {
      alert('Mohon pilih titik tugas yang dilaporkan');
      return;
    }

    try {
      setIsSubmitting(true);
      const submitData = new FormData();
      submitData.append('taskPointId', formData.taskPointId);
      submitData.append('status', formData.status);
      submitData.append('description', formData.description);

      for (const file of photoFiles) {
        submitData.append('media', file);
      }

      await api.post('/field-reports', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setReportSuccess(true);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mengirim laporan lapangan');
    } finally {
      setIsSubmitting(false);
    }
  };

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
            Akses seluruh titik tugas (Proyektor, Fotografer, Videografer, Perkabelan) dan laporkan kondisi terkini sesuai amanah PIC Anda dengan 1-klik & bukti foto.
          </p>
        </div>

        <button
          onClick={() => handleOpenReportModal()}
          className="px-4 py-2.5 rounded-xl gradient-btn text-xs font-bold flex items-center gap-2 shadow-glow text-white hover:scale-[1.02] active:scale-[0.98] transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Kirim Laporan Lapangan</span>
        </button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto">
        {/* Tab 1: Penugasan Saya (Sebagai PIC) */}
        <button
          onClick={() => setActiveTab('my_tasks')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 flex-shrink-0 ${
            activeTab === 'my_tasks'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-glow'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Penugasan Saya Sebagai PIC ({myAssignedPoints.length})</span>
          {myAssignedPoints.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-400" />
          )}
        </button>

        {/* Tab 2: Semua Titik Tugas Wilayah */}
        <button
          onClick={() => setActiveTab('all_points')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 flex-shrink-0 ${
            activeTab === 'all_points'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-glow'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Semua Titik Tugas Wilayah ({allTaskPoints.length})</span>
        </button>

        {/* Tab 3: Riwayat Laporan Saya */}
        <button
          onClick={() => setActiveTab('my_reports')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 flex-shrink-0 ${
            activeTab === 'my_reports'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-glow'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Riwayat Laporan Saya ({myReports.length})</span>
        </button>
      </div>

      {/* TAB 1: PENUGASAN SAYA SEBAGAI PIC (TINGGAL 1-KLIK LAPOR KEADAAN) */}
      {activeTab === 'my_tasks' && (
        <div className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/30 flex items-start sm:items-center justify-between gap-3 text-xs text-amber-200">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <span>
                Berikut adalah pos kontrol di mana Anda ditugaskan sebagai <strong>PIC (Penanggung Jawab)</strong> oleh Admin. Klik tombol <strong>Lapor Keadaan Titik Ini</strong> untuk mengirimkan kondisi alat dan jepret foto bukti di lokasi.
              </span>
            </div>
            <span className="font-mono font-bold text-amber-300 text-xs px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/30 flex-shrink-0">
              PIC: {currentMember?.fullName || user?.username}
            </span>
          </div>

          {loading ? (
            <div className="py-16 text-center text-slate-400">
              <div className="inline-block w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-2" />
              <p className="text-xs">Memuat pos penugasan Anda...</p>
            </div>
          ) : myAssignedPoints.length === 0 ? (
            <div className="p-8 rounded-2xl glass-card border border-white/10 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                <Compass className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white">Belum Ada Titik Penugasan Khusus</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Saat ini Anda belum ditetapkan sebagai PIC pada titik tugas tertentu. Anda tetap dapat memantau seluruh pos pada tab <strong>Semua Titik Tugas Wilayah</strong>.
              </p>
              <button
                onClick={() => setActiveTab('all_points')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
              >
                Lihat Semua Titik Tugas Wilayah
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myAssignedPoints.map((tp) => (
                <div
                  key={tp.id}
                  className="glass-card p-5 border-2 border-amber-500/40 bg-slate-900/90 hover:border-amber-400 transition-all flex flex-col justify-between shadow-glow relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 text-[9px] font-black uppercase px-3 py-0.5 rounded-bl-lg tracking-wider">
                    AMANAH TUGAS ANDA
                  </div>

                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-2.5 pt-1">
                      {getCategoryBadge(tp.categoryName || tp.category?.name)}
                      <span className="text-[10px] text-slate-400 font-semibold px-2 py-0.5 rounded bg-slate-950 border border-white/10">
                        {tp.region?.name || 'Wilayah'}
                      </span>
                    </div>

                    {/* Task Point Name */}
                    <h3 className="text-base font-extrabold text-white mb-2 leading-tight">
                      {tp.name}
                    </h3>

                    {/* Details */}
                    <div className="space-y-2 text-xs text-slate-300">
                      <p className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-200 font-medium">{tp.address || 'Lokasi belum ditentukan'}</span>
                      </p>

                      <p className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                        <span className="font-mono text-amber-300 font-bold text-[11px]">
                          {tp.schedule || 'Jadwal Acara'}
                        </span>
                      </p>
                    </div>

                    {/* Deskripsi Instruksi Admin */}
                    {tp.notes && (
                      <div className="mt-3 p-3 rounded-xl bg-slate-950/80 border border-white/10 text-[11px]">
                        <span className="font-bold text-amber-300 block mb-0.5 text-[10px] uppercase tracking-wider">
                          Instruksi Tugas dari Admin:
                        </span>
                        <p className="text-slate-200 leading-relaxed whitespace-pre-line">{tp.notes}</p>
                      </div>
                    )}
                  </div>

                  {/* 1-KLIK TOMBOL LAPOR KEADAAN TITIK INI */}
                  <div className="mt-5 pt-3 border-t border-white/10">
                    <button
                      onClick={() => handleOpenReportModal(tp)}
                      className="w-full py-2.5 px-4 rounded-xl gradient-btn text-xs font-bold text-white flex items-center justify-center gap-2 shadow-glow hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      <Camera className="w-4 h-4 text-cyan-200" />
                      <span>Lapor Keadaan Pos Ini (1-Klik)</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SEMUA TITIK TUGAS WILAYAH (BISA DIAKSES OLEH ANGGOTA LENGKAP) */}
      {activeTab === 'all_points' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="glass-card p-4 border border-white/10 grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="relative sm:col-span-2">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Cari titik tugas, pos kategori, PIC anggota, lokasi..."
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

          {/* Cards Grid */}
          {loading ? (
            <div className="py-16 text-center text-slate-400">
              <div className="inline-block w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mb-2" />
              <p className="text-xs">Memuat seluruh data titik tugas wilayah...</p>
            </div>
          ) : filteredAllPoints.length === 0 ? (
            <EmptyState
              title="Tidak Ada Titik Tugas"
              message="Tidak ada titik tugas yang sesuai dengan filter yang dipilih."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAllPoints.map((tp) => {
                const isMyTask = currentMember?.id && tp.picMemberId === currentMember.id;
                return (
                  <div
                    key={tp.id}
                    className={`glass-card p-5 border transition-all flex flex-col justify-between shadow-glass group hover:border-cyan-500/40 ${
                      isMyTask ? 'border-amber-500/40 bg-amber-950/10' : 'border-white/10'
                    }`}
                  >
                    <div>
                      {/* Top Header */}
                      <div className="flex items-center justify-between mb-2.5">
                        {getCategoryBadge(tp.categoryName || tp.category?.name)}
                        <span className="text-[10px] text-slate-400 font-semibold px-2 py-0.5 rounded bg-slate-900 border border-white/5">
                          {tp.region?.name || 'Wilayah'}
                        </span>
                      </div>

                      {/* Name */}
                      <h3 className="text-base font-extrabold text-white mb-2 leading-tight flex items-center justify-between gap-2">
                        <span>{tp.name}</span>
                        {isMyTask && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex-shrink-0">
                            Tugas Anda
                          </span>
                        )}
                      </h3>

                      {/* Details */}
                      <div className="space-y-2 text-xs text-slate-300">
                        <p className="flex items-start gap-2">
                          <MapPin className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                          <span>{tp.address || 'Lokasi belum ditentukan'}</span>
                        </p>

                        <p className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                          <span className="font-mono text-amber-300 font-semibold text-[11px]">
                            {tp.schedule || 'Jadwal fleksibel'}
                          </span>
                        </p>

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

                      {/* Deskripsi Instruksi */}
                      {tp.notes && (
                        <div className="mt-3 p-2.5 rounded-xl bg-slate-900/70 border border-white/5 text-[11px]">
                          <span className="font-bold text-slate-400 block mb-0.5 text-[10px] uppercase tracking-wider">
                            Instruksi / Deskripsi Tugas:
                          </span>
                          <p className="text-slate-200 leading-relaxed whitespace-pre-line">{tp.notes}</p>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-400">
                        {tp._count?.fieldReports || 0} Laporan
                      </span>
                      <button
                        onClick={() => handleOpenReportModal(tp)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                          isMyTask
                            ? 'gradient-btn text-white'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10'
                        }`}
                      >
                        <Camera className="w-3.5 h-3.5 text-cyan-300" />
                        <span>{isMyTask ? 'Lapor Keadaan (PIC)' : 'Kirim Laporan Pos Ini'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: RIWAYAT LAPORAN SAYA */}
      {activeTab === 'my_reports' && (
        <div className="space-y-4">
          <div className="glass-card p-5 border border-white/10 shadow-glass">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>Daftar Riwayat Laporan Kondisi yang Pernah Saya Kirim ({myReports.length})</span>
            </h3>

            {myReports.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">Anda belum pernah mengirim laporan kondisi lapangan.</p>
            ) : (
              <div className="space-y-3">
                {myReports.map((report) => (
                  <div
                    key={report.id}
                    className="p-4 rounded-xl bg-slate-900/60 border border-white/5 hover:border-white/10 transition-all space-y-2 text-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{report.taskPoint?.name}</span>
                        {getCategoryBadge(report.taskPoint?.categoryName || report.taskPoint?.category?.name)}
                        <StatusBadge status={report.status} />
                        {report.isResolved && (
                          <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Selesai Ditangani
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500">{formatDate(report.createdAt, true)}</span>
                    </div>

                    <p className="text-slate-200 leading-relaxed whitespace-pre-line">{report.description}</p>

                    {/* Media Attachments */}
                    {report.media?.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-white/5">
                        <span className="text-[10px] text-slate-400 font-semibold block mb-1 flex items-center gap-1">
                          <Camera className="w-3 h-3 text-cyan-400" /> Foto Bukti Lapangan:
                        </span>
                        <div className="flex items-center gap-2 overflow-x-auto py-1">
                          {report.media.map((m) => {
                            const fullUrl = m.fileUrl.startsWith('http') ? m.fileUrl : `http://localhost:5000${m.fileUrl}`;
                            return (
                              <button
                                key={m.id}
                                type="button"
                                onClick={() => setPreviewMediaUrl(fullUrl)}
                                className="w-14 h-14 rounded-xl border border-white/15 overflow-hidden flex-shrink-0 bg-slate-950 flex items-center justify-center hover:scale-105 transition-all shadow-md group relative"
                              >
                                {m.fileType === 'VIDEO' ? (
                                  <Video className="w-5 h-5 text-indigo-400" />
                                ) : (
                                  <img
                                    src={fullUrl}
                                    alt="Media Laporan"
                                    className="w-full h-full object-cover"
                                  />
                                )}
                                <span className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                  <Eye className="w-3.5 h-3.5 text-white" />
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Admin Response Box */}
                    {report.adminResponse && (
                      <div className="mt-2 p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs">
                        <span className="font-bold text-indigo-300 block mb-0.5 flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5" /> Tanggapan & Solusi Administrator:
                        </span>
                        <p className="text-slate-200 leading-relaxed">{report.adminResponse}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL LAPOR KONDISI LAPANGAN (DILENGKAPI PILIHAN TITIK, STATUS, UPLOAD FOTO/KAMERA LANGSUNG) */}
      <Modal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        title="Formulir Laporan Keadaan Pos Lapangan"
        maxWidth="max-w-xl"
      >
        {reportSuccess ? (
          <div className="space-y-4 py-4 text-center text-xs">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-glow">
              <CheckCircle className="w-7 h-7" />
            </div>
            <h3 className="text-base font-extrabold text-white">Laporan Keadaan Berhasil Dikirim!</h3>
            <p className="text-slate-300 max-w-md mx-auto leading-relaxed">
              Laporan kondisi lapangan dan bukti foto Anda telah berhasil disimpan di sistem. Admin telah menerima pemberitahuan untuk tindak lanjut penanganan teknis.
            </p>
            <div className="pt-2">
              <button
                onClick={() => {
                  setIsReportModalOpen(false);
                  setActiveTab('my_reports');
                }}
                className="px-6 py-2.5 rounded-xl gradient-btn font-bold text-white text-xs shadow-glow"
              >
                Lihat Riwayat Laporan Saya
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmitReport} className="space-y-4 text-xs">
            {/* Titik Tugas Info */}
            <div>
              <label className="block font-bold text-slate-200 mb-1">
                Titik Tugas yang Dilaporkan <span className="text-rose-400">*</span>
              </label>
              <select
                required
                value={formData.taskPointId}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData({ ...formData, taskPointId: val });
                  setSelectedTaskPoint(allTaskPoints.find((t) => String(t.id) === String(val)));
                }}
                className="w-full glass-input font-bold text-white"
              >
                <option value="">-- Pilih Titik Tugas --</option>
                {allTaskPoints.map((tp) => (
                  <option key={tp.id} value={tp.id} className="bg-slate-900 text-white">
                    [{tp.categoryName || 'Pos'}] {tp.name} • {tp.region?.name || ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Selected Point Summary Box */}
            {selectedTaskPoint && (
              <div className="p-3 rounded-xl bg-slate-900/90 border border-white/10 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">{selectedTaskPoint.name}</span>
                  {getCategoryBadge(selectedTaskPoint.categoryName)}
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-300 pt-0.5">
                  <span className="flex items-center gap-1 font-mono text-amber-300">
                    <Clock className="w-3 h-3 text-amber-400" />
                    {selectedTaskPoint.schedule || 'Jadwal Acara'}
                  </span>
                  <span>•</span>
                  <span>PIC: {selectedTaskPoint.picMember?.fullName || 'Belum ada PIC'}</span>
                </div>
                {selectedTaskPoint.notes && (
                  <p className="text-[10px] text-slate-400 pt-1 border-t border-white/5 italic">
                    Instruksi: {selectedTaskPoint.notes}
                  </p>
                )}
              </div>
            )}

            {/* Status Kondisi Keadaan */}
            <div>
              <label className="block font-bold text-slate-200 mb-1">
                Status Kondisi Alat & Situasi Pos <span className="text-rose-400">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  {
                    key: 'GOOD',
                    label: 'Baik / Lancar',
                    desc: 'Semua alat normal & siap',
                    icon: CheckCircle,
                    color: 'text-emerald-400 border-emerald-500/50 bg-emerald-500/15',
                  },
                  {
                    key: 'ATTENTION_NEEDED',
                    label: 'Perlu Perhatian',
                    desc: 'Ada kendala kecil',
                    icon: AlertTriangle,
                    color: 'text-amber-400 border-amber-500/50 bg-amber-500/15',
                  },
                  {
                    key: 'DAMAGED',
                    label: 'Terkendala / Rusak',
                    desc: 'Alat mati / kabel putus',
                    icon: XCircle,
                    color: 'text-rose-400 border-rose-500/50 bg-rose-500/15',
                  },
                ].map((s) => {
                  const Icon = s.icon;
                  const isSelected = formData.status === s.key;
                  return (
                    <button
                      type="button"
                      key={s.key}
                      onClick={() => setFormData({ ...formData, status: s.key })}
                      className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center gap-1 transition-all ${
                        isSelected
                          ? `${s.color} shadow-glow font-bold`
                          : 'border-white/10 text-slate-400 hover:text-white bg-slate-900/60'
                      }`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span className="text-xs">{s.label}</span>
                      <span className="text-[9px] opacity-80 hidden sm:block">{s.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Rincian Deskripsi Keadaan */}
            <div>
              <label className="block font-bold text-slate-200 mb-1">
                Laporan Keadaan Lapangan <span className="text-rose-400">*</span>
              </label>
              <textarea
                rows="3"
                required
                placeholder="Jelaskan kondisi proyektor, kelengkapan kabel, posisi kamera, penerangan lampu, atau kendala lapangan yang terjadi..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full glass-input"
              />
            </div>

            {/* Upload Foto / Jepret Kamera Langsung */}
            <div>
              <label className="block font-bold text-slate-200 mb-1">
                Bukti Foto Keadaan di Lokasi (Maks. 5 Foto)
              </label>

              {/* Upload Action Buttons */}
              <div className="flex items-center gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="px-3.5 py-2 rounded-xl bg-cyan-600/20 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-600/30 font-bold flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <Camera className="w-4 h-4" />
                  <span>Jepret Kamera HP Langsung</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 border border-white/15 text-slate-200 hover:text-white hover:border-white/30 font-bold flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <Upload className="w-4 h-4 text-indigo-400" />
                  <span>Pilih dari Galeri</span>
                </button>
              </div>

              {/* Hidden Inputs */}
              <input
                type="file"
                ref={cameraInputRef}
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />
              <input
                type="file"
                ref={fileInputRef}
                multiple
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Previews Grid */}
              {photoPreviews.length > 0 && (
                <div className="flex flex-wrap items-center gap-2.5 p-2 rounded-xl bg-slate-950/60 border border-white/10 mt-2">
                  {photoPreviews.map((p, idx) => (
                    <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-white/20 group">
                      <img src={p.url} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(idx)}
                        className="absolute top-0.5 right-0.5 p-1 rounded-full bg-rose-600 text-white hover:bg-rose-500 shadow-md"
                        title="Hapus Foto"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <span className="text-[11px] text-cyan-400 font-semibold px-2">
                    {photoPreviews.length} foto siap dikirim
                  </span>
                </div>
              )}
            </div>

            {/* Submit Action */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsReportModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-semibold"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl gradient-btn font-bold text-white shadow-glow disabled:opacity-50 flex items-center gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Mengirim Laporan...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Kirim Laporan Keadaan</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Full Preview Media Modal */}
      {previewMediaUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
          <div className="relative max-w-3xl w-full bg-slate-900 border border-white/15 rounded-2xl p-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <span className="font-bold text-white text-xs flex items-center gap-1.5">
                <Image className="w-4 h-4 text-cyan-400" />
                Foto Bukti Lapangan
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

export default MemberRegionControlPage;
