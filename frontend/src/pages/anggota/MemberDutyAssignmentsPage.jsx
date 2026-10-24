import React, { useState, useEffect, useMemo } from 'react';
import {
  Compass,
  Tv,
  Camera,
  Video,
  Zap,
  Search,
  Filter,
  Printer,
  Users,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText,
  BadgeCheck,
  RefreshCw,
  ExternalLink,
  UserCheck,
} from 'lucide-react';
import api from '../../api/axios.js';
import { useAuthStore } from '../../store/authStore.js';
import { useThemeStore } from '../../store/themeStore.js';
import { toast } from '../../store/toastStore.js';

export const MemberDutyAssignmentsPage = () => {
  const { user } = useAuthStore();
  const { branding } = useThemeStore();
  const [activeTab, setActiveTab] = useState('projector'); // 'projector' | 'media'

  // Data states
  const [projectorList, setProjectorList] = useState([]);
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('ALL');
  const [selectedDay, setSelectedDay] = useState('ALL');
  const [selectedTime, setSelectedTime] = useState('ALL');

  // Fetch duty assignments
  const fetchDutyData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/settings/duty-assignments');
      const data = res.data?.data || {};

      const projs = (data.projectorAssignments || []).map((p) => ({
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

      const meds = (data.mediaAssignments || []).map((m) => ({
        ...m,
        area: m.area || m.wilayah || '',
        wilayah: m.wilayah || m.area || '',
        tanggal: m.tanggal || '',
        jam: m.jam || '',
        videografer: m.videografer || m.shootingTengah || '',
      }));

      setProjectorList(projs);
      setMediaList(meds);
    } catch (err) {
      toast.error('Gagal memuat jadwal penugasan wilayah: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDutyData();
  }, []);

  // Compute current user's name tokens for intelligent matching
  const userTokens = useMemo(() => {
    const rawNames = [
      user?.member?.fullName,
      user?.name,
      user?.username,
    ].filter(Boolean);

    const tokens = new Set();
    rawNames.forEach((n) => {
      const cleaned = String(n).trim().toLowerCase();
      if (cleaned.length >= 3) {
        tokens.add(cleaned);
        cleaned.split(/\s+/).forEach((w) => {
          if (w.length >= 3) tokens.add(w);
        });
      }
    });
    return Array.from(tokens);
  }, [user]);

  // Check if string contains any user tokens
  const matchesUser = (text) => {
    if (!text || userTokens.length === 0) return false;
    const lower = String(text).toLowerCase();
    return userTokens.some((t) => lower.includes(t));
  };

  // Find all personal duties for the logged-in user
  const myDuties = useMemo(() => {
    if (userTokens.length === 0) return { projector: [], media: [] };

    const myProj = [];
    projectorList.forEach((item) => {
      const matchedRoles = [];
      if (matchesUser(item.korwil)) matchedRoles.push({ role: 'Koordinator Wilayah (Korwil)', value: item.korwil, color: 'text-indigo-300' });
      if (matchesUser(item.operator)) matchedRoles.push({ role: 'Operator Wilayah', value: item.operator, color: 'text-cyan-300' });
      if (matchesUser(item.petugasProyektor)) matchedRoles.push({ role: 'Petugas Proyektor', value: item.petugasProyektor, color: 'text-emerald-300' });
      if (matchesUser(item.petugasKabel)) matchedRoles.push({ role: 'Petugas Kabel/Listrik', value: item.petugasKabel, color: 'text-amber-300' });

      if (matchedRoles.length > 0) {
        myProj.push({
          item,
          matchedRoles,
        });
      }
    });

    const myMed = [];
    mediaList.forEach((item) => {
      const matchedRoles = [];
      if (matchesUser(item.fotografer)) matchedRoles.push({ role: 'Fotografer', value: item.fotografer, color: 'text-emerald-300' });
      if (matchesUser(item.videografer)) matchedRoles.push({ role: 'Videografer / Shooting', value: item.videografer, color: 'text-purple-300' });
      if (matchesUser(item.shootingTengah)) matchedRoles.push({ role: 'Shooting Posisi Tengah', value: item.shootingTengah, color: 'text-purple-300' });
      if (matchesUser(item.shortVideo)) matchedRoles.push({ role: 'Short Video / Reels', value: item.shortVideo, color: 'text-pink-300' });

      if (matchedRoles.length > 0) {
        myMed.push({
          item,
          matchedRoles,
        });
      }
    });

    return { projector: myProj, media: myMed };
  }, [projectorList, mediaList, userTokens]);

  const totalMyDuties = myDuties.projector.length + myDuties.media.length;

  // Filtered Projector List
  const filteredProjectorList = useMemo(() => {
    return projectorList.filter((item) => {
      const itemGrp = item.group || item.titikGroup;
      if (selectedGroup !== 'ALL' && itemGrp !== selectedGroup) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        String(item.titik || '').toLowerCase().includes(q) ||
        String(item.kode || '').toLowerCase().includes(q) ||
        String(item.wilayah || '').toLowerCase().includes(q) ||
        String(item.korwil || '').toLowerCase().includes(q) ||
        String(item.operator || '').toLowerCase().includes(q) ||
        String(item.lcdNdalem || '').toLowerCase().includes(q) ||
        String(item.proyektorNo || '').toLowerCase().includes(q) ||
        String(item.petugasProyektor || '').toLowerCase().includes(q) ||
        String(item.petugasKabel || '').toLowerCase().includes(q)
      );
    });
  }, [projectorList, selectedGroup, search]);

  // Filtered Media List
  const filteredMediaList = useMemo(() => {
    return mediaList.filter((item) => {
      if (selectedDay !== 'ALL' && item.hari !== selectedDay) return false;
      if (selectedTime !== 'ALL' && item.waktu !== selectedTime) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        String(item.momen || '').toLowerCase().includes(q) ||
        String(item.area || '').toLowerCase().includes(q) ||
        String(item.wilayah || '').toLowerCase().includes(q) ||
        String(item.tanggal || '').toLowerCase().includes(q) ||
        String(item.jam || '').toLowerCase().includes(q) ||
        String(item.fotografer || '').toLowerCase().includes(q) ||
        String(item.videografer || '').toLowerCase().includes(q) ||
        String(item.shortVideo || '').toLowerCase().includes(q)
      );
    });
  }, [mediaList, selectedDay, selectedTime, search]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-20 print:p-0 print:m-0 print:space-y-3">
      {/* Print Stylesheet */}
      <style>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 10mm;
          }
          body {
            background: white !important;
            color: black !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print\\:hidden, nav, aside, header, footer, .fixed, .no-print {
            display: none !important;
          }
          .print-table {
            width: 100% !important;
            border-collapse: collapse !important;
            font-size: 10px !important;
          }
          .print-table th, .print-table td {
            border: 1px solid #333 !important;
            padding: 4px 6px !important;
            color: black !important;
          }
          .print-table th {
            background-color: #f1f5f9 !important;
            font-weight: bold !important;
            text-align: center !important;
          }
          .print-header {
            display: block !important;
            text-align: center;
            border-bottom: 2px double #000;
            padding-bottom: 8px;
            margin-bottom: 12px;
          }
        }
        @media screen {
          .print-only {
            display: none !important;
          }
        }
      `}</style>

      {/* PRINT-ONLY KOP SURAT */}
      <div className="print-only print-header">
        <h2 className="text-xl font-bold uppercase tracking-wider text-black">
          {branding?.kopNama || branding?.organizationName || 'PANITIA ROJABIYYAH 2026'}
        </h2>
        <p className="text-xs text-gray-700">
          JADWAL PEMBAGIAN WILAYAH, TITIK TUGAS & MATRIKS PENUGASAN PANITIA
        </p>
        <p className="text-[10px] text-gray-500 italic mt-0.5">
          Dicetak oleh Anggota: {user?.member?.fullName || user?.username} &bull; Tanggal Cetak: {new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}
        </p>
      </div>

      {/* Screen Header */}
      <div className="print:hidden flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900/90 via-slate-800/80 to-indigo-950/40 p-5 rounded-2xl border border-white/10 shadow-xl backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-inner">
              <Compass className="w-5 h-5" />
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
              Portal Anggota &bull; Penugasan Lapangan
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Pembagian Wilayah & Jadwal Penugasan
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Informasi penempatan personil divisi Proyektor, Kabel, Layar LCD, Korwil, Operator & Liputan Media Acara.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-center">
          <button
            onClick={fetchDutyData}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium border border-white/10 transition-all active:scale-95 shadow-md"
            title="Segarkan data terbaru"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-sm font-semibold shadow-lg shadow-cyan-600/20 transition-all active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Jadwal (A4)</span>
          </button>
        </div>
      </div>

      {/* HIGHLIGHT: PENUGASAN SAYA HARI INI */}
      <div className="print:hidden">
        {totalMyDuties > 0 ? (
          <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 via-slate-900/90 to-cyan-950/30 p-5 shadow-2xl backdrop-blur-xl">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-44 h-44 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-4 border-b border-emerald-500/20">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-glow">
                  <BadgeCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">
                      Penugasan Resmi Anda
                    </h3>
                    <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse">
                      {totalMyDuties} Titik Tugas
                    </span>
                  </div>
                  <p className="text-xs text-emerald-200/80">
                    Nama terdaftar: <span className="font-semibold text-white">{user?.member?.fullName || user?.username}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* My Projector Duties */}
              {myDuties.projector.map((d, idx) => (
                <div
                  key={`my-proj-${idx}`}
                  className="p-3.5 rounded-xl bg-slate-900/70 border border-cyan-500/30 hover:border-cyan-400/60 transition-all shadow-md group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      <Tv className="w-3 h-3" />
                      Divisi Proyektor & Kabel
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">
                      {d.item.group || d.item.titikGroup}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {d.item.titik || d.item.kode}
                  </h4>
                  <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>{d.item.wilayah || 'Area Pos'}</span>
                  </p>

                  <div className="mt-2.5 pt-2 border-t border-white/10 space-y-1">
                    {d.matchedRoles.map((r, rIdx) => (
                      <div key={rIdx} className="flex items-start justify-between text-xs">
                        <span className="text-slate-400">{r.role}:</span>
                        <span className={`font-semibold text-right ${r.color || 'text-cyan-200'}`}>{r.value}</span>
                      </div>
                    ))}
                    {d.item.korwil && !matchesUser(d.item.korwil) && (
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                        <span>Korwil Titik:</span>
                        <span className="text-slate-200 font-medium">{d.item.korwil}</span>
                      </div>
                    )}
                    {d.item.operator && !matchesUser(d.item.operator) && (
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>Operator:</span>
                        <span className="text-cyan-300 font-medium">{d.item.operator}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* My Media Duties */}
              {myDuties.media.map((d, idx) => (
                <div
                  key={`my-med-${idx}`}
                  className="p-3.5 rounded-xl bg-slate-900/70 border border-indigo-500/30 hover:border-indigo-400/60 transition-all shadow-md group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      <Camera className="w-3 h-3" />
                      Divisi Dokumentasi
                    </span>
                    <span className="text-[11px] font-semibold text-amber-300">
                      {d.item.hari} &bull; {d.item.waktu}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {d.item.momen}
                  </h4>
                  <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>{d.item.area || d.item.wilayah || 'Area Liputan'}</span>
                  </p>
                  {(d.item.tanggal || d.item.jam) && (
                    <p className="text-[11px] text-cyan-300 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-cyan-400 shrink-0" />
                      <span>{d.item.tanggal ? `${d.item.tanggal} ` : ''}{d.item.jam ? `(${d.item.jam})` : ''}</span>
                    </p>
                  )}

                  <div className="mt-2.5 pt-2 border-t border-white/10 space-y-1">
                    {d.matchedRoles.map((r, rIdx) => (
                      <div key={rIdx} className="flex items-start justify-between text-xs">
                        <span className="text-slate-400">{r.role}:</span>
                        <span className={`font-semibold text-right ${r.color || 'text-indigo-200'}`}>{r.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-start sm:items-center gap-3.5 p-4 rounded-2xl bg-slate-900/60 border border-slate-700/60 backdrop-blur-md">
            <div className="p-2.5 rounded-xl bg-slate-800 text-slate-400 border border-slate-700 shrink-0">
              <AlertCircle className="w-5 h-5 text-amber-400" />
            </div>
            <div className="text-xs sm:text-sm">
              <span className="font-semibold text-white">Status Penugasan Anda: </span>
              <span className="text-slate-300">
                Nama Anda (<span className="text-cyan-400 font-medium">{user?.member?.fullName || user?.username}</span>) belum terdaftar secara spesifik di jadwal matriks saat ini. Silakan periksa daftar penugasan umum seluruh titik di bawah ini atau konfirmasikan ke Admin / Koordinator Wilayah.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* TAB SELECTOR */}
      <div className="print:hidden flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('projector')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'projector'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-600/30'
                : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-white/5'
            }`}
          >
            <Tv className="w-4 h-4" />
            <span>Divisi Proyektor, Kabel & Layar LCD</span>
            <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs bg-black/30 text-white">
              {projectorList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('media')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'media'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-white/5'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Divisi Dokumentasi & Liputan Momen</span>
            <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs bg-black/30 text-white">
              {mediaList.length}
            </span>
          </button>
        </div>

        {/* Global Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={activeTab === 'projector' ? 'Cari titik, korwil, operator, petugas...' : 'Cari momen, tgl, petugas, area...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900/90 border border-white/10 text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all shadow-inner"
          />
        </div>
      </div>

      {/* TAB 1: DIVISI PROYEKTOR, KABEL & LAYAR LCD */}
      {(activeTab === 'projector' || typeof window === 'undefined') && (
        <div className="space-y-4">
          {/* Filters for Projector */}
          <div className="print:hidden flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5" />
              Kelompok Titik:
            </span>
            {['ALL', 'Titik A', 'Titik B', 'Titik C', 'Titik D', 'Titik E', 'Titik F'].map((grp) => (
              <button
                key={grp}
                onClick={() => setSelectedGroup(grp)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedGroup === grp
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold shadow-sm'
                    : 'bg-slate-800/60 hover:bg-slate-800 text-slate-400 border border-white/5'
                }`}
              >
                {grp === 'ALL' ? 'Semua Titik (A - F)' : grp}
              </button>
            ))}
          </div>

          {/* Table Container */}
          <div className="bg-slate-900/90 border border-white/10 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl print:border-none print:shadow-none print:bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse print-table">
                <thead>
                  <tr className="bg-slate-800/90 border-b border-white/10 text-[11px] uppercase tracking-wider text-slate-300 font-bold">
                    <th className="py-3 px-2 text-center w-10">No</th>
                    <th className="py-3 px-3 min-w-[120px]">Titik / Kode</th>
                    <th className="py-3 px-3 min-w-[140px]">Wilayah</th>
                    <th className="py-3 px-3 min-w-[120px] text-indigo-300">Korwil</th>
                    <th className="py-3 px-3 min-w-[120px] text-cyan-300">Operator</th>
                    <th className="py-3 px-3 min-w-[110px]">LCD Ndalem</th>
                    <th className="py-3 px-3 min-w-[100px]">No. Proyektor</th>
                    <th className="py-3 px-3 min-w-[130px] text-emerald-300">Petugas Proyektor</th>
                    <th className="py-3 px-3 min-w-[130px] text-amber-300">Petugas Kabel</th>
                    <th className="py-3 px-3 min-w-[110px]">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs text-slate-300">
                  {loading ? (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-slate-400">
                        <div className="inline-block w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mb-2" />
                        <p>Memuat matriks penugasan proyektor & kabel...</p>
                      </td>
                    </tr>
                  ) : filteredProjectorList.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-10 text-center text-slate-400">
                        Tidak ada data titik wilayah yang sesuai dengan filter.
                      </td>
                    </tr>
                  ) : (
                    filteredProjectorList.map((row, idx) => {
                      const isMyRow =
                        matchesUser(row.korwil) ||
                        matchesUser(row.operator) ||
                        matchesUser(row.petugasProyektor) ||
                        matchesUser(row.petugasKabel);

                      return (
                        <tr
                          key={row.id || idx}
                          className={`transition-colors ${
                            isMyRow
                              ? 'bg-cyan-950/40 hover:bg-cyan-900/50 font-medium border-l-4 border-l-cyan-400'
                              : 'hover:bg-slate-800/50'
                          }`}
                        >
                          <td className="py-2.5 px-2 text-center text-slate-400 font-mono text-[11px]">
                            {idx + 1}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="font-semibold text-white">
                              {row.titik || row.kode || '-'}
                            </span>
                            {(row.group || row.titikGroup) && (
                              <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 border border-white/5">
                                {row.group || row.titikGroup}
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-slate-200 font-medium">
                            {row.wilayah || '-'}
                          </td>
                          <td className="py-2.5 px-3 font-medium">
                            {row.korwil ? (
                              <span className={matchesUser(row.korwil) ? 'text-indigo-300 font-bold bg-indigo-950/70 px-1.5 py-0.5 rounded border border-indigo-500/30' : 'text-slate-300'}>
                                {row.korwil}
                              </span>
                            ) : (
                              <span className="text-slate-500 italic">-</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 font-medium">
                            {row.operator ? (
                              <span className={matchesUser(row.operator) ? 'text-cyan-300 font-bold bg-cyan-950/70 px-1.5 py-0.5 rounded border border-cyan-500/30' : 'text-slate-300'}>
                                {row.operator}
                              </span>
                            ) : (
                              <span className="text-slate-500 italic">-</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-slate-300">
                            {row.lcdNdalem || '-'}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="font-mono text-cyan-300 font-medium">
                              {row.proyektorNo || '-'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className={matchesUser(row.petugasProyektor) ? 'text-emerald-300 font-bold bg-emerald-950/70 px-1.5 py-0.5 rounded border border-emerald-500/30' : 'text-slate-300'}>
                              {row.petugasProyektor || '-'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className={matchesUser(row.petugasKabel) ? 'text-amber-300 font-bold bg-amber-950/70 px-1.5 py-0.5 rounded border border-amber-500/30' : 'text-slate-300'}>
                              {row.petugasKabel || '-'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                            {row.notes || '-'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="print:hidden p-3 bg-slate-950/60 border-t border-white/5 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
                <span>Baris dengan border & highlight khusus adalah lokasi penugasan nama Anda.</span>
              </div>
              <div>
                Total: <span className="font-bold text-white">{filteredProjectorList.length}</span> Titik Ditampilkan
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DIVISI DOKUMENTASI & MEDIA */}
      {(activeTab === 'media' || typeof window === 'undefined') && (
        <div className="space-y-4">
          {/* Filters for Media */}
          <div className="print:hidden flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-400 flex items-center gap-1 mr-1">
                <Calendar className="w-3.5 h-3.5" />
                Hari:
              </span>
              {['ALL', 'Rabu', 'Kamis'].map((d) => (
                <button
                  key={d}
                  onClick={() => setSelectedDay(d)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedDay === d
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-bold'
                      : 'bg-slate-800/60 hover:bg-slate-800 text-slate-400 border border-white/5'
                  }`}
                >
                  {d === 'ALL' ? 'Semua Hari' : d}
                </button>
              ))}

              <span className="text-xs text-slate-400 flex items-center gap-1 ml-2 mr-1">
                <Clock className="w-3.5 h-3.5" />
                Sesi:
              </span>
              {['ALL', 'Pagi', 'Siang', 'Sore', 'Malam'].map((w) => (
                <button
                  key={w}
                  onClick={() => setSelectedTime(w)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedTime === w
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold'
                      : 'bg-slate-800/60 hover:bg-slate-800 text-slate-400 border border-white/5'
                  }`}
                >
                  {w === 'ALL' ? 'Semua Sesi' : w}
                </button>
              ))}
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-slate-900/90 border border-white/10 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl print:border-none print:shadow-none print:bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse print-table">
                <thead>
                  <tr className="bg-slate-800/90 border-b border-white/10 text-[11px] uppercase tracking-wider text-slate-300 font-bold">
                    <th className="py-3 px-2 text-center w-10">No</th>
                    <th className="py-3 px-3 min-w-[150px]">Hari, Tanggal & Jam</th>
                    <th className="py-3 px-3 w-20">Sesi</th>
                    <th className="py-3 px-3 min-w-[150px]">Momen Acara</th>
                    <th className="py-3 px-3 min-w-[140px]">Area Liputan</th>
                    <th className="py-3 px-3 min-w-[130px] text-emerald-300">Fotografer</th>
                    <th className="py-3 px-3 min-w-[140px] text-purple-300">Videografer / Shooting</th>
                    <th className="py-3 px-3 min-w-[140px] text-pink-300">Short Video / Reels</th>
                    <th className="py-3 px-3 min-w-[100px]">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs text-slate-300">
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400">
                        <div className="inline-block w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-2" />
                        <p>Memuat jadwal divisi dokumentasi & liputan...</p>
                      </td>
                    </tr>
                  ) : filteredMediaList.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-10 text-center text-slate-400">
                        Tidak ada data momen liputan yang sesuai dengan filter.
                      </td>
                    </tr>
                  ) : (
                    filteredMediaList.map((row, idx) => {
                      const isMyRow =
                        matchesUser(row.fotografer) ||
                        matchesUser(row.videografer) ||
                        matchesUser(row.shootingTengah) ||
                        matchesUser(row.shortVideo);

                      return (
                        <tr
                          key={row.id || idx}
                          className={`transition-colors ${
                            isMyRow
                              ? 'bg-indigo-950/40 hover:bg-indigo-900/50 font-medium border-l-4 border-l-indigo-400'
                              : 'hover:bg-slate-800/50'
                          }`}
                        >
                          <td className="py-2.5 px-2 text-center text-slate-400 font-mono text-[11px]">
                            {idx + 1}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="font-bold text-white block">
                              {row.hari || '-'}
                              {row.tanggal ? `, ${row.tanggal}` : ''}
                            </span>
                            {row.jam && (
                              <span className="text-[11px] text-amber-300 font-mono block mt-0.5">
                                ⏰ {row.jam}
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded ${
                                (row.waktu || '').toLowerCase() === 'pagi'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : (row.waktu || '').toLowerCase() === 'siang'
                                  ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                                  : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                              }`}
                            >
                              {row.waktu || '-'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-slate-100">
                            {row.momen}
                          </td>
                          <td className="py-2.5 px-3 text-slate-300">
                            {row.area || row.wilayah || '-'}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className={matchesUser(row.fotografer) ? 'text-emerald-300 font-bold bg-emerald-950/70 px-1.5 py-0.5 rounded border border-emerald-500/30' : 'text-slate-300'}>
                              {row.fotografer || '-'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className={matchesUser(row.videografer || row.shootingTengah) ? 'text-purple-300 font-bold bg-purple-950/70 px-1.5 py-0.5 rounded border border-purple-500/30' : 'text-slate-300'}>
                              {row.videografer || row.shootingTengah || '-'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className={matchesUser(row.shortVideo) ? 'text-pink-300 font-bold bg-pink-950/70 px-1.5 py-0.5 rounded border border-pink-500/30' : 'text-slate-300'}>
                              {row.shortVideo || '-'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                            {row.notes || '-'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="print:hidden p-3 bg-slate-950/60 border-t border-white/5 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-400"></span>
                <span>Baris dengan border & highlight khusus adalah jadwal liputan nama Anda.</span>
              </div>
              <div>
                Total: <span className="font-bold text-white">{filteredMediaList.length}</span> Momen Ditampilkan
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRINT-ONLY SIGNATURE SECTION */}
      <div className="print-only mt-8 grid grid-cols-2 gap-8 text-center text-xs">
        <div>
          <p className="font-bold">Mengetahui,</p>
          <p>Ketua Panitia Pelaksana</p>
          <div className="h-16" />
          <p className="font-bold underline">_________________________</p>
        </div>
        <div>
          <p className="font-bold">Koordinator Wilayah / Divisi</p>
          <p>Penanggung Jawab Lapangan</p>
          <div className="h-16" />
          <p className="font-bold underline">_________________________</p>
        </div>
      </div>
    </div>
  );
};

export default MemberDutyAssignmentsPage;
