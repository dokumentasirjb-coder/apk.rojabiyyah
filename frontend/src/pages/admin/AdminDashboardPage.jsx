import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Boxes,
  HandCoins,
  Wallet,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Compass,
  FolderOpen,
  Tv,
  Trash2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { StatCard } from '../../components/ui/StatCard.jsx';
import { StatusBadge } from '../../components/ui/StatusBadge.jsx';
import { ResetDataModal } from '../../components/admin/ResetDataModal.jsx';
import { formatRupiah, formatDate } from '../../lib/utils.js';
import api from '../../api/axios.js';

export const AdminDashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/admin');
        setData(res.data.data);
      } catch (err) {
        console.error('Gagal memuat analitik dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const stats = data?.stats || {};
  const charts = data?.charts || {};
  const recentActivities = data?.recentActivities || [];
  const pendingLoans = data?.pendingLoansList || [];
  const criticalReports = data?.criticalReports || [];

  const PIE_COLORS = ['#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl p-6 glass-card border border-white/10 bg-gradient-to-r from-slate-900 via-slate-900/90 to-[#800020]/25 shadow-glass">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#800020] via-rose-500 to-amber-400" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
              Pusat Komando Administrasi <span className="gradient-ai-text">Rojabiyyaah</span>
            </h2>
            <p className="text-xs md:text-sm text-slate-400 mt-1">
              Pemantauan realtime stok logistik, sirkulasi peminjaman, titik wilayah, dan rekap keuangan organisasi.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/admin/duty-assignments"
              className="px-3.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-white/10 hover:border-amber-400/40 text-slate-200 hover:text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Tv className="w-3.5 h-3.5 text-amber-400" />
              <span>Pembagian Penugasan</span>
            </Link>
            <Link
              to="/admin/drive"
              className="px-3.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-white/10 hover:border-rose-400/40 text-slate-200 hover:text-rose-300 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <FolderOpen className="w-3.5 h-3.5 text-rose-400" />
              <span>Google Drive Berkas</span>
            </Link>
            <button
              onClick={() => setIsResetModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 hover:border-rose-500/60 text-rose-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
              title="Reset dan bersihkan data operasional sistem"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Reset Data</span>
            </button>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Sistem Aktif & Normal
            </span>
          </div>
        </div>
      </div>

      {/* Critical Alerts Banner (If there are pending loans or critical reports) */}
      {(stats.pendingLoansCount > 0 || stats.criticalReportsCount > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats.pendingLoansCount > 0 && (
            <div className="p-4 rounded-xl glass-card border-amber-500/30 bg-amber-950/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <HandCoins className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Menunggu Persetujuan Peminjaman</p>
                  <p className="text-[11px] text-amber-300">Ada {stats.pendingLoansCount} pengajuan peminjaman menunggu verifikasi Anda</p>
                </div>
              </div>
            </div>
          )}

          {stats.criticalReportsCount > 0 && (
            <div className="p-4 rounded-xl glass-card border-rose-500/30 bg-rose-950/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Peringatan Kondisi Wilayah</p>
                  <p className="text-[11px] text-rose-300">Ada {stats.criticalReportsCount} laporan titik tugas berstatus Rusak / Perlu Perhatian</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Anggota"
          value={stats.totalMembers || 0}
          subtitle="Anggota berstatus aktif"
          icon={Users}
          color="indigo"
        />
        <StatCard
          title="Total Inventaris"
          value={`${stats.totalInventoryUnits || 0} Unit`}
          subtitle={`${stats.totalInventoryCount || 0} macam kategori`}
          icon={Boxes}
          color="cyan"
        />
        <StatCard
          title="Peminjaman Aktif"
          value={`${stats.activeLoans || 0} Transaksi`}
          subtitle="Barang sedang berada di luar"
          icon={HandCoins}
          color="amber"
        />
        <StatCard
          title="Saldo Kas Organisasi"
          value={formatRupiah(stats.balance || 0)}
          subtitle={`Masuk: ${formatRupiah(stats.totalIncome || 0)}`}
          icon={Wallet}
          color="emerald"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income vs Expense Trend Chart (2 columns) */}
        <div className="lg:col-span-2 glass-card p-5 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                Tren Arus Kas Keuangan (6 Bulan Terakhir)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Perbandingan pemasukan vs pengeluaran kas</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.financeTrend || []}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `Rp${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc' }}
                  formatter={(val) => formatRupiah(val)}
                />
                <Area type="monotone" dataKey="Pemasukan" stroke="#10b981" strokeWidth={2} fill="url(#incomeGrad)" />
                <Area type="monotone" dataKey="Pengeluaran" stroke="#ef4444" strokeWidth={2} fill="url(#expenseGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Inventory Condition Donut Chart (1 column) */}
        <div className="glass-card p-5 border border-white/10 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Boxes className="w-4 h-4 text-indigo-400" />
              Kondisi Inventaris
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Sebaran kelayakan seluruh unit barang</p>
          </div>

          <div className="h-48 w-full my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.inventoryCondition || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(charts.inventoryCondition || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-around text-xs pt-2 border-t border-white/10">
            {(charts.inventoryCondition || []).map((c, i) => (
              <div key={c.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
                <span className="text-slate-400">{c.name}:</span>
                <span className="font-bold text-white">{c.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tables Row: Pending Approvals & Activity Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Loan Approvals */}
        <div className="glass-card p-5 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <HandCoins className="w-4 h-4 text-amber-400" />
              Pengajuan Peminjaman Terbaru
            </h3>
          </div>

          {pendingLoans.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">Tidak ada pengajuan peminjaman yang tertunda.</p>
          ) : (
            <div className="space-y-3">
              {pendingLoans.map((loan) => (
                <div
                  key={loan.id}
                  className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-white">{loan.loanCode}</span>
                      <StatusBadge status={loan.status} />
                    </div>
                    <p className="text-slate-300 font-medium">Peminjam: {loan.borrowerName}</p>
                    <p className="text-[11px] text-slate-500">
                      Tgl Pinjam: {formatDate(loan.startDate)} s/d {formatDate(loan.endDate)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Activity Log */}
        <div className="glass-card p-5 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              Aktivitas Sistem Terbaru
            </h3>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {recentActivities.map((log) => (
              <div
                key={log.id}
                className="p-2.5 rounded-xl bg-slate-900/40 border border-white/5 text-xs flex items-start gap-2.5"
              >
                <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{log.details}</p>
                  <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500">
                    <span>Oleh: {log.user?.username || 'Sistem'}</span>
                    <span>•</span>
                    <span>{new Date(log.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal Reset Data Operasional */}
      <ResetDataModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onResetSuccess={() => {
          // reload dashboard stats
          window.location.reload();
        }}
      />
    </div>
  );
};

