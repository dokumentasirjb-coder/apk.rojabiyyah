import React, { useState, useEffect, useMemo } from 'react';
import {
  Compass,
  Tv,
  Camera,
  Video,
  Zap,
  Plus,
  Trash2,
  Save,
  Search,
  Filter,
  Printer,
  RotateCcw,
  Users,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowUpDown,
  ChevronDown,
  Edit3,
  X,
  FileText,
  UserCheck,
} from 'lucide-react';
import api from '../../api/axios.js';
import { toast } from '../../store/toastStore.js';
import { useThemeStore } from '../../store/themeStore.js';
import { Modal } from '../../components/ui/Modal.jsx';

export const AdminDutyAssignmentsPage = () => {
  const { branding } = useThemeStore();
  const [activeTab, setActiveTab] = useState('projector'); // 'projector' | 'media'

  // Data states
  const [projectorList, setProjectorList] = useState([]);
  const [mediaList, setMediaList] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('ALL');
  const [selectedDay, setSelectedDay] = useState('ALL');

  // Modal Add / Edit
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editingType, setEditingType] = useState('projector'); // 'projector' | 'media'

  // Fetch initial data & members
  const fetchDutyData = async () => {
    try {
      setLoading(true);
      const [dutyRes, membersRes] = await Promise.all([
        api.get('/settings/duty-assignments'),
        api.get('/members').catch(() => ({ data: { data: [] } })),
      ]);

      const dutyData = dutyRes.data?.data || {};
      const projs = (dutyData.projectorAssignments || []).map((p) => ({
        ...p,
        titik: p.titik || p.kode || '',
        kode: p.kode || p.titik || '',
        group: p.group || p.titikGroup || 'Titik A',
        titikGroup: p.titikGroup || p.group || 'Titik A',
        korwil: p.korwil || '',
        operator: p.operator || '',
        lcdNdalem: p.lcdNdalem || '',
        proyektorNo: p.proyektorNo || p.kode || '',
      }));

      const meds = (dutyData.mediaAssignments || []).map((m) => ({
        ...m,
        area: m.area || m.wilayah || '',
        wilayah: m.wilayah || m.area || '',
        tanggal: m.tanggal || '',
        jam: m.jam || '',
        videografer: m.videografer || m.shootingTengah || '',
      }));

      setProjectorList(projs);
      setMediaList(meds);
      setMembers(membersRes.data?.data || []);
      setHasChanges(false);
    } catch (err) {
      toast.error('Gagal memuat data penugasan wilayah: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDutyData();
  }, []);

  // Save changes to backend
  const handleSaveAll = async () => {
    try {
      setIsSaving(true);
      await api.put('/settings/duty-assignments', {
        projectorAssignments: projectorList,
        mediaAssignments: mediaList,
      });
      setHasChanges(false);
      toast.success('Matriks penugasan wilayah & liputan berhasil disimpan ke sistem!');
    } catch (err) {
      toast.error('Gagal menyimpan penugasan: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSaving(false);
    }
  };

  // Group options for Projector tab
  const groupOptions = useMemo(() => {
    const set = new Set();
    projectorList.forEach((p) => {
      const g = p.group || p.titikGroup;
      if (g) set.add(g);
    });
    return Array.from(set);
  }, [projectorList]);

  // Day options for Media tab
  const dayOptions = useMemo(() => {
    const set = new Set();
    mediaList.forEach((m) => {
      if (m.hari) set.add(m.hari);
    });
    return Array.from(set);
  }, [mediaList]);

  // Filtered projector items
  const filteredProjectorList = useMemo(() => {
    return projectorList.filter((item) => {
      const q = search.toLowerCase();
      const matchSearch =
        search === '' ||
        (item.titik || '').toLowerCase().includes(q) ||
        (item.kode || '').toLowerCase().includes(q) ||
        (item.wilayah || '').toLowerCase().includes(q) ||
        (item.korwil || '').toLowerCase().includes(q) ||
        (item.operator || '').toLowerCase().includes(q) ||
        (item.lcdNdalem || '').toLowerCase().includes(q) ||
        (item.proyektorNo || '').toLowerCase().includes(q) ||
        (item.petugasProyektor || '').toLowerCase().includes(q) ||
        (item.petugasKabel || '').toLowerCase().includes(q) ||
        (item.notes || '').toLowerCase().includes(q);

      const itemGrp = item.group || item.titikGroup;
      const matchGroup = selectedGroup === 'ALL' || itemGrp === selectedGroup;
      return matchSearch && matchGroup;
    });
  }, [projectorList, search, selectedGroup]);

  // Filtered media items
  const filteredMediaList = useMemo(() => {
    return mediaList.filter((item) => {
      const q = search.toLowerCase();
      const matchSearch =
        search === '' ||
        (item.momen || '').toLowerCase().includes(q) ||
        (item.wilayah || '').toLowerCase().includes(q) ||
        (item.area || '').toLowerCase().includes(q) ||
        (item.tanggal || '').toLowerCase().includes(q) ||
        (item.jam || '').toLowerCase().includes(q) ||
        (item.fotografer || '').toLowerCase().includes(q) ||
        (item.videografer || '').toLowerCase().includes(q) ||
        (item.shortVideo || '').toLowerCase().includes(q) ||
        (item.notes || '').toLowerCase().includes(q);

      const matchDay = selectedDay === 'ALL' || item.hari === selectedDay;
      return matchSearch && matchDay;
    });
  }, [mediaList, search, selectedDay]);

  // Delete Handlers
  const handleDeleteProjectorItem = async (id) => {
    const ok = await toast.confirm('Apakah Anda yakin ingin menghapus baris titik penugasan ini?');
    if (!ok) return;
    setProjectorList((prev) => prev.filter((p) => p.id !== id));
    setHasChanges(true);
    toast.success('Baris titik penugasan dihapus dari daftar lokal');
  };

  const handleDeleteMediaItem = async (id) => {
    const ok = await toast.confirm('Apakah Anda yakin ingin menghapus baris jadwal liputan ini?');
    if (!ok) return;
    setMediaList((prev) => prev.filter((m) => m.id !== id));
    setHasChanges(true);
    toast.success('Baris jadwal liputan dihapus dari daftar lokal');
  };

  // Open Edit Modal
  const handleOpenEdit = (item, type) => {
    setEditingType(type);
    if (type === 'projector') {
      setEditingItem({
        ...item,
        titikGroup: item.titikGroup || item.group || 'Titik A',
        group: item.group || item.titikGroup || 'Titik A',
        kode: item.kode || item.titik || '',
        titik: item.titik || item.kode || '',
        wilayah: item.wilayah || '',
        korwil: item.korwil || '',
        operator: item.operator || '',
        lcdNdalem: item.lcdNdalem || '',
        proyektorNo: item.proyektorNo || item.kode || '',
        petugasProyektor: item.petugasProyektor || '',
        petugasKabel: item.petugasKabel || '',
        notes: item.notes || '',
      });
    } else {
      setEditingItem({
        ...item,
        hari: item.hari || 'Kamis',
        tanggal: item.tanggal || '',
        jam: item.jam || '',
        waktu: item.waktu || 'Malam',
        momen: item.momen || '',
        wilayah: item.wilayah || item.area || '',
        area: item.area || item.wilayah || '',
        fotografer: item.fotografer || '',
        videografer: item.videografer || item.shootingTengah || '',
        shortVideo: item.shortVideo || '',
        notes: item.notes || '',
      });
    }
    setIsEditModalOpen(true);
  };

  // Open Add Modal
  const handleOpenAdd = (type) => {
    setEditingType(type);
    if (type === 'projector') {
      setEditingItem({
        id: `p-${Date.now()}`,
        titikGroup: selectedGroup !== 'ALL' ? selectedGroup : 'Titik A',
        group: selectedGroup !== 'ALL' ? selectedGroup : 'Titik A',
        kode: `Proyektor ${projectorList.length + 1}`,
        titik: `Proyektor ${projectorList.length + 1}`,
        wilayah: '',
        korwil: '',
        operator: '',
        lcdNdalem: '',
        proyektorNo: `Proyektor ${projectorList.length + 1}`,
        petugasProyektor: '',
        petugasKabel: '',
        notes: '',
      });
    } else {
      setEditingItem({
        id: `m-${Date.now()}`,
        hari: selectedDay !== 'ALL' ? selectedDay : 'Kamis',
        tanggal: '',
        jam: '',
        waktu: 'Malam',
        momen: '',
        wilayah: '',
        area: '',
        fotografer: '',
        videografer: '',
        shortVideo: '',
        notes: '',
      });
    }
    setIsEditModalOpen(true);
  };

  // Save Modal
  const handleSaveModal = (e) => {
    e.preventDefault();
    if (editingType === 'projector') {
      const normalizedProj = {
        ...editingItem,
        titik: editingItem.titik || editingItem.kode || '',
        kode: editingItem.kode || editingItem.titik || '',
        group: editingItem.group || editingItem.titikGroup || 'Titik A',
        titikGroup: editingItem.titikGroup || editingItem.group || 'Titik A',
        proyektorNo: editingItem.proyektorNo || editingItem.kode || '',
        korwil: editingItem.korwil || '',
        operator: editingItem.operator || '',
        lcdNdalem: editingItem.lcdNdalem || '',
        wilayah: editingItem.wilayah || '',
        petugasProyektor: editingItem.petugasProyektor || '',
        petugasKabel: editingItem.petugasKabel || '',
        notes: editingItem.notes || '',
      };

      setProjectorList((prev) => {
        const index = prev.findIndex((p) => p.id === normalizedProj.id);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = normalizedProj;
          return updated;
        } else {
          return [...prev, normalizedProj];
        }
      });
    } else {
      const normalizedMed = {
        ...editingItem,
        wilayah: editingItem.wilayah || editingItem.area || '',
        area: editingItem.area || editingItem.wilayah || '',
        tanggal: editingItem.tanggal || '',
        jam: editingItem.jam || '',
        shootingTengah: editingItem.videografer || '',
      };

      setMediaList((prev) => {
        const index = prev.findIndex((m) => m.id === normalizedMed.id);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = normalizedMed;
          return updated;
        } else {
          return [...prev, normalizedMed];
        }
      });
    }

    setHasChanges(true);
    setIsEditModalOpen(false);
    toast.success('Data baris penugasan berhasil diperbarui! Jangan lupa klik tombol Simpan.');
  };

  // Fast Member Selector Helper
  const handleSelectMember = (fieldName, memberName) => {
    if (!editingItem) return;
    const currentVal = editingItem[fieldName] || '';
    if (!currentVal) {
      setEditingItem({ ...editingItem, [fieldName]: memberName });
    } else if (!currentVal.includes(memberName)) {
      setEditingItem({ ...editingItem, [fieldName]: `${currentVal}, ${memberName}` });
    }
  };

  return (
    <div className="space-y-6 select-none print:m-0 print:p-0">
      {/* Top Banner (Hidden in Print) */}
      <div className="glass-card p-6 border border-white/10 bg-gradient-to-r from-indigo-950/70 via-slate-900/80 to-cyan-950/60 rounded-2xl shadow-glass flex flex-col lg:flex-row lg:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
              <Compass className="w-3.5 h-3.5" />
              Manajemen Matriks Penugasan Lapangan
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Hak Akses: Super Admin
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Pembagian Wilayah & Penugasan Panitia
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Atur pembagian titik wilayah tugas untuk divisi Proyektor, Kabel, Layar LCD, Korwil, Operator, Fotografer, Videografer, dan Liputan Momen Haul & Rojabiyyah.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-900 border border-white/15 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
            title="Cetak format lembar penugasan A4 resmi"
          >
            <Printer className="w-4 h-4 text-cyan-400" />
            <span>Cetak Jadwal A4</span>
          </button>

          <button
            onClick={fetchDutyData}
            disabled={loading || isSaving}
            className="px-3.5 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-900 border border-white/15 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-60"
            title="Muat ulang dari server"
          >
            <RotateCcw className={`w-4 h-4 text-amber-400 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleSaveAll}
            disabled={isSaving || loading}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-2 shadow-glow transition-all active:scale-95 disabled:opacity-60 ${
              hasChanges ? 'bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600 animate-pulse' : 'gradient-btn'
            }`}
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Menyimpan...' : hasChanges ? 'Simpan Perubahan Penugasan *' : 'Simpan Penugasan'}</span>
          </button>
        </div>
      </div>

      {/* Main Tabs Navigation (Hidden in Print) */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-2 print:hidden">
        <div className="flex items-center gap-2 bg-slate-900/90 p-1 rounded-2xl border border-white/10">
          <button
            onClick={() => setActiveTab('projector')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'projector'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-glow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Tv className="w-4 h-4 text-cyan-300" />
            <span>Divisi Proyektor, Kabel & Layar LCD</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-950/60 font-mono">
              {projectorList.length} Titik
            </span>
          </button>

          <button
            onClick={() => setActiveTab('media')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'media'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-glow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Camera className="w-4 h-4 text-purple-300" />
            <span>Divisi Dokumentasi & Liputan Momen</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-950/60 font-mono">
              {mediaList.length} Momen
            </span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex items-center gap-2 flex-1 max-w-md ml-auto">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={activeTab === 'projector' ? 'Cari titik, korwil, operator, petugas...' : 'Cari momen, tgl, fotografer, videografer...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full glass-input pl-9 text-xs"
            />
          </div>

          {activeTab === 'projector' ? (
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="glass-input text-xs bg-slate-900 text-slate-200"
            >
              <option value="ALL">Semua Titik</option>
              {groupOptions.map((g) => (
                <option key={g} value={g} className="bg-slate-900 text-white">
                  {g}
                </option>
              ))}
            </select>
          ) : (
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="glass-input text-xs bg-slate-900 text-slate-200"
            >
              <option value="ALL">Semua Hari</option>
              {dayOptions.map((d) => (
                <option key={d} value={d} className="bg-slate-900 text-white">
                  Hari {d}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => handleOpenAdd(activeTab)}
            className="px-3.5 py-2 rounded-xl gradient-btn text-xs font-bold text-white flex items-center gap-1.5 shadow-glow flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: PROYEKTOR, KABEL & LAYAR LCD MATRIX TABLE                          */}
      {/* ========================================================================= */}
      {activeTab === 'projector' && (
        <div className="glass-card border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900/90 border-b border-white/15 text-slate-300 font-bold uppercase tracking-wider text-[11px] print:bg-slate-100 print:text-slate-900 print:border-slate-400">
                  <th className="py-3 px-2 w-10 text-center">No</th>
                  <th className="py-3 px-3 min-w-[110px]">Titik / Kode</th>
                  <th className="py-3 px-3 min-w-[140px]">Wilayah</th>
                  <th className="py-3 px-3 min-w-[120px] text-indigo-300">Korwil</th>
                  <th className="py-3 px-3 min-w-[120px] text-cyan-300">Operator</th>
                  <th className="py-3 px-3 min-w-[110px]">LCD Ndalem</th>
                  <th className="py-3 px-3 min-w-[100px]">No. Proyektor</th>
                  <th className="py-3 px-3 min-w-[130px] text-emerald-300">Petugas Proyektor</th>
                  <th className="py-3 px-3 min-w-[130px] text-amber-300">Petugas Kabel</th>
                  <th className="py-3 px-3 min-w-[110px]">Keterangan</th>
                  <th className="py-3 px-2 w-20 text-center print:hidden">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 print:divide-slate-300 text-slate-200 print:text-slate-900">
                {filteredProjectorList.length === 0 ? (
                  <tr>
                    <td colSpan="11" className="py-8 text-center text-slate-400">
                      Tidak ada titik penugasan proyektor yang cocok dengan filter pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredProjectorList.map((item, idx) => {
                    const isKorwil = (item.wilayah || '').toLowerCase().includes('korwil') || (item.kode || '').toLowerCase().includes('titik');

                    return (
                      <tr
                        key={item.id || idx}
                        className={`transition-colors ${
                          isKorwil
                            ? 'bg-indigo-950/40 font-semibold border-t-2 border-indigo-500/40 print:bg-indigo-50'
                            : 'hover:bg-white/5 print:hover:bg-transparent'
                        }`}
                      >
                        <td className="py-2.5 px-2 text-center text-slate-400 font-mono text-[11px]">
                          {idx + 1}
                        </td>

                        <td className="py-2.5 px-3">
                          <span
                            className={`inline-block font-mono font-bold text-xs px-2 py-0.5 rounded ${
                              isKorwil
                                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-black'
                                : 'bg-slate-800 text-slate-300 border border-white/10'
                            }`}
                          >
                            {item.titik || item.kode || '-'}
                          </span>
                          {(item.group || item.titikGroup) && (
                            <span className="block text-[10px] text-slate-400 mt-0.5">
                              {item.group || item.titikGroup}
                            </span>
                          )}
                        </td>

                        <td className="py-2.5 px-3 font-bold text-white print:text-slate-900">
                          {item.wilayah || '-'}
                        </td>

                        <td className="py-2.5 px-3 font-medium">
                          {item.korwil ? (
                            <span className="text-indigo-300 font-semibold flex items-center gap-1">
                              <UserCheck className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                              {item.korwil}
                            </span>
                          ) : (
                            <span className="text-slate-500 italic">-</span>
                          )}
                        </td>

                        <td className="py-2.5 px-3 font-medium">
                          {item.operator ? (
                            <span className="text-cyan-300 font-semibold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                              {item.operator}
                            </span>
                          ) : (
                            <span className="text-slate-500 italic">-</span>
                          )}
                        </td>

                        <td className="py-2.5 px-3 text-slate-300">
                          {item.lcdNdalem || '-'}
                        </td>

                        <td className="py-2.5 px-3 font-mono text-cyan-300">
                          {item.proyektorNo || '-'}
                        </td>

                        <td className="py-2.5 px-3">
                          {item.petugasProyektor ? (
                            <span className="font-semibold text-emerald-300 print:text-emerald-900">
                              {item.petugasProyektor}
                            </span>
                          ) : (
                            <span className="text-slate-500 italic text-[11px]">- Kosong -</span>
                          )}
                        </td>

                        <td className="py-2.5 px-3">
                          {item.petugasKabel ? (
                            <span className="font-semibold text-amber-300 print:text-amber-900">
                              {item.petugasKabel}
                            </span>
                          ) : (
                            <span className="text-slate-500 italic text-[11px]">- Kosong -</span>
                          )}
                        </td>

                        <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                          {item.notes || '-'}
                        </td>

                        <td className="py-2.5 px-2 text-center print:hidden">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleOpenEdit(item, 'projector')}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition-colors"
                              title="Edit baris titik penugasan ini"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProjectorItem(item.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                              title="Hapus baris ini"
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
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: DOKUMENTASI, LIPUTAN & MULTIMEDIA MATRIX TABLE                     */}
      {/* ========================================================================= */}
      {activeTab === 'media' && (
        <div className="glass-card border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900/90 border-b border-white/15 text-slate-300 font-bold uppercase tracking-wider text-[11px] print:bg-slate-100 print:text-slate-900 print:border-slate-400">
                  <th className="py-3 px-2 w-10 text-center">No</th>
                  <th className="py-3 px-3 min-w-[150px]">Hari, Tanggal & Jam</th>
                  <th className="py-3 px-3 w-20">Sesi</th>
                  <th className="py-3 px-4 min-w-[150px]">Momen / Agenda</th>
                  <th className="py-3 px-4 min-w-[140px]">Area Liputan</th>
                  <th className="py-3 px-4 text-emerald-300 print:text-emerald-800 min-w-[140px]">
                    <span className="flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5" /> Fotografer
                    </span>
                  </th>
                  <th className="py-3 px-4 text-purple-300 print:text-purple-800 min-w-[140px]">
                    <span className="flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5" /> Videografer / Shooting
                    </span>
                  </th>
                  <th className="py-3 px-4 text-pink-300 print:text-pink-800 min-w-[140px]">
                    Short Video / Reels
                  </th>
                  <th className="py-3 px-3 min-w-[100px]">Keterangan</th>
                  <th className="py-3 px-2 w-20 text-center print:hidden">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 print:divide-slate-300 text-slate-200 print:text-slate-900">
                {filteredMediaList.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="py-8 text-center text-slate-400">
                      Tidak ada jadwal liputan dokumentasi yang cocok dengan filter pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredMediaList.map((item, idx) => {
                    const isMalam = (item.waktu || '').toLowerCase().includes('malam');

                    return (
                      <tr
                        key={item.id || idx}
                        className={`hover:bg-white/5 transition-colors ${
                          isMalam ? 'bg-purple-950/20' : ''
                        }`}
                      >
                        <td className="py-2.5 px-2 text-center text-slate-400 font-mono text-[11px]">
                          {idx + 1}
                        </td>

                        <td className="py-2.5 px-3">
                          <span className="font-bold text-white block">
                            {item.hari || '-'}
                            {item.tanggal ? `, ${item.tanggal}` : ''}
                          </span>
                          {item.jam && (
                            <span className="text-[11px] text-amber-300 font-mono block mt-0.5">
                              ⏰ {item.jam}
                            </span>
                          )}
                        </td>

                        <td className="py-2.5 px-3">
                          <span
                            className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded ${
                              (item.waktu || '').toLowerCase() === 'pagi'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : (item.waktu || '').toLowerCase() === 'siang'
                                ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                                : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                            }`}
                          >
                            {item.waktu || '-'}
                          </span>
                        </td>

                        <td className="py-2.5 px-4 font-bold text-white print:text-slate-900">
                          {item.momen || '-'}
                        </td>

                        <td className="py-2.5 px-4 text-slate-300">
                          {item.area || item.wilayah || '-'}
                        </td>

                        <td className="py-2.5 px-4">
                          {item.fotografer ? (
                            <span className="font-semibold text-emerald-300 print:text-emerald-900">
                              {item.fotografer}
                            </span>
                          ) : (
                            <span className="text-slate-500 italic text-[11px]">- Kosong -</span>
                          )}
                        </td>

                        <td className="py-2.5 px-4">
                          {item.videografer ? (
                            <span className="font-semibold text-purple-300 print:text-purple-900">
                              {item.videografer}
                            </span>
                          ) : (
                            <span className="text-slate-500 italic text-[11px]">- Kosong -</span>
                          )}
                        </td>

                        <td className="py-2.5 px-4">
                          {item.shortVideo ? (
                            <span className="font-semibold text-pink-300 print:text-pink-900">
                              {item.shortVideo}
                            </span>
                          ) : (
                            <span className="text-slate-500 italic text-[11px]">- Kosong -</span>
                          )}
                        </td>

                        <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                          {item.notes || '-'}
                        </td>

                        <td className="py-2.5 px-2 text-center print:hidden">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleOpenEdit(item, 'media')}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-purple-300 hover:bg-purple-500/10 transition-colors"
                              title="Edit baris jadwal liputan ini"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteMediaItem(item.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                              title="Hapus baris ini"
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
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL EDIT / TAMBAH PENUGASAN                                             */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={
          editingType === 'projector'
            ? 'Atur Titik Penugasan Proyektor & Kabel'
            : 'Atur Jadwal Liputan Momen Dokumentasi'
        }
        maxWidth="max-w-3xl"
      >
        {editingItem && (
          <form onSubmit={handleSaveModal} className="space-y-4 text-xs">
            {/* Projector Form Fields */}
            {editingType === 'projector' ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Kelompok Titik (Group)
                    </label>
                    <select
                      value={editingItem.titikGroup || editingItem.group || 'Titik A'}
                      onChange={(e) => setEditingItem({ ...editingItem, titikGroup: e.target.value, group: e.target.value })}
                      className="w-full glass-input text-xs bg-slate-900 text-white"
                    >
                      <option value="Titik A">Titik A</option>
                      <option value="Titik B">Titik B</option>
                      <option value="Titik C">Titik C</option>
                      <option value="Titik D">Titik D</option>
                      <option value="Titik E">Titik E</option>
                      <option value="Titik F">Titik F</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Kode Titik / Nama Titik
                    </label>
                    <input
                      type="text"
                      placeholder="misal: Titik A, Proyektor 1, LCD Ndalem"
                      value={editingItem.titik || editingItem.kode || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, titik: e.target.value, kode: e.target.value })}
                      className="w-full glass-input text-xs"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Wilayah / Lokasi Penempatan
                  </label>
                  <input
                    type="text"
                    placeholder="misal: Serambi Masjid Selatan, Kantor Al-Muhibbin, MA Lt 2"
                    value={editingItem.wilayah || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, wilayah: e.target.value })}
                    className="w-full glass-input text-xs"
                    required
                  />
                </div>

                {/* Korwil Wilayah */}
                <div className="p-3 rounded-xl bg-slate-900/80 border border-indigo-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-indigo-300 flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-indigo-400" />
                      Koordinator Wilayah (Korwil)
                    </label>
                    <span className="text-[10px] text-slate-400">Penanggung jawab titik wilayah</span>
                  </div>
                  <input
                    type="text"
                    placeholder="Ketik nama Korwil atau klik pilihan anggota terdaftar di bawah..."
                    value={editingItem.korwil || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, korwil: e.target.value })}
                    className="w-full glass-input text-xs font-semibold text-indigo-200"
                  />
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pt-1">
                    <span className="text-[10px] text-slate-400 self-center">Pilih Cepat Anggota:</span>
                    {members.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handleSelectMember('korwil', m.fullName)}
                        className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-indigo-600/30 text-slate-300 hover:text-indigo-200 border border-white/10 text-[10px] transition-all"
                      >
                        + {m.fullName}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Operator Wilayah */}
                <div className="p-3 rounded-xl bg-slate-900/80 border border-cyan-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-cyan-300 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-cyan-400" />
                      Operator Wilayah
                    </label>
                    <span className="text-[10px] text-slate-400">Operator teknis laptop/splitter</span>
                  </div>
                  <input
                    type="text"
                    placeholder="Ketik nama Operator atau klik pilihan anggota di bawah..."
                    value={editingItem.operator || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, operator: e.target.value })}
                    className="w-full glass-input text-xs font-semibold text-cyan-200"
                  />
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pt-1">
                    <span className="text-[10px] text-slate-400 self-center">Pilih Cepat Anggota:</span>
                    {members.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handleSelectMember('operator', m.fullName)}
                        className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-cyan-600/30 text-slate-300 hover:text-cyan-200 border border-white/10 text-[10px] transition-all"
                      >
                        + {m.fullName}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Layar LCD & No Proyektor */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Layar LCD Ndalem / Tambahan (Opsional)
                    </label>
                    <input
                      type="text"
                      placeholder="misal: Ndalem Al-Mardhiyah, Khufad, atau -"
                      value={editingItem.lcdNdalem || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, lcdNdalem: e.target.value })}
                      className="w-full glass-input text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      Nomor Proyektor (Opsional)
                    </label>
                    <input
                      type="text"
                      placeholder="misal: Proyektor 1, Proyektor 2, atau -"
                      value={editingItem.proyektorNo || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, proyektorNo: e.target.value })}
                      className="w-full glass-input text-xs font-mono text-cyan-300"
                    />
                  </div>
                </div>

                {/* Petugas Proyektor */}
                <div className="p-3 rounded-xl bg-slate-900/80 border border-white/10 space-y-2">
                  <label className="block font-bold text-emerald-300">
                    Petugas Proyektor (Ketik atau Pilih dari Anggota Terdaftar)
                  </label>
                  <input
                    type="text"
                    placeholder="Ketik nama petugas atau klik pilihan anggota di bawah..."
                    value={editingItem.petugasProyektor || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, petugasProyektor: e.target.value })}
                    className="w-full glass-input text-xs font-semibold text-emerald-200"
                  />

                  {/* Registered members quick pick */}
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pt-1">
                    <span className="text-[10px] text-slate-400 self-center">Pilih Cepat:</span>
                    {members.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handleSelectMember('petugasProyektor', m.fullName)}
                        className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-emerald-600/30 text-slate-300 hover:text-emerald-200 border border-white/10 text-[10px] transition-all"
                      >
                        + {m.fullName}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Petugas Kabel */}
                <div className="p-3 rounded-xl bg-slate-900/80 border border-white/10 space-y-2">
                  <label className="block font-bold text-amber-300">
                    Petugas Perkabelan / Listrik
                  </label>
                  <input
                    type="text"
                    placeholder="Ketik nama petugas kabel atau klik pilihan anggota di bawah..."
                    value={editingItem.petugasKabel || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, petugasKabel: e.target.value })}
                    className="w-full glass-input text-xs font-semibold text-amber-200"
                  />

                  {/* Registered members quick pick */}
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pt-1">
                    <span className="text-[10px] text-slate-400 self-center">Pilih Cepat:</span>
                    {members.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handleSelectMember('petugasKabel', m.fullName)}
                        className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-amber-600/30 text-slate-300 hover:text-amber-200 border border-white/10 text-[10px] transition-all"
                      >
                        + {m.fullName}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Keterangan / Catatan Tambahan (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="misal: Siapkan kabel HDMI 20 meter & sound check"
                    value={editingItem.notes || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, notes: e.target.value })}
                    className="w-full glass-input text-xs"
                  />
                </div>
              </>
            ) : (
              /* Media Form Fields */
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Hari Acara</label>
                    <input
                      type="text"
                      placeholder="misal: Rabu / Kamis"
                      value={editingItem.hari || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, hari: e.target.value })}
                      className="w-full glass-input text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-cyan-300 mb-1">Tanggal Acara</label>
                    <input
                      type="date"
                      value={editingItem.tanggal || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, tanggal: e.target.value })}
                      className="w-full glass-input text-xs bg-slate-900 text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-amber-300 mb-1">Jam Pelaksanaan</label>
                    <input
                      type="text"
                      placeholder="misal: 19:30 - Selesai / 08:00 - 12:00"
                      value={editingItem.jam || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, jam: e.target.value })}
                      className="w-full glass-input text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Sesi Waktu</label>
                    <select
                      value={editingItem.waktu || 'Malam'}
                      onChange={(e) => setEditingItem({ ...editingItem, waktu: e.target.value })}
                      className="w-full glass-input text-xs bg-slate-900 text-white"
                    >
                      <option value="Pagi">Pagi</option>
                      <option value="Siang">Siang</option>
                      <option value="Sore">Sore</option>
                      <option value="Malam">Malam</option>
                      <option value="Kondisional">Kondisional</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Momen / Agenda</label>
                    <input
                      type="text"
                      placeholder="misal: Pengajian Umum / Santunan / ISHARI / Khotmil Quran"
                      value={editingItem.momen || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, momen: e.target.value })}
                      className="w-full glass-input text-xs font-semibold text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">Wilayah / Area Liputan</label>
                    <input
                      type="text"
                      placeholder="misal: Panggung Utama & Halaman / Maqbarah"
                      value={editingItem.wilayah || editingItem.area || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, wilayah: e.target.value, area: e.target.value })}
                      className="w-full glass-input text-xs"
                      required
                    />
                  </div>
                </div>

                {/* Fotografer */}
                <div className="p-3 rounded-xl bg-slate-900/80 border border-white/10 space-y-2">
                  <label className="block font-bold text-emerald-300">
                    Petugas Fotografer
                  </label>
                  <input
                    type="text"
                    placeholder="Ketik nama fotografer atau klik anggota di bawah..."
                    value={editingItem.fotografer || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, fotografer: e.target.value })}
                    className="w-full glass-input text-xs font-semibold text-emerald-200"
                  />
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pt-1">
                    <span className="text-[10px] text-slate-400 self-center">Pilih Cepat:</span>
                    {members.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handleSelectMember('fotografer', m.fullName)}
                        className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-emerald-600/30 text-slate-300 hover:text-emerald-200 border border-white/10 text-[10px] transition-all"
                      >
                        + {m.fullName}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Videografer */}
                <div className="p-3 rounded-xl bg-slate-900/80 border border-white/10 space-y-2">
                  <label className="block font-bold text-purple-300">
                    Petugas Videografer / Shooting
                  </label>
                  <input
                    type="text"
                    placeholder="Ketik nama videografer / posisi kamera (Tengah, Kanan, Kiri)..."
                    value={editingItem.videografer || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, videografer: e.target.value })}
                    className="w-full glass-input text-xs font-semibold text-purple-200"
                  />
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pt-1">
                    <span className="text-[10px] text-slate-400 self-center">Pilih Cepat Posisi:</span>
                    {['Tengah', 'Kanan', 'Kiri'].map((pos) => (
                      <button
                        key={pos}
                        type="button"
                        onClick={() => handleSelectMember('videografer', `Posisi ${pos}`)}
                        className="px-2 py-0.5 rounded-md bg-purple-900/40 text-purple-300 border border-purple-500/30 text-[10px]"
                      >
                        Posisi {pos}
                      </button>
                    ))}
                    {members.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handleSelectMember('videografer', m.fullName)}
                        className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-purple-600/30 text-slate-300 hover:text-purple-200 border border-white/10 text-[10px] transition-all"
                      >
                        + {m.fullName}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Short Video */}
                <div className="p-3 rounded-xl bg-slate-900/80 border border-white/10 space-y-2">
                  <label className="block font-bold text-pink-300">
                    Short Video / Reels / Catatan Posisi
                  </label>
                  <input
                    type="text"
                    placeholder="misal: Muhammad Afwan & Jazeera Azkahaiy"
                    value={editingItem.shortVideo || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, shortVideo: e.target.value })}
                    className="w-full glass-input text-xs font-semibold text-pink-200"
                  />
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pt-1">
                    <span className="text-[10px] text-slate-400 self-center">Pilih Cepat:</span>
                    {members.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handleSelectMember('shortVideo', m.fullName)}
                        className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-pink-600/30 text-slate-300 hover:text-pink-200 border border-white/10 text-[10px] transition-all"
                      >
                        + {m.fullName}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Keterangan / Catatan Tambahan (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="misal: Standby 30 menit sebelum acara & siapkan baterai cadangan"
                    value={editingItem.notes || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, notes: e.target.value })}
                    className="w-full glass-input text-xs"
                  />
                </div>
              </>
            )}

            {/* Modal Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl gradient-btn text-xs font-bold text-white shadow-glow transition-all active:scale-95"
              >
                Terapkan Baris Ini
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default AdminDutyAssignmentsPage;
