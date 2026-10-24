import React, { useState, useEffect } from 'react';
import {
  Wallet,
  Plus,
  Search,
  Filter,
  Download,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  FileText,
  Trash2,
  Edit2,
  TrendingUp,
  Paperclip,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { StatCard } from '../../components/ui/StatCard.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { formatRupiah, formatDate } from '../../lib/utils.js';
import api from '../../api/axios.js';

export const AdminFinancePage = () => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, balance: 0 });
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });

  // Filters
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrx, setEditingTrx] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    type: 'INCOME',
    categoryId: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
  });
  const [proofFile, setProofFile] = useState(null);

  const fetchTransactions = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 15,
        search: search || undefined,
        type: selectedType || undefined,
        categoryId: selectedCategory || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      };

      const [trxRes, sumRes] = await Promise.all([
        api.get('/transactions', { params }),
        api.get('/transactions/summary', { params }),
      ]);

      setTransactions(trxRes.data.data);
      setPagination(trxRes.data.meta);
      setSummary(sumRes.data.data);
    } catch (err) {
      console.error('Gagal mengambil data keuangan:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/settings/categories');
      setCategories(res.data.data.filter((c) => c.type.startsWith('TRANSACTION')));
    } catch (err) {
      console.error('Gagal memuat kategori kas:', err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTransactions(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, selectedType, selectedCategory, startDate, endDate]);

  const handleOpenModal = (trx = null) => {
    if (trx) {
      setEditingTrx(trx);
      setFormData({
        type: trx.type,
        categoryId: String(trx.categoryId),
        amount: String(trx.amount),
        date: trx.date.split('T')[0],
        description: trx.description,
      });
    } else {
      setEditingTrx(null);
      const defaultCat = categories.find((c) => c.type === 'TRANSACTION_INCOME');
      setFormData({
        type: 'INCOME',
        categoryId: defaultCat?.id ? String(defaultCat.id) : '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
      });
    }
    setProofFile(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const submitData = new FormData();
      submitData.append('type', formData.type);
      submitData.append('categoryId', formData.categoryId);
      submitData.append('amount', formData.amount);
      submitData.append('date', formData.date);
      submitData.append('description', formData.description);

      if (proofFile) {
        submitData.append('proofFile', proofFile);
      }

      if (editingTrx) {
        await api.put(`/transactions/${editingTrx.id}`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await api.post('/transactions', submitData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      setIsModalOpen(false);
      fetchTransactions(pagination.page);
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan transaksi kas');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/transactions/${id}`);
      setDeleteConfirmId(null);
      fetchTransactions(pagination.page);
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus transaksi');
    }
  };

  const handleExport = async (format = 'excel') => {
    try {
      const response = await api.get(`/transactions/export?format=${format}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Rekap_Keuangan_Rojabiyyaah_${Date.now()}.${format === 'pdf' ? 'pdf' : 'xlsx'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      alert('Gagal mengekspor laporan keuangan');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Wallet className="w-6 h-6 text-emerald-400" />
            Rekap Keuangan & Kas Organisasi
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Pencatatan uang masuk, pengeluaran operasional logistik, bukti nota transaksi, dan ringkasan saldo kas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport('excel')}
            className="px-3 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-white/10 text-xs font-semibold flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Excel</span>
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="px-3 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-white/10 text-xs font-semibold flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-4 h-4 text-rose-400" />
            <span>PDF</span>
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2 rounded-xl gradient-btn text-xs font-bold flex items-center gap-2 shadow-glow"
          >
            <Plus className="w-4 h-4" />
            <span>Catat Transaksi</span>
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Pemasukan Kas"
          value={formatRupiah(summary.totalIncome)}
          subtitle="Donasi, infaq, dan iuran kas"
          icon={ArrowUpRight}
          color="emerald"
        />
        <StatCard
          title="Total Pengeluaran Kas"
          value={formatRupiah(summary.totalExpense)}
          subtitle="Operasional dan pemeliharaan alat"
          icon={ArrowDownLeft}
          color="rose"
        />
        <StatCard
          title="Saldo Kas Bersih Saat Ini"
          value={formatRupiah(summary.balance)}
          subtitle="Total kas aktif di bendahara"
          icon={Wallet}
          color="cyan"
        />
      </div>

      {/* Filter Bar */}
      <div className="glass-card p-4 border border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="lg:col-span-2 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Cari kode transaksi, keterangan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full glass-input pl-9 text-xs"
          />
        </div>

        <div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full glass-input text-xs"
          >
            <option value="">Semua Jenis (Masuk & Keluar)</option>
            <option value="INCOME" className="bg-slate-900 text-white">Pemasukan Saja</option>
            <option value="EXPENSE" className="bg-slate-900 text-white">Pengeluaran Saja</option>
          </select>
        </div>

        <div>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full glass-input text-xs"
            title="Dari Tanggal"
          />
        </div>

        <div>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full glass-input text-xs"
            title="Sampai Tanggal"
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="glass-card border border-white/10 overflow-hidden shadow-glass">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900/80 border-b border-white/10 text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Kode & Tanggal</th>
                <th className="py-3.5 px-4">Jenis Transaksi</th>
                <th className="py-3.5 px-4">Kategori</th>
                <th className="py-3.5 px-4">Keterangan</th>
                <th className="py-3.5 px-4 text-right">Nominal (Rp)</th>
                <th className="py-3.5 px-4 text-center">Nota / Bukti</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <div className="inline-block w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-2" />
                    <p>Memuat rekap keuangan...</p>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan="7">
                    <EmptyState
                      title="Belum Ada Transaksi"
                      message="Tidak ada catatan transaksi kas pada rentang tanggal atau filter ini."
                    />
                  </td>
                </tr>
              ) : (
                transactions.map((trx) => (
                  <tr key={trx.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-mono font-bold text-white text-xs">{trx.code}</p>
                      <span className="text-[10px] text-slate-400">{formatDate(trx.date)}</span>
                    </td>
                    <td className="py-3 px-4">
                      {trx.type === 'INCOME' ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md text-[11px]">
                          <ArrowUpRight className="w-3.5 h-3.5" /> Pemasukan
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-md text-[11px]">
                          <ArrowDownLeft className="w-3.5 h-3.5" /> Pengeluaran
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-300">{trx.category?.name}</td>
                    <td className="py-3 px-4 text-slate-300 max-w-xs truncate" title={trx.description}>
                      {trx.description}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`font-mono font-bold text-xs ${
                          trx.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {trx.type === 'INCOME' ? '+ ' : '- '}
                        {formatRupiah(trx.amount)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {trx.proofFile ? (
                        <a
                          href={trx.proofFile.startsWith('http') ? trx.proofFile : `http://localhost:5000${trx.proofFile}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 hover:underline"
                        >
                          <Paperclip className="w-3.5 h-3.5" />
                          <span>Lihat Nota</span>
                        </a>
                      ) : (
                        <span className="text-slate-600 text-[11px]">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenModal(trx)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-white/5"
                          title="Ubah Transaksi"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(trx.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/5"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit Transaction */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTrx ? 'Ubah Catatan Transaksi' : 'Catat Transaksi Keuangan Baru'}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Jenis Transaksi</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full glass-input"
              >
                <option value="INCOME" className="bg-slate-900 text-emerald-400">Pemasukan (+)</option>
                <option value="EXPENSE" className="bg-slate-900 text-rose-400">Pengeluaran (-)</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Kategori Kas</label>
              <select
                required
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full glass-input"
              >
                <option value="">Pilih Kategori</option>
                {categories
                  .filter((c) =>
                    formData.type === 'INCOME'
                      ? c.type === 'TRANSACTION_INCOME'
                      : c.type === 'TRANSACTION_EXPENSE'
                  )
                  .map((c) => (
                    <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                      {c.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Nominal (Rp)</label>
              <input
                type="number"
                min="1000"
                required
                placeholder="misal: 500000"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full glass-input"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Tanggal Transaksi</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full glass-input"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Keterangan / Deskripsi Transaksi</label>
            <textarea
              rows="3"
              required
              placeholder="Rincian peruntukan kas atau nama donatur..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full glass-input"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Foto Bukti Nota / Kwitansi (Opsional)</label>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setProofFile(e.target.files[0])}
              className="w-full glass-input file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:bg-indigo-600 file:text-white"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl gradient-btn font-bold shadow-glow disabled:opacity-50"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Transaksi'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        title="Konfirmasi Hapus Transaksi"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-300">
            Apakah Anda yakin ingin menghapus catatan transaksi keuangan ini? Saldo kas akan dihitung ulang secara otomatis.
          </p>
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
            <button
              onClick={() => setDeleteConfirmId(null)}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white font-semibold"
            >
              Batal
            </button>
            <button
              onClick={() => handleDelete(deleteConfirmId)}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-lg"
            >
              Hapus Sekarang
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

