import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HandCoins,
  Compass,
  PlusCircle,
  FileText,
  MapPin,
  Calendar,
  CheckCircle,
  Clock,
  Sparkles,
  FolderOpen,
  Tv,
  User,
} from 'lucide-react';
import { StatCard } from '../../components/ui/StatCard.jsx';
import { StatusBadge } from '../../components/ui/StatusBadge.jsx';
import { formatDate, getImageUrl } from '../../lib/utils.js';
import api from '../../api/axios.js';

export const MemberDashboardPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMemberData = async () => {
      try {
        const res = await api.get('/dashboard/member');
        setData(res.data.data);
      } catch (err) {
        console.error('Gagal memuat dashboard anggota:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMemberData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const member = data?.member || {};
  const stats = data?.stats || {};
  const assignedTaskPoints = data?.assignedTaskPoints || [];
  const myRecentLoans = data?.myRecentLoans || [];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl p-6 glass-card border border-white/10 bg-gradient-to-r from-[#800020]/30 via-slate-900/90 to-slate-950 shadow-glass">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            {/* Member Avatar */}
            <div
              onClick={() => navigate('/member/profile')}
              className="w-16 h-16 rounded-2xl p-0.5 bg-gradient-to-tr from-amber-400 via-rose-500 to-[#800020] shadow-glow flex-shrink-0 cursor-pointer overflow-hidden group hover:scale-105 transition-transform"
              title="Klik untuk Kelola Profil & Foto"
            >
              <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center overflow-hidden">
                {member.avatar ? (
                  <img
                    src={getImageUrl(member.avatar)}
                    alt="Foto Profil"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#800020] to-rose-700 flex items-center justify-center text-white font-extrabold text-xl uppercase">
                    {(member.fullName || 'AN').slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                  {member.memberId || 'RJB-ANGGOTA'}
                </span>
                <span className="text-xs text-slate-400">
                  Wilayah: {member.region?.name || 'Pusat'}
                </span>
                {member.division && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/20 hidden sm:inline-block">
                    {member.division}
                  </span>
                )}
              </div>
              <h2 className="text-xl md:text-2xl font-extrabold text-white">
                Ahlan wa Sahlan, <span className="text-rose-400">{member.fullName || 'Anggota'}</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Pantau jadwal titik tugas wilayah Anda, status permohonan logistik, dan kelola profil identitas Anda.
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => navigate('/member/profile')}
              className="px-3.5 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
            >
              <User className="w-4 h-4 text-rose-400" />
              <span>Kelola Profil</span>
            </button>
            <button
              onClick={() => navigate('/member/duty-assignments')}
              className="px-3.5 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
            >
              <Tv className="w-4 h-4 text-amber-400" />
              <span>Jadwal Penugasan</span>
            </button>
            <button
              onClick={() => navigate('/member/drive')}
              className="px-3.5 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
            >
              <FolderOpen className="w-4 h-4 text-cyan-400" />
              <span>Drive Unduhan</span>
            </button>
            <button
              onClick={() => navigate('/member/inventory')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#800020] to-rose-600 hover:from-rose-800 hover:to-rose-700 text-white text-xs font-bold flex items-center gap-2 shadow-glow"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Ajukan Peminjaman</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Titik Tugas Saya"
          value={`${stats.taskPointsCount || 0} Titik`}
          subtitle="Tugas kontrol wilayah aktif"
          icon={Compass}
          color="cyan"
        />
        <StatCard
          title="Peminjaman Berjalan"
          value={`${stats.activeLoans || 0} Pengajuan`}
          subtitle="Sedang diproses / dipinjam"
          icon={HandCoins}
          color="amber"
        />
        <StatCard
          title="Total Riwayat Pinjam"
          value={`${stats.totalLoans || 0} Kali`}
          subtitle="Sejak bergabung di organisasi"
          icon={CheckCircle}
          color="emerald"
        />
      </div>

      {/* Titik Tugas Wilayah Saya */}
      <div className="glass-card p-5 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              Titik Tugas Wilayah yang Ditugaskan
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Lokasi tugas Anda untuk pemantauan perlengkapan dan pelaporan kondisi
            </p>
          </div>
          <button
            onClick={() => navigate('/member/region-control')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
          >
            Kirim Laporan Lapangan →
          </button>
        </div>

        {assignedTaskPoints.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-8">
            Saat ini Anda belum ditugaskan pada titik kontrol wilayah.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assignedTaskPoints.map((tp) => (
              <div
                key={tp.id}
                className="p-4 rounded-xl bg-slate-900/60 border border-white/10 hover:border-cyan-500/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      {tp.categoryName || 'Dokumentasi'}
                    </span>
                    <span className="text-[10px] text-slate-400">{tp.region?.name}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{tp.name}</h4>
                  <p className="text-xs text-slate-400 mt-1 flex items-start gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0 mt-0.5" />
                    <span>{tp.address || '-'}</span>
                  </p>
                  {tp.schedule && (
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                      <span>{tp.schedule}</span>
                    </p>
                  )}
                </div>

                <button
                  onClick={() => navigate('/member/region-control')}
                  className="mt-4 w-full py-2 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Kirim Laporan Kondisi</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Riwayat Peminjaman Terakhir Saya */}
      <div className="glass-card p-5 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <HandCoins className="w-4 h-4 text-indigo-400" />
            Pengajuan Peminjaman Terakhir Saya
          </h3>
          <button
            onClick={() => navigate('/member/loans')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
          >
            Lihat Semua →
          </button>
        </div>

        {myRecentLoans.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-8">Anda belum memiliki riwayat peminjaman.</p>
        ) : (
          <div className="space-y-3">
            {myRecentLoans.map((loan) => (
              <div
                key={loan.id}
                className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-white">{loan.loanCode}</span>
                    <StatusBadge status={loan.status} />
                  </div>
                  <p className="text-slate-300">
                    Keperluan: <span className="font-medium text-white">{loan.purpose}</span>
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Periode: {formatDate(loan.startDate)} s/d {formatDate(loan.endDate)}
                  </p>
                </div>
                <div className="text-slate-400 text-[11px]">
                  {loan.loanItems?.length || 0} unit barang
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

