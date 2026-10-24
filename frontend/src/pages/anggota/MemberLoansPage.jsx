import React, { useState, useEffect } from 'react';
import {
  HandCoins,
  Calendar,
  Clock,
  Printer,
  CheckCircle,
  AlertCircle,
  XCircle,
  PackageCheck,
  Search,
  Plus,
  Trash2,
  Camera,
  Image,
  Building2,
  FileText,
  RotateCcw,
  Eye,
  X,
  Sparkles,
  Boxes,
  MapPin,
  Filter,
  Info,
  Check,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { StatusBadge } from '../../components/ui/StatusBadge.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { LoanPhotoProofModal } from '../../components/loans/LoanPhotoProofModal.jsx';
import { LoanPrintDocumentsModal } from '../../components/loans/LoanPrintDocumentsModal.jsx';
import { formatDate, getImageUrl } from '../../lib/utils.js';
import { useAuthStore } from '../../store/authStore.js';
import api from '../../api/axios.js';

export const MemberLoansPage = () => {
  const { user } = useAuthStore();

  // Active view: 'catalog' (Katalog Barang) | 'history' (Riwayat Peminjaman)
  const [activeTab, setActiveTab] = useState('catalog');

  // Loans State
  const [loans, setLoans] = useState([]);
  const [loadingLoans, setLoadingLoans] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');

  // Catalog State
  const [catalogItems, setCatalogItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('');
  const [selectedSource, setSelectedSource] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);

  // Modals
  const [isNewLoanModalOpen, setIsNewLoanModalOpen] = useState(false);
  const [selectedItemDetail, setSelectedItemDetail] = useState(null);
  const [isPhotoProofModalOpen, setIsPhotoProofModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [selectedLoanForPrint, setSelectedLoanForPrint] = useState(null);
  const [selectedLoanForReturn, setSelectedLoanForReturn] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State for New Loan (supports multi-item)
  const [newLoanForm, setNewLoanForm] = useState({
    borrowerName: user?.member?.fullName || user?.username || '',
    borrowerEmail: user?.email || '',
    borrowerPhone: user?.member?.phone || '',
    items: [{ inventoryItemId: '', quantity: 1, notes: '' }],
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    purpose: '',
    notes: '',
  });

  // Fetch Member Loans
  const fetchMyLoans = async () => {
    try {
      setLoadingLoans(true);
      const params = {
        limit: 50,
        status: selectedStatus || undefined,
      };
      const res = await api.get('/loan-requests/me', { params });
      setLoans(res.data.data || []);
    } catch (err) {
      console.error('Gagal mengambil riwayat peminjaman:', err);
    } finally {
      setLoadingLoans(false);
    }
  };

  // Fetch Catalog Items
  const fetchCatalog = async () => {
    try {
      setLoadingCatalog(true);
      const params = {
        limit: 100,
        search: search || undefined,
        categoryId: selectedCategory || undefined,
        condition: selectedCondition || undefined,
        source: selectedSource || undefined,
        availableOnly: availableOnly ? true : undefined,
      };
      const res = await api.get('/inventory', { params });
      setCatalogItems(res.data.data || []);
    } catch (err) {
      console.error('Gagal memuat katalog barang:', err);
    } finally {
      setLoadingCatalog(false);
    }
  };

  // Fetch Categories
  const fetchCategories = async () => {
    try {
      const res = await api.get('/settings/categories?type=INVENTORY');
      setCategories(res.data.data || []);
    } catch (err) {
      console.error('Gagal memuat kategori:', err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCatalog();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, selectedCategory, selectedCondition, selectedSource, availableOnly]);

  useEffect(() => {
    if (activeTab === 'history') {
      fetchMyLoans();
    }
  }, [activeTab, selectedStatus]);

  // Open New Loan modal directly or from a specific item card
  const handleOpenNewLoan = (preselectedItem = null) => {
    setNewLoanForm({
      borrowerName: user?.member?.fullName || user?.username || '',
      borrowerEmail: user?.email || '',
      borrowerPhone: user?.member?.phone || '',
      items: [
        {
          inventoryItemId: preselectedItem ? String(preselectedItem.id) : '',
          quantity: 1,
          notes: '',
        },
      ],
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      purpose: '',
      notes: '',
    });
    setIsNewLoanModalOpen(true);
  };

  // Add another item row in borrowing form
  const handleAddItemRow = () => {
    setNewLoanForm((prev) => ({
      ...prev,
      items: [...prev.items, { inventoryItemId: '', quantity: 1, notes: '' }],
    }));
  };

  // Remove an item row
  const handleRemoveItemRow = (index) => {
    if (newLoanForm.items.length <= 1) return;
    setNewLoanForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  // Update specific item in array
  const handleItemChange = (index, field, value) => {
    setNewLoanForm((prev) => {
      const updated = [...prev.items];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, items: updated };
    });
  };

  // Submit Loan Request
  const handleSubmitNewLoan = async (e) => {
    e.preventDefault();

    // Validasi barang
    for (const item of newLoanForm.items) {
      if (!item.inventoryItemId) {
        alert('Mohon pilih barang yang ingin dipinjam pada semua baris formulir.');
        return;
      }
      const chosenItem = catalogItems.find((i) => i.id === parseInt(item.inventoryItemId));
      if (chosenItem && item.quantity > chosenItem.availableQuantity) {
        alert(
          `Jumlah pinjam '${chosenItem.name}' (${item.quantity}) melebihi stok siap pakai (${chosenItem.availableQuantity} unit)`
        );
        return;
      }
    }

    try {
      setIsSubmitting(true);
      await api.post('/loan-requests', {
        items: newLoanForm.items.map((i) => ({
          inventoryItemId: parseInt(i.inventoryItemId),
          quantity: parseInt(i.quantity) || 1,
          notes: i.notes || '',
        })),
        startDate: newLoanForm.startDate,
        endDate: newLoanForm.endDate,
        purpose: newLoanForm.purpose,
      });

      setIsNewLoanModalOpen(false);
      fetchCatalog();
      if (activeTab === 'history') {
        fetchMyLoans();
      } else {
        setActiveTab('history');
        fetchMyLoans();
      }
      alert('Pengajuan peminjaman barang berhasil diajukan! Menunggu persetujuan admin logistik.');
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mengajukan peminjaman');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Return with Photo modal
  const handleOpenReturnModal = (loan) => {
    setSelectedLoanForReturn(loan);
    setIsPhotoProofModalOpen(true);
  };

  // Confirm Return with Photo upload
  const handleConfirmReturn = async ({ photoFile, notes }) => {
    if (!selectedLoanForReturn) return;
    try {
      setIsSubmitting(true);
      const formData = new FormData();
      if (photoFile) {
        formData.append('proof', photoFile);
      }
      if (notes) {
        formData.append('adminNotes', notes);
      }

      await api.patch(`/loan-requests/${selectedLoanForReturn.id}/return`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setIsPhotoProofModalOpen(false);
      setSelectedLoanForReturn(null);
      fetchMyLoans();
      fetchCatalog();
      alert('Pengembalian barang berhasil dicatat dengan foto bukti!');
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mengembalikan barang');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenPrintModal = (loan) => {
    setSelectedLoanForPrint(loan);
    setIsPrintModalOpen(true);
  };

  const handleDownloadReceipt = async (id, loanCode) => {
    try {
      const response = await api.get(`/loans/${id}/receipt`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Bukti_Pinjam_${loanCode}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      alert('Gagal mengunduh surat bukti peminjaman PDF');
    }
  };

  const activeLoansCount = loans.filter((l) => l.status === 'BORROWED' || l.status === 'APPROVED').length;
  const pendingLoansCount = loans.filter((l) => l.status === 'PENDING').length;

  return (
    <div className="space-y-4 max-w-full">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg md:text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <HandCoins className="w-5 h-5 text-[#a31538]" />
            Katalog & Peminjaman Logistik
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Lihat visual foto barang inventaris, cek ketersediaan stok fisik secara real-time, dan ajukan peminjaman aman.
          </p>
          <div className="inline-flex items-center gap-1.5 mt-1.5 px-2.5 py-0.5 rounded-full bg-[#800020]/15 border border-[#800020]/30 text-[10px] font-bold text-rose-200">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Sub Tema: Haul ke-5 Al-Maghfurlah K.H. Moch. Djamaluddin Achmad & Rojabiyyah 2026</span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start lg:self-auto">
          <button
            onClick={() => handleOpenNewLoan()}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#800020] to-[#5a0016] text-white hover:brightness-110 transition-all text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#800020]/30"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ajukan Peminjaman</span>
          </button>
        </div>
      </div>

      {/* Main Switcher: Katalog Barang vs Riwayat Peminjaman */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/90 border border-white/10 w-fit">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'catalog'
              ? 'bg-gradient-to-r from-[#800020] to-[#5a0016] text-white shadow-md shadow-[#800020]/40'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Boxes className="w-3.5 h-3.5" />
          <span>Katalog Barang Siap Pinjam</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white font-mono">
            {catalogItems.length}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab('history');
            fetchMyLoans();
          }}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'history'
              ? 'bg-gradient-to-r from-[#800020] to-[#5a0016] text-white shadow-md shadow-[#800020]/40'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Riwayat Peminjaman Saya</span>
          {(activeLoansCount > 0 || pendingLoansCount > 0) && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-slate-950 font-bold">
              {activeLoansCount + pendingLoansCount}
            </span>
          )}
        </button>
      </div>

      {/* ============================================================ */}
      {/* VIEW 1: KATALOG BARANG (Persis Foto Lampiran Pengguna) */}
      {/* ============================================================ */}
      {activeTab === 'catalog' && (
        <div className="space-y-4">
          {/* Filter Bar (Search, Category, Condition, Source) */}
          <div className="glass-card p-3 border border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Cari nama, kode barang, lokasi simpan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full glass-input pl-8 py-2 text-xs"
              />
            </div>

            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full glass-input py-2 text-xs"
              >
                <option value="">Semua Kategori</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={selectedCondition}
                onChange={(e) => setSelectedCondition(e.target.value)}
                className="w-full glass-input py-2 text-xs"
              >
                <option value="">Semua Kondisi Fisik</option>
                <option value="GOOD" className="bg-slate-900 text-white">
                  ● Kondisi Baik
                </option>
                <option value="SLIGHTLY_DAMAGED" className="bg-slate-900 text-white">
                  ● Rusak Ringan
                </option>
                <option value="DAMAGED" className="bg-slate-900 text-white">
                  ● Rusak Berat
                </option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                className="w-full glass-input py-2 text-xs flex-1"
              >
                <option value="">Semua Sumber Kepemilikan</option>
                <option value="INTERNAL" className="bg-slate-900 text-white">
                  Milik Rojabiyyah
                </option>
                <option value="LOAN_FROM_INSTITUTION" className="bg-slate-900 text-white">
                  Pinjaman Lembaga Mitra
                </option>
              </select>
            </div>
          </div>

          {/* Catalog Grid Cards */}
          {loadingCatalog ? (
            <div className="py-16 text-center text-slate-400">
              <div className="inline-block w-7 h-7 border-2 border-[#800020] border-t-transparent rounded-full animate-spin mb-2" />
              <p className="text-xs">Memuat katalog barang inventaris...</p>
            </div>
          ) : catalogItems.length === 0 ? (
            <EmptyState
              title="Barang Tidak Ditemukan"
              message="Tidak ada barang inventaris yang sesuai dengan filter pencarian Anda."
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {catalogItems.map((item) => {
                const isReady = item.availableQuantity > 0;
                const photoSrc = getImageUrl(item.photo);

                return (
                  <div
                    key={item.id}
                    className="glass-card border border-white/10 overflow-hidden flex flex-col justify-between hover:border-[#800020]/60 transition-all duration-300 shadow-glass group"
                  >
                    <div>
                      {/* Image Preview Box (Top Bar with Code & Condition Badge) */}
                      <div className="w-full h-32 bg-slate-900/90 relative overflow-hidden flex items-center justify-center border-b border-white/10">
                        {photoSrc ? (
                          <img
                            src={photoSrc}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-slate-600 gap-1 p-3 text-center">
                            <Boxes className="w-8 h-8 text-slate-600/80 group-hover:text-[#a31538] transition-colors" />
                            <span className="text-[9px] text-slate-500 font-mono">Belum ada foto</span>
                          </div>
                        )}

                        {/* Top-Left Code Badge */}
                        <div className="absolute top-2 left-2">
                          <span className="text-[9px] font-bold font-mono px-1.5 py-0.5 rounded-md bg-slate-950/85 text-cyan-400 backdrop-blur-md border border-white/15 shadow-sm">
                            {item.code}
                          </span>
                        </div>

                        {/* Top-Right Condition Badge */}
                        <div className="absolute top-2 right-2 scale-90 origin-top-right">
                          <StatusBadge status={item.condition} />
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-3 space-y-2 text-xs">
                        {/* Category & Ownership Source */}
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[9px] font-bold text-rose-300 uppercase tracking-wider truncate">
                            {item.category?.name || 'LOGISTIK'}
                          </span>

                          {item.source === 'LOAN_FROM_INSTITUTION' ? (
                            <span className="text-[8px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-semibold flex items-center gap-1 flex-shrink-0">
                              <Building2 className="w-2.5 h-2.5" />
                              Pinjaman Lembaga
                            </span>
                          ) : (
                            <span className="text-[8px] px-1.5 py-0.2 rounded bg-[#800020]/20 text-rose-200 border border-[#800020]/40 font-semibold flex-shrink-0">
                              Milik Rojabiyyah
                            </span>
                          )}
                        </div>

                        {/* Item Name */}
                        <h3 className="font-bold text-white text-xs line-clamp-1 group-hover:text-rose-300 transition-colors">
                          {item.name}
                        </h3>

                        {/* Location */}
                        <div className="flex items-center gap-1 text-[10px] text-slate-400">
                          <MapPin className="w-3 h-3 text-slate-500 flex-shrink-0" />
                          <span className="truncate">{item.location || 'Gudang Utama Rojabiyyah'}</span>
                        </div>

                        {/* Physical Stock Counter */}
                        <div className="pt-1.5 flex items-center justify-between border-t border-white/5 text-[10px]">
                          <span className="text-slate-400">Total Stok Fisik:</span>
                          <span className="font-bold text-white px-1.5 py-0.2 rounded bg-slate-800 border border-white/10 font-mono">
                            {item.quantity} Unit
                          </span>
                        </div>

                        {/* Ready Stock Counter */}
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-slate-400">Stok Siap Pakai:</span>
                          <span
                            className={`font-bold font-mono px-1.5 py-0.2 rounded ${
                              isReady
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            {item.availableQuantity} Unit
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons: Lihat Rincian + Ajukan Pinjam */}
                    <div className="p-3 pt-0">
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedItemDetail(item)}
                          className="w-full py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 text-slate-300 text-[10px] font-semibold flex items-center justify-center gap-1 transition-all shadow-sm"
                        >
                          <Eye className="w-3 h-3 text-slate-400" />
                          <span>Rincian</span>
                        </button>

                        <button
                          type="button"
                          disabled={!isReady}
                          onClick={() => handleOpenNewLoan(item)}
                          className={`w-full py-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-all shadow-sm ${
                            isReady
                              ? 'bg-gradient-to-r from-[#800020] to-[#5a0016] text-white hover:brightness-110 shadow-[#800020]/20'
                              : 'bg-slate-800 text-slate-500 border border-white/5 cursor-not-allowed'
                          }`}
                        >
                          <HandCoins className="w-3 h-3" />
                          <span>{isReady ? 'Pinjam Ini' : 'Habis'}</span>
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

      {/* ============================================================ */}
      {/* VIEW 2: RIWAYAT PEMINJAMAN SAYA */}
      {/* ============================================================ */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/10">
            {[
              { key: '', label: 'Semua Status' },
              { key: 'PENDING', label: 'Menunggu Persetujuan' },
              { key: 'APPROVED', label: 'Disetujui' },
              { key: 'BORROWED', label: 'Sedang Dipinjam' },
              { key: 'RETURNED', label: 'Dikembalikan' },
              { key: 'REJECTED', label: 'Ditolak' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSelectedStatus(tab.key)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
                  selectedStatus === tab.key
                    ? 'bg-gradient-to-r from-[#800020] to-[#5a0016] text-white shadow-md shadow-[#800020]/30 border border-rose-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Loans List */}
          {loadingLoans ? (
            <div className="py-20 text-center text-slate-400">
              <div className="inline-block w-8 h-8 border-2 border-[#800020] border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-xs">Memuat data peminjaman saya...</p>
            </div>
          ) : loans.length === 0 ? (
            <EmptyState
              title="Belum Ada Peminjaman"
              message="Anda belum memiliki pengajuan peminjaman barang pada kategori status ini."
            />
          ) : (
            <div className="space-y-4">
              {loans.map((loan) => (
                <div
                  key={loan.id}
                  className="glass-card p-5 border border-white/10 hover:border-white/20 transition-all shadow-glass space-y-4"
                >
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/5">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-sm text-cyan-400">{loan.loanCode}</span>
                      <StatusBadge status={loan.status} />
                      {loan.status === 'BORROWED' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20 animate-pulse">
                          Wajib Dikembalikan
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>Diajukan pada {formatDate(loan.createdAt, true)}</span>
                    </div>
                  </div>

                  {/* Items borrowed with visual preview */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-[11px] text-slate-400 font-semibold block mb-2">
                        Daftar Barang yang Dipinjam ({loan.loanItems?.length || 0} Barang):
                      </span>
                      <div className="space-y-2">
                        {loan.loanItems?.map((li) => {
                          const itemImg = getImageUrl(li.inventoryItem?.photo);
                          return (
                            <div
                              key={li.id}
                              className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between gap-3"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 rounded-lg bg-slate-800 border border-white/10 overflow-hidden flex items-center justify-center flex-shrink-0">
                                  {itemImg ? (
                                    <img src={itemImg} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    <Boxes className="w-5 h-5 text-slate-600" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-bold text-white text-xs truncate">{li.inventoryItem?.name}</p>
                                  <div className="flex items-center gap-2 mt-0.5 text-[10px]">
                                    <span className="text-cyan-400 font-mono">{li.inventoryItem?.code}</span>
                                    {li.inventoryItem?.source === 'LOAN_FROM_INSTITUTION' ? (
                                      <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-semibold">
                                        Pinjaman Lembaga
                                      </span>
                                    ) : (
                                      <span className="text-[9px] px-1 py-0.2 rounded bg-[#800020]/20 text-rose-200 border border-[#800020]/30 font-semibold">
                                        Rojabiyyah
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <span className="font-bold text-cyan-400 px-2.5 py-1 rounded bg-cyan-500/10 border border-cyan-500/20 font-mono flex-shrink-0">
                                {li.quantity} Unit
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <div>
                        <span className="text-[11px] text-slate-400 font-semibold block">Keperluan:</span>
                        <p className="text-white font-medium mt-0.5 uppercase">{loan.purpose}</p>
                      </div>

                      <div>
                        <span className="text-[11px] text-slate-400 font-semibold block">Periode Tanggal Pinjam:</span>
                        <p className="text-slate-300 flex items-center gap-1.5 mt-0.5">
                          <Calendar className="w-3.5 h-3.5 text-amber-400" />
                          <span>
                            {formatDate(loan.startDate)} s/d {formatDate(loan.endDate)}
                          </span>
                        </p>
                      </div>

                      {loan.returnDate && (
                        <div>
                          <span className="text-[11px] text-slate-400 font-semibold block">Tanggal Pengembalian:</span>
                          <p className="text-emerald-400 font-medium mt-0.5">{formatDate(loan.returnDate, true)}</p>
                        </div>
                      )}

                      {loan.adminNotes && (
                        <div className="p-2.5 rounded-lg bg-slate-900/80 border border-white/10 text-[11px]">
                          <span className="font-bold text-amber-300 block mb-0.5">Catatan Petugas Admin:</span>
                          <p className="text-slate-300">{loan.adminNotes}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Photo Proofs Section */}
                  {(loan.borrowProof || loan.returnProof) && (
                    <div className="pt-2 border-t border-white/5">
                      <span className="text-[11px] text-slate-400 font-semibold block mb-2 flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-cyan-400" />
                        Dokumentasi Bukti Foto:
                      </span>
                      <div className="flex flex-wrap items-center gap-3">
                        {loan.borrowProof && (
                          <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/90 border border-white/10">
                            <img
                              src={getImageUrl(loan.borrowProof)}
                              alt="Bukti Serah Terima"
                              className="w-12 h-12 object-cover rounded-lg border border-white/10 cursor-pointer hover:opacity-80 transition-all"
                              onClick={() => setPreviewImage(getImageUrl(loan.borrowProof))}
                            />
                            <div className="text-[10px]">
                              <span className="font-bold text-cyan-400 block">Bukti Serah Terima</span>
                              <button
                                type="button"
                                onClick={() => setPreviewImage(getImageUrl(loan.borrowProof))}
                                className="text-slate-400 hover:text-white underline mt-0.5 flex items-center gap-1"
                              >
                                <Eye className="w-3 h-3" /> Lihat Foto
                              </button>
                            </div>
                          </div>
                        )}

                        {loan.returnProof && (
                          <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/90 border border-white/10">
                            <img
                              src={getImageUrl(loan.returnProof)}
                              alt="Bukti Pengembalian"
                              className="w-12 h-12 object-cover rounded-lg border border-white/10 cursor-pointer hover:opacity-80 transition-all"
                              onClick={() => setPreviewImage(getImageUrl(loan.returnProof))}
                            />
                            <div className="text-[10px]">
                              <span className="font-bold text-emerald-400 block">Bukti Pengembalian</span>
                              <button
                                type="button"
                                onClick={() => setPreviewImage(getImageUrl(loan.returnProof))}
                                className="text-slate-400 hover:text-white underline mt-0.5 flex items-center gap-1"
                              >
                                <Eye className="w-3 h-3" /> Lihat Foto
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-white/5">
                    <div>
                      {(loan.status === 'APPROVED' || loan.status === 'BORROWED') && (
                        <button
                          onClick={() => handleOpenReturnModal(loan)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-900/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                          <RotateCcw className="w-4 h-4" />
                          <span>Kembalikan Barang (Unggah Foto / Jepret Kamera)</span>
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenPrintModal(loan)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                      >
                        <Printer className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Cetak Bukti</span>
                      </button>

                      <button
                        onClick={() => handleDownloadReceipt(loan.id, loan.loanCode)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                      >
                        <FileText className="w-3.5 h-3.5 text-cyan-400" />
                        <span>PDF</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: DETAIL BARANG INVENTARIS */}
      {/* ============================================================ */}
      <Modal
        isOpen={Boolean(selectedItemDetail)}
        onClose={() => setSelectedItemDetail(null)}
        title="Rincian Barang Inventaris"
        maxWidth="max-w-xl"
      >
        {selectedItemDetail && (
          <div className="space-y-4 text-xs">
            {/* Foto preview */}
            <div className="w-full h-56 rounded-2xl bg-slate-900/90 border border-white/10 overflow-hidden flex items-center justify-center relative">
              {getImageUrl(selectedItemDetail.photo) ? (
                <img
                  src={getImageUrl(selectedItemDetail.photo)}
                  alt={selectedItemDetail.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center text-slate-600">
                  <Boxes className="w-16 h-16 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">Foto fisik barang belum diunggah</p>
                </div>
              )}
              <div className="absolute top-3 left-3">
                <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-slate-950/80 text-cyan-400 border border-white/15">
                  {selectedItemDetail.code}
                </span>
              </div>
              <div className="absolute top-3 right-3">
                <StatusBadge status={selectedItemDetail.condition} />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">
                  {selectedItemDetail.category?.name || 'LOGISTIK'}
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-[10px] text-slate-400">
                  {selectedItemDetail.source === 'LOAN_FROM_INSTITUTION' ? 'Pinjaman Lembaga Mitra' : 'Milik Rojabiyyah'}
                </span>
              </div>
              <h3 className="text-base font-bold text-white">{selectedItemDetail.name}</h3>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-900/60 border border-white/10">
              <div>
                <span className="text-slate-400 block text-[11px]">Total Stok Fisik:</span>
                <span className="font-bold text-white font-mono text-sm">{selectedItemDetail.quantity} Unit</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Stok Siap Pakai:</span>
                <span
                  className={`font-bold font-mono text-sm ${
                    selectedItemDetail.availableQuantity > 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {selectedItemDetail.availableQuantity} Unit
                </span>
              </div>
              <div className="col-span-2 pt-1 border-t border-white/5">
                <span className="text-slate-400 block text-[11px]">Lokasi Penyimpanan:</span>
                <span className="text-white flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  {selectedItemDetail.location || 'Gudang Utama'}
                </span>
              </div>
            </div>

            {selectedItemDetail.notes && (
              <div className="p-3 rounded-xl bg-slate-900/40 border border-white/5">
                <span className="text-slate-400 font-semibold block mb-1">Catatan / Kelengkapan Unit:</span>
                <p className="text-slate-300 leading-relaxed">{selectedItemDetail.notes}</p>
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setSelectedItemDetail(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
              >
                Tutup
              </button>
              {selectedItemDetail.availableQuantity > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    const item = selectedItemDetail;
                    setSelectedItemDetail(null);
                    handleOpenNewLoan(item);
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#800020] to-[#5a0016] text-white hover:brightness-110 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#800020]/30"
                >
                  <HandCoins className="w-3.5 h-3.5" />
                  <span>Ajukan Peminjaman Barang Ini</span>
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* ============================================================ */}
      {/* MODAL: FORM PENGAJUAN PEMINJAMAN (DENGAN VISUAL FOTO BARANG) */}
      {/* ============================================================ */}
      <Modal
        isOpen={isNewLoanModalOpen}
        onClose={() => setIsNewLoanModalOpen(false)}
        title="Formulir Pengajuan Peminjaman Barang"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmitNewLoan} className="space-y-4 text-xs">
          {/* Identitas Peminjam */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-slate-900/80 border border-white/10">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Nama Peminjam *</label>
              <input
                type="text"
                value={newLoanForm.borrowerName}
                onChange={(e) => setNewLoanForm({ ...newLoanForm, borrowerName: e.target.value })}
                className="w-full glass-input text-xs"
                required
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Email / No. WhatsApp</label>
              <input
                type="text"
                value={newLoanForm.borrowerEmail || newLoanForm.borrowerPhone}
                onChange={(e) => setNewLoanForm({ ...newLoanForm, borrowerEmail: e.target.value })}
                className="w-full glass-input text-xs"
                placeholder="contoh: 08123456789 atau nama@mail.com"
              />
            </div>
          </div>

          {/* Sub Tema Informasi Acara */}
          <div className="p-2.5 rounded-xl bg-[#800020]/15 border border-[#800020]/30 text-[11px] text-rose-200 flex items-center justify-between">
            <span className="font-semibold text-rose-300">Sub Tema Acara:</span>
            <span className="font-bold">Haul ke-5 Al-Maghfurlah K.H. Moch. Djamaluddin Achmad & Rojabiyyah 2026</span>
          </div>

          {/* Multi-Item Selector Section (Dengan Foto Barang) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-slate-300 font-bold">
                Daftar Barang yang Dipinjam (Bisa Lebih Dari 1 Barang) *
              </label>
              <button
                type="button"
                onClick={handleAddItemRow}
                className="px-2.5 py-1 rounded-lg bg-[#800020]/30 text-rose-200 border border-[#800020]/50 hover:bg-[#800020]/50 text-[11px] font-bold flex items-center gap-1 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Tambah Barang Lain</span>
              </button>
            </div>

            {catalogItems.length === 0 ? (
              <p className="text-amber-400 py-2">Belum ada barang inventaris yang siap dipinjam.</p>
            ) : (
              <div className="space-y-2.5">
                {newLoanForm.items.map((row, idx) => {
                  const chosenItem = catalogItems.find((i) => i.id === parseInt(row.inventoryItemId));
                  const chosenPhoto = chosenItem ? getImageUrl(chosenItem.photo) : null;

                  return (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-slate-900/70 border border-white/10 space-y-2.5 relative"
                    >
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pb-1 border-b border-white/5">
                        <span className="font-bold text-amber-400">Barang #{idx + 1}</span>
                        {newLoanForm.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItemRow(idx)}
                            className="text-rose-400 hover:text-rose-300 flex items-center gap-1 text-[10px]"
                          >
                            <Trash2 className="w-3 h-3" /> Hapus
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                        {/* Select item */}
                        <div className="sm:col-span-8">
                          <label className="block text-slate-400 text-[10px] mb-0.5">Pilih Alat / Barang *</label>
                          <select
                            value={row.inventoryItemId}
                            onChange={(e) => handleItemChange(idx, 'inventoryItemId', e.target.value)}
                            className="w-full glass-input text-xs"
                            required
                          >
                            <option value="">-- Pilih Barang dari Katalog --</option>
                            {catalogItems.map((inv) => (
                              <option key={inv.id} value={inv.id} className="bg-slate-900 text-white">
                                {inv.name} (Kode: {inv.code}) • Tersedia: {inv.availableQuantity} Unit
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Quantity */}
                        <div className="sm:col-span-4">
                          <label className="block text-slate-400 text-[10px] mb-0.5">Jumlah Unit *</label>
                          <input
                            type="number"
                            min="1"
                            max={chosenItem ? chosenItem.availableQuantity : 99}
                            value={row.quantity}
                            onChange={(e) =>
                              handleItemChange(idx, 'quantity', Math.max(1, parseInt(e.target.value) || 1))
                            }
                            className="w-full glass-input text-xs"
                            required
                          />
                        </div>
                      </div>

                      {/* Visual Item Preview Box (Kelihatan Gambar & Detail Barang) */}
                      {chosenItem && (
                        <div className="p-2.5 rounded-lg bg-slate-950/80 border border-white/10 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-slate-900 border border-white/15 overflow-hidden flex items-center justify-center flex-shrink-0">
                              {chosenPhoto ? (
                                <img src={chosenPhoto} alt={chosenItem.name} className="w-full h-full object-cover" />
                              ) : (
                                <Boxes className="w-6 h-6 text-slate-600" />
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-white text-xs">{chosenItem.name}</p>
                              <div className="flex items-center gap-2 mt-0.5 text-[10px]">
                                <span className="font-mono text-cyan-400">{chosenItem.code}</span>
                                <span className="text-slate-500">•</span>
                                <span className="text-slate-400">{chosenItem.category?.name || 'Inventaris'}</span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right flex-shrink-0">
                            <span className="text-[10px] text-slate-400 block">Stok Siap:</span>
                            <span className="font-bold font-mono text-emerald-400">
                              {chosenItem.availableQuantity} Unit
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Date Picker (Tanggal Pinjam & Rencana Kembali) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Tanggal Mulai Pinjam *</label>
              <input
                type="date"
                value={newLoanForm.startDate}
                onChange={(e) => setNewLoanForm({ ...newLoanForm, startDate: e.target.value })}
                className="w-full glass-input text-xs"
                required
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Rencana Tanggal Kembali *</label>
              <input
                type="date"
                value={newLoanForm.endDate}
                onChange={(e) => setNewLoanForm({ ...newLoanForm, endDate: e.target.value })}
                className="w-full glass-input text-xs"
                required
              />
            </div>
          </div>

          {/* Keperluan */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Keperluan Peminjaman *</label>
            <input
              type="text"
              placeholder="Contoh: DOKUMENTASI MAULID NABI / LIPUTAN HAUL KE-5"
              value={newLoanForm.purpose}
              onChange={(e) => setNewLoanForm({ ...newLoanForm, purpose: e.target.value })}
              className="w-full glass-input uppercase text-xs"
              required
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Catatan Tambahan (Opsional)</label>
            <textarea
              rows="2"
              placeholder="Catatan aksesoris tambahan yang diperlukan..."
              value={newLoanForm.notes}
              onChange={(e) => setNewLoanForm({ ...newLoanForm, notes: e.target.value })}
              className="w-full glass-input text-xs"
            />
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsNewLoanModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || catalogItems.length === 0}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#800020] to-[#5a0016] text-white hover:brightness-110 text-xs font-bold shadow-lg shadow-[#800020]/30 disabled:opacity-50"
            >
              {isSubmitting ? 'Mengirim Pengajuan...' : 'Kirim Pengajuan Peminjaman'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Photo Proof for Return */}
      <LoanPhotoProofModal
        isOpen={isPhotoProofModalOpen}
        onClose={() => {
          setIsPhotoProofModalOpen(false);
          setSelectedLoanForReturn(null);
        }}
        title={`Bukti Pengembalian Barang - ${selectedLoanForReturn?.loanCode || ''}`}
        subtitle="Wajib menyertakan bukti: ambil foto langsung di tempat via kamera HP atau unggah file foto fisik barang."
        onConfirm={handleConfirmReturn}
        isSubmitting={isSubmitting}
      />

      {/* Modal: Print Documents */}
      <LoanPrintDocumentsModal
        isOpen={isPrintModalOpen}
        onClose={() => {
          setIsPrintModalOpen(false);
          setSelectedLoanForPrint(null);
        }}
        loan={selectedLoanForPrint}
      />

      {/* Modal: Preview Image Full Size */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
          <div className="relative max-w-2xl w-full bg-slate-900 border border-white/15 rounded-2xl p-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <span className="font-bold text-white text-xs flex items-center gap-1.5">
                <Image className="w-4 h-4 text-cyan-400" />
                Preview Foto Bukti Peminjaman
              </span>
              <button
                onClick={() => setPreviewImage(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-center">
              <img
                src={previewImage}
                alt="Preview Bukti"
                className="max-h-[70vh] mx-auto rounded-xl object-contain shadow-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberLoansPage;
