import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  HandCoins,
  Plus,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  ArrowRightCircle,
  RotateCcw,
  Printer,
  Trash2,
  Eye,
  Calendar,
  User,
  Clock,
  Building,
  Camera,
  FileText,
  Truck,
  QrCode,
  Package,
  Layers,
  Sparkles,
} from 'lucide-react';
import { StatusBadge } from '../../components/ui/StatusBadge.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { formatDate } from '../../lib/utils.js';
import { LoanPrintDocumentsModal } from '../../components/loans/LoanPrintDocumentsModal.jsx';
import api from '../../api/axios.js';

export const AdminLoansPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'institution_loans' ? 'institution_loans' : 'member_loans';
  const [activeSubTab, setActiveSubTab] = useState(initialTab);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'institution_loans' || tab === 'member_loans') {
      setActiveSubTab(tab);
    }
  }, [searchParams]);
  const [loans, setLoans] = useState([]);
  const [inventoryList, setInventoryList] = useState([]);
  const [members, setMembers] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  // Filters
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Modals & Action States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isInstitutionLoanModalOpen, setIsInstitutionLoanModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [targetLoan, setTargetLoan] = useState(null);

  // Printing Modal State
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [selectedLoanForPrint, setSelectedLoanForPrint] = useState(null);

  // View Photo Preview Modal (melihat foto hasil unggahan anggota)
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState(null);

  // New Loan Form (Pinjaman Internal / Anggota) - Multi-Item!
  const [newLoanData, setNewLoanData] = useState({
    borrowerType: 'MEMBER',
    memberId: '',
    borrowerName: '',
    items: [{ inventoryItemId: '', quantity: 1, notes: '' }],
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    purpose: '',
    status: 'APPROVED',
    adminNotes: '',
  });

  // Pinjam dari Lembaga Form
  const [institutionLoanData, setInstitutionLoanData] = useState({
    institutionId: '',
    newInstitutionName: '',
    itemName: '',
    code: '',
    categoryId: '',
    categoryName: 'Peralatan Dokumentasi & Audio Visual',
    quantity: 1,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    location: 'Gudang Utama Rojabiyyah',
    purpose: 'Peminjaman inventaris pendukung dari lembaga mitra untuk kegiatan organisasi',
    notes: '',
  });

  const fetchLoans = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 15,
        search: search || undefined,
        status: selectedStatus || undefined,
        borrowerType: activeSubTab === 'member_loans' ? 'MEMBER' : 'OUTSIDE',
      };
      const res = await api.get('/loans', { params });
      setLoans(res.data.data || []);
      setPagination(res.data.meta);
    } catch (err) {
      console.error('Gagal memuat data peminjaman:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDependencies = async () => {
    try {
      const [invRes, memRes, instRes, catRes] = await Promise.all([
        api.get('/inventory?limit=100'),
        api.get('/members?limit=100'),
        api.get('/institutions'),
        api.get('/settings/categories?type=INVENTORY'),
      ]);
      setInventoryList(invRes.data.data || []);
      setMembers(memRes.data.data || []);
      setInstitutions(instRes.data.data || []);
      setCategories(catRes.data.data || []);
      if (catRes.data.data?.length > 0) {
        setInstitutionLoanData((prev) => ({
          ...prev,
          categoryId: prev.categoryId || String(catRes.data.data[0].id),
        }));
      }
    } catch (err) {
      console.error('Gagal memuat dependensi peminjaman:', err);
    }
  };

  useEffect(() => {
    fetchDependencies();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLoans(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, selectedStatus, activeSubTab]);

  // Handle Approving
  const handleApprove = async (loanId) => {
    try {
      await api.patch(`/loans/${loanId}/approve`, { adminNotes: 'Disetujui oleh Super Admin' });
      fetchLoans(pagination.page);
      fetchDependencies();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyetujui peminjaman');
    }
  };

  // Handle Rejecting
  const handleReject = async (loanId) => {
    const reason = prompt('Masukkan alasan penolakan:');
    if (reason === null) return;
    try {
      await api.patch(`/loans/${loanId}/reject`, { adminNotes: reason || 'Pengajuan ditolak' });
      fetchLoans(pagination.page);
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menolak peminjaman');
    }
  };

  // Admin menyerahkan barang ke peminjam (1 Klik)
  const handleHandover = async (loanId) => {
    if (!window.confirm('Serahkan barang ini kepada peminjam? Status akan berubah menjadi Sedang Dipinjam.')) return;
    try {
      await api.patch(`/loans/${loanId}/borrow`, {
        adminNotes: 'Barang telah diserahterimakan kepada peminjam oleh Super Admin',
      });
      fetchLoans(pagination.page);
      fetchDependencies();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mengubah status peminjaman');
    }
  };

  // Admin konfirmasi penerimaan barang kembali (cukup 1 klik tanpa upload file)
  const handleReceiveReturn = async (loanId) => {
    if (!window.confirm('Konfirmasi penerimaan barang kembali di gudang inventaris? Stok barang akan otomatis dikembalikan.')) return;
    try {
      await api.patch(`/loans/${loanId}/return`, {
        adminNotes: 'Diterima kembali oleh Super Admin di gudang inventaris',
      });
      fetchLoans(pagination.page);
      fetchDependencies();
      alert('Peminjaman telah selesai dan barang berhasil diterima kembali!');
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal memproses penerimaan barang');
    }
  };

  // Open Document Print Modal
  const handleOpenPrintModal = (loan) => {
    setSelectedLoanForPrint(loan);
    setIsPrintModalOpen(true);
  };

  // Multi-item helper untuk modal Catat Peminjaman Anggota oleh Admin
  const handleAdminAddItemRow = () => {
    setNewLoanData((prev) => ({
      ...prev,
      items: [...prev.items, { inventoryItemId: '', quantity: 1, notes: '' }],
    }));
  };

  const handleAdminRemoveItemRow = (index) => {
    if (newLoanData.items.length <= 1) return;
    setNewLoanData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleAdminItemChange = (index, field, value) => {
    setNewLoanData((prev) => {
      const updated = [...prev.items];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, items: updated };
    });
  };

  // Super Admin catat pinjaman dari Lembaga Luar (Otomatis masuk ke inventaris & peminjaman!)
  const handleCreateInstitutionLoan = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      // 1. Dapatkan atau Buat Lembaga
      let instId = institutionLoanData.institutionId;
      if (!instId && institutionLoanData.newInstitutionName) {
        const instRes = await api.post('/institutions', {
          name: institutionLoanData.newInstitutionName,
          notes: 'Mitra peminjaman logistik',
        });
        instId = instRes.data.data.id;
      }

      // 2. Buat Barang di Inventaris otomatis berlabel "Pinjaman dari Lembaga"
      const instName =
        institutions.find((i) => i.id === parseInt(instId))?.name ||
        institutionLoanData.newInstitutionName ||
        'Lembaga Mitra';

      const customOrAutoCode = institutionLoanData.code?.trim() || `LMBG-${instName.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`;
      
      const invPayload = {
        code: customOrAutoCode,
        name: institutionLoanData.itemName,
        categoryId: institutionLoanData.categoryId ? parseInt(institutionLoanData.categoryId) : (categories[0]?.id || 12),
        quantity: parseInt(institutionLoanData.quantity) || 1,
        condition: 'GOOD',
        location: institutionLoanData.location,
        source: 'LOAN_FROM_INSTITUTION',
        institutionId: instId ? parseInt(instId) : null,
        notes: `Barang pinjaman dari ${instName}. Tenggat: ${institutionLoanData.endDate}`,
      };

      const invRes = await api.post('/inventory', invPayload);
      const createdInvItem = invRes.data.data;

      // 3. Catat di Sub Peminjaman (deductStock: false agar stok tetap tersedia di inventaris untuk dipinjam anggota)
      await api.post('/loans', {
        borrowerType: 'OUTSIDE',
        borrowerName: `Pinjaman dari ${instName}`,
        institutionId: instId ? parseInt(instId) : null,
        items: [
          {
            inventoryItemId: createdInvItem.id,
            quantity: parseInt(institutionLoanData.quantity) || 1,
            notes: `Dipinjam dari ${instName}`,
          },
        ],
        startDate: institutionLoanData.startDate,
        endDate: institutionLoanData.endDate,
        purpose: institutionLoanData.purpose,
        status: 'BORROWED',
        deductStock: false,
        adminNotes: `Barang otomatis ditambahkan ke katalog inventaris dan siap dipinjam oleh anggota.`,
      });

      alert(
        `Berhasil mencatat pinjaman dari ${instName}! Barang '${institutionLoanData.itemName}' kini otomatis tersedia di katalog dan siap dipinjam oleh anggota.`
      );

      setIsInstitutionLoanModalOpen(false);
      fetchLoans(1);
      fetchDependencies();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mencatat peminjaman dari lembaga');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <HandCoins className="w-6 h-6 text-amber-400" />
            Sub Sistem Peminjaman & Bukti Serah Terima
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Pengelolaan peminjaman anggota, pencatatan pinjaman dari lembaga mitra, upload bukti foto, serta cetak surat jalan & stiker.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Tombol Pinjam dari Lembaga Luar */}
          <button
            onClick={() => setIsInstitutionLoanModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
            title="Catat barang yang dipinjam dari lembaga luar agar otomatis masuk ke katalog peminjaman"
          >
            <Building className="w-4 h-4 text-cyan-400" />
            <span>+ Pinjam dari Lembaga Lain</span>
          </button>

          {/* Tombol Catat Peminjaman Anggota Manual */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 rounded-xl gradient-btn text-xs font-bold flex items-center gap-2 shadow-glow text-white"
          >
            <Plus className="w-4 h-4" />
            <span>Catat Peminjaman Anggota</span>
          </button>
        </div>
      </div>

      {/* Sub Tabs: Peminjaman Anggota VS Pinjaman dari Lembaga Luar */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => {
            setActiveSubTab('member_loans');
            setSearchParams({ tab: 'member_loans' });
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'member_loans'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-glow'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Peminjaman Anggota & Kegiatan</span>
        </button>

        <button
          onClick={() => {
            setActiveSubTab('institution_loans');
            setSearchParams({ tab: 'institution_loans' });
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'institution_loans'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-glow'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Katalog Pinjaman Lembaga Mitra</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="glass-card p-4 border border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative sm:col-span-2">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Cari kode peminjaman, nama peminjam, nama barang, keperluan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full glass-input pl-9 text-xs"
          />
        </div>

        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full glass-input text-xs"
          >
            <option value="">Semua Status Peminjaman</option>
            <option value="PENDING" className="bg-slate-900 text-white">Menunggu Persetujuan</option>
            <option value="APPROVED" className="bg-slate-900 text-white">Disetujui (Siap Diambil)</option>
            <option value="BORROWED" className="bg-slate-900 text-white">Sedang Dipinjam</option>
            <option value="RETURNED" className="bg-slate-900 text-white">Sudah Dikembalikan</option>
            <option value="REJECTED" className="bg-slate-900 text-white">Ditolak</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="glass-card border border-white/10 overflow-hidden shadow-glass rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900/90 border-b border-white/10 text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">KODE & TANGGAL</th>
                <th className="py-3.5 px-4">PEMINJAM / SUMBER</th>
                <th className="py-3.5 px-4">BARANG DIPINJAM</th>
                <th className="py-3.5 px-3 text-center">STATUS</th>
                <th className="py-3.5 px-3 text-center">BUKTI FOTO</th>
                <th className="py-3.5 px-4 text-right">CETAK & AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    <div className="inline-block w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-2" />
                    <p>Memuat data peminjaman...</p>
                  </td>
                </tr>
              ) : loans.length === 0 ? (
                <tr>
                  <td colSpan="6">
                    <EmptyState
                      title="Belum Ada Catatan Peminjaman"
                      message="Tidak ada data peminjaman yang cocok dengan filter saat ini."
                    />
                  </td>
                </tr>
              ) : (
                loans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-white/5 transition-colors">
                    {/* Kode & Tanggal */}
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-extrabold text-amber-400 text-xs block">
                        {loan.loanCode}
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        {formatDate(loan.startDate)} s/d {formatDate(loan.endDate)}
                      </span>
                    </td>

                    {/* Peminjam */}
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-white text-xs">{loan.borrowerName}</p>
                      <span className="text-[10px] text-slate-400">
                        {loan.member?.division ? `Divisi: ${loan.member.division}` : 'Keperluan Organisasi'}
                      </span>
                    </td>

                    {/* Barang */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        {loan.loanItems?.map((li) => (
                          <div key={li.id} className="flex items-center gap-1.5 text-slate-300">
                            <span className="font-mono text-[10px] text-cyan-400 font-semibold">
                              [{li.inventoryItem?.code}]
                            </span>
                            <span className="font-medium text-white">{li.inventoryItem?.name}</span>
                            <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px]">
                              {li.quantity} unit
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3 text-center">
                      <StatusBadge status={loan.status} />
                    </td>

                    {/* Bukti Foto (Serah Terima / Pengembalian) */}
                    <td className="py-3.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {loan.borrowProof ? (
                          <button
                            type="button"
                            onClick={() => setPreviewPhotoUrl(loan.borrowProof)}
                            className="p-1 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 text-[10px] font-semibold flex items-center gap-1"
                            title="Lihat Foto Bukti Serah Terima"
                          >
                            <Camera className="w-3 h-3" />
                            <span>Pinjam</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-500">-</span>
                        )}

                        {loan.returnProof && (
                          <button
                            type="button"
                            onClick={() => setPreviewPhotoUrl(loan.returnProof)}
                            className="p-1 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-[10px] font-semibold flex items-center gap-1"
                            title="Lihat Foto Bukti Pengembalian"
                          >
                            <Camera className="w-3 h-3" />
                            <span>Kembali</span>
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Cetak & Alur Aksi */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* 1. Alur Persetujuan (Approve/Reject) */}
                        {loan.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleApprove(loan.id)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 font-bold text-[11px] flex items-center gap-1 shadow-sm"
                              title="Setujui seluruh barang dalam transaksi peminjaman ini (Cukup 1 Klik)"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Setujui (1 Klik)</span>
                            </button>
                            <button
                              onClick={() => handleReject(loan.id)}
                              className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 font-bold text-[11px] flex items-center gap-1 shadow-sm"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Tolak</span>
                            </button>
                          </>
                        )}

                        {/* 2. Disetujui -> Serahkan ke Peminjam ATAU Konfirmasi Selesai (1 Klik tanpa upload) */}
                        {loan.status === 'APPROVED' && (
                          <>
                            <button
                              onClick={() => handleHandover(loan.id)}
                              className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 font-bold text-[11px] flex items-center gap-1 shadow-sm"
                              title="Serahkan barang ke peminjam (status berubah jadi Sedang Dipinjam)"
                            >
                              <ArrowRightCircle className="w-3.5 h-3.5" />
                              <span>Serahkan</span>
                            </button>
                            <button
                              onClick={() => handleReceiveReturn(loan.id)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 font-bold text-[11px] flex items-center gap-1 shadow-sm"
                              title="Terima pengembalian barang & selesaikan peminjaman (1 Klik)"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Terima Selesai</span>
                            </button>
                          </>
                        )}

                        {/* 3. Sedang Dipinjam -> Konfirmasi Pengembalian Barang (1 Klik tanpa upload file) */}
                        {loan.status === 'BORROWED' && (
                          <button
                            onClick={() => handleReceiveReturn(loan.id)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 font-bold text-[11px] flex items-center gap-1 shadow-sm"
                            title="Konfirmasi barang telah diterima kembali di gudang inventaris (Stok otomatis kembali)"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Terima Kembali</span>
                          </button>
                        )}

                        {/* 4. TOMBOL CETAK LENGKAP (Cetak Bukti, Surat Jalan, Stiker) */}
                        <button
                          onClick={() => handleOpenPrintModal(loan)}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300 font-bold text-[11px] flex items-center gap-1 shadow-sm"
                          title="Cetak Bukti Peminjaman, Surat Jalan, atau Stiker Logistik Multi-Ukuran"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Cetak Dokumen</span>
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

      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-xs">
          <span className="text-slate-400">
            Menampilkan {loans.length} dari {pagination.total} peminjaman • Halaman {pagination.page} / {pagination.totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchLoans(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-3 py-1.5 rounded-lg bg-slate-800 border border-white/10 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed font-semibold transition-all"
            >
              ← Sebelumnya
            </button>
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              const page = Math.max(1, Math.min(pagination.totalPages - 4, pagination.page - 2)) + i;
              return (
                <button
                  key={page}
                  onClick={() => fetchLoans(page)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    page === pagination.page
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-slate-800 border border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  {page}
                </button>
              );
            })}
            <button
              onClick={() => fetchLoans(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-1.5 rounded-lg bg-slate-800 border border-white/10 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed font-semibold transition-all"
            >
              Selanjutnya →
            </button>
          </div>
        </div>
      )}

      {/* ===================== MODAL CATAT PINJAMAN DARI LEMBAGA LAIN ===================== */}
      <Modal
        isOpen={isInstitutionLoanModalOpen}
        onClose={() => setIsInstitutionLoanModalOpen(false)}
        title="Catat Peminjaman Barang dari Lembaga Luar"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreateInstitutionLoan} className="space-y-4 text-xs">
          <p className="text-slate-400 leading-relaxed">
            Barang yang Anda pinjam dari lembaga mitra (contoh: Proyektor / Mixer dari UNWAHA, Al-Muhibbin, dll.)
            akan <strong className="text-cyan-300">otomatis tercatat di inventaris penyimpanan</strong> dan <strong className="text-amber-300">langsung siap diajukan pinjam oleh anggota</strong>.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Lembaga / Pihak Pemilik Barang <span className="text-rose-400">*</span>
              </label>
              <select
                value={institutionLoanData.institutionId}
                onChange={(e) => setInstitutionLoanData({ ...institutionLoanData, institutionId: e.target.value })}
                className="w-full glass-input"
              >
                <option value="">Pilih Lembaga Terdaftar</option>
                {institutions.map((inst) => (
                  <option key={inst.id} value={inst.id} className="bg-slate-900 text-white">
                    {inst.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Atau Ketik Nama Lembaga Baru
              </label>
              <input
                type="text"
                placeholder="misal: Pondok Pesantren Al-Muhibbin"
                value={institutionLoanData.newInstitutionName}
                onChange={(e) => setInstitutionLoanData({ ...institutionLoanData, newInstitutionName: e.target.value })}
                className="w-full glass-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-300 mb-1">
                Nama Barang yang Dipinjam <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="misal: Proyektor Epson 3500 Lumens / Kabel XLR 20m"
                value={institutionLoanData.itemName}
                onChange={(e) => setInstitutionLoanData({ ...institutionLoanData, itemName: e.target.value })}
                className="w-full glass-input"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Jumlah Unit <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                min="1"
                required
                value={institutionLoanData.quantity}
                onChange={(e) => setInstitutionLoanData({ ...institutionLoanData, quantity: e.target.value })}
                className="w-full glass-input"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Kode / Label Penanda Barang Sendiri <span className="text-slate-400 font-normal">(Opsional - Anda bisa buat/tandai kode sendiri misal: BDM 2, SONY-01)</span>
            </label>
            <input
              type="text"
              placeholder="misal: BDM 2, SONY-01, PJ-UNW-01 (Kosongkan jika ingin dibuatkan otomatis)"
              value={institutionLoanData.code}
              onChange={(e) => setInstitutionLoanData({ ...institutionLoanData, code: e.target.value })}
              className="w-full glass-input"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Kategori Inventaris <span className="text-rose-400">*</span>
            </label>
            <select
              value={institutionLoanData.categoryId}
              onChange={(e) => setInstitutionLoanData({ ...institutionLoanData, categoryId: e.target.value })}
              className="w-full glass-input"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Tanggal Mulai Pinjam</label>
              <input
                type="date"
                required
                value={institutionLoanData.startDate}
                onChange={(e) => setInstitutionLoanData({ ...institutionLoanData, startDate: e.target.value })}
                className="w-full glass-input"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Tenggat Wajib Dikembalikan</label>
              <input
                type="date"
                required
                value={institutionLoanData.endDate}
                onChange={(e) => setInstitutionLoanData({ ...institutionLoanData, endDate: e.target.value })}
                className="w-full glass-input"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Lokasi Penyimpanan Sementara</label>
            <input
              type="text"
              value={institutionLoanData.location}
              onChange={(e) => setInstitutionLoanData({ ...institutionLoanData, location: e.target.value })}
              className="w-full glass-input"
            />
          </div>

          <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsInstitutionLoanModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-900 border border-white/10 text-slate-300"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl gradient-btn text-white font-bold shadow-glow"
            >
              Simpan & Masukkan ke Peminjaman
            </button>
          </div>
        </form>
      </Modal>

      {/* ===================== MODAL CATAT PEMINJAMAN ANGGOTA MANUAL (BISA MULTI-BARANG) ===================== */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Catat Peminjaman Anggota (Multi-Barang Sekaligus)"
        maxWidth="max-w-2xl"
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            // Validasi items
            for (const item of newLoanData.items) {
              if (!item.inventoryItemId) {
                alert('Silakan pilih barang yang ingin dipinjam pada semua baris.');
                return;
              }
            }
            try {
              setLoading(true);
              const selectedMember = members.find((m) => m.id === parseInt(newLoanData.memberId));
              const payload = {
                borrowerType: 'MEMBER',
                memberId: parseInt(newLoanData.memberId),
                borrowerName: selectedMember?.fullName || newLoanData.borrowerName,
                items: newLoanData.items.map((i) => ({
                  inventoryItemId: parseInt(i.inventoryItemId),
                  quantity: parseInt(i.quantity) || 1,
                  notes: i.notes || '',
                })),
                startDate: newLoanData.startDate,
                endDate: newLoanData.endDate,
                purpose: newLoanData.purpose,
                status: 'APPROVED',
                adminNotes: newLoanData.adminNotes || 'Dicatat langsung oleh Super Admin',
              };
              await api.post('/loans', payload);
              setIsCreateModalOpen(false);
              fetchLoans(1);
              fetchDependencies();
              alert('Peminjaman berhasil dicatat dalam 1 nomor transaksi resmi!');
            } catch (err) {
              alert(err.response?.data?.message || 'Gagal membuat peminjaman');
            } finally {
              setLoading(false);
            }
          }}
          className="space-y-4 text-xs"
        >
          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Pilih Anggota Peminjam <span className="text-rose-400">*</span>
            </label>
            <select
              required
              value={newLoanData.memberId}
              onChange={(e) => {
                const mem = members.find((m) => m.id === parseInt(e.target.value));
                setNewLoanData({
                  ...newLoanData,
                  memberId: e.target.value,
                  borrowerName: mem?.fullName || '',
                });
              }}
              className="w-full glass-input"
            >
              <option value="">Pilih Anggota Terdaftar</option>
              {members.map((m) => (
                <option key={m.id} value={m.id} className="bg-slate-900 text-white">
                  {m.fullName} ({m.memberId} - {m.division || 'Anggota'})
                </option>
              ))}
            </select>
          </div>

          {/* Multi-Item Selector */}
          <div className="space-y-3 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-200">
                Daftar Barang yang Dipinjam ({newLoanData.items.length} Barang) <span className="text-rose-400">*</span>
              </label>
              <button
                type="button"
                onClick={handleAdminAddItemRow}
                className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 font-bold text-[11px] flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Tambah Barang Lagi</span>
              </button>
            </div>

            {newLoanData.items.map((row, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-900/60 border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-amber-400">Barang #{idx + 1}</span>
                  {newLoanData.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleAdminRemoveItemRow(idx)}
                      className="text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Hapus Baris
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-2">
                    <select
                      required
                      value={row.inventoryItemId}
                      onChange={(e) => handleAdminItemChange(idx, 'inventoryItemId', e.target.value)}
                      className="w-full glass-input"
                    >
                      <option value="">Pilih Barang Inventaris / Mitra</option>
                      {inventoryList.map((item) => (
                        <option key={item.id} value={item.id} className="bg-slate-900 text-white">
                          [{item.code}] {item.name} (Tersedia: {item.availableQuantity})
                          {item.source === 'LOAN_FROM_INSTITUTION' ? ' [Mitra]' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <input
                      type="number"
                      min="1"
                      required
                      placeholder="Qty"
                      value={row.quantity}
                      onChange={(e) => handleAdminItemChange(idx, 'quantity', e.target.value)}
                      className="w-full glass-input"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Tanggal Pinjam</label>
              <input
                type="date"
                required
                value={newLoanData.startDate}
                onChange={(e) => setNewLoanData({ ...newLoanData, startDate: e.target.value })}
                className="w-full glass-input"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Tenggat Pengembalian</label>
              <input
                type="date"
                required
                value={newLoanData.endDate}
                onChange={(e) => setNewLoanData({ ...newLoanData, endDate: e.target.value })}
                className="w-full glass-input"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Keperluan Peminjaman</label>
            <input
              type="text"
              required
              placeholder="misal: Dokumentasi Haflah / Acara Tabligh"
              value={newLoanData.purpose}
              onChange={(e) => setNewLoanData({ ...newLoanData, purpose: e.target.value })}
              className="w-full glass-input"
            />
          </div>

          <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-900 border border-white/10 text-slate-300"
            >
              Batal
            </button>
            <button type="submit" className="px-5 py-2 rounded-xl gradient-btn text-white font-bold">
              Simpan Peminjaman
            </button>
          </div>
        </form>
      </Modal>

      {/* ===================== MODAL DOKUMEN CETAK (BUKTI, SURAT JALAN, STIKER) ===================== */}
      <LoanPrintDocumentsModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        loan={selectedLoanForPrint}
      />

      {/* ===================== MODAL PREVIEW FOTO BUKTI DOKUMENTASI ANGGOTA ===================== */}
      {previewPhotoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
          <div className="relative max-w-2xl w-full bg-slate-900 border border-white/15 rounded-2xl p-4 text-center">
            <button
              onClick={() => setPreviewPhotoUrl(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-white hover:bg-slate-700"
            >
              X
            </button>
            <h4 className="text-sm font-bold text-white mb-3">Foto Bukti Dokumentasi</h4>
            <img
              src={
                previewPhotoUrl.startsWith('http')
                  ? previewPhotoUrl
                  : `http://localhost:5000${previewPhotoUrl}`
              }
              alt="Bukti"
              className="max-h-[75vh] mx-auto rounded-xl object-contain shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminLoansPage;
