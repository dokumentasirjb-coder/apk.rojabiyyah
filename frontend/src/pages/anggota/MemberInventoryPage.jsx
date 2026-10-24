import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Boxes,
  Search,
  Filter,
  HandCoins,
  Building2,
  Calendar,
  Sparkles,
  Info,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  Eye,
} from 'lucide-react';
import { StatusBadge } from '../../components/ui/StatusBadge.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { getImageUrl } from '../../lib/utils.js';
import api from '../../api/axios.js';

export const MemberInventoryPage = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('');

  // Item Detail Modal
  const [selectedItemDetail, setSelectedItemDetail] = useState(null);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const params = {
        limit: 100,
        search: search || undefined,
        categoryId: selectedCategory || undefined,
        condition: selectedCondition || undefined,
      };
      const res = await api.get('/inventory', { params });
      setItems(res.data.data);
    } catch (err) {
      console.error('Gagal mengambil katalog inventaris:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/settings/categories?type=INVENTORY');
      setCategories(res.data.data);
    } catch (err) {
      console.error('Gagal memuat kategori:', err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchItems();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, selectedCategory, selectedCondition]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Boxes className="w-6 h-6 text-cyan-400" />
            Penyimpanan & Pendataan Gudang Inventaris
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Data master barang dan stok inventaris organisasi. Untuk meminjam barang, gunakan submenu Peminjaman.
          </p>
        </div>

        <button
          onClick={() => navigate('/member/loans')}
          className="px-4 py-2 rounded-xl gradient-btn text-xs font-bold flex items-center gap-2 shadow-glow self-start sm:self-auto"
        >
          <HandCoins className="w-4 h-4" />
          <span>Buka Sub Peminjaman</span>
        </button>
      </div>

      {/* Info Banner */}
      <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex items-start sm:items-center gap-3 text-xs text-cyan-200">
        <Info className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5 sm:mt-0" />
        <div className="flex-1">
          <p>
            Submenu <strong>Inventaris</strong> difokuskan khusus untuk penyimpanan dan pendataan stok fisik. Seluruh transaksi peminjaman (baik barang internal maupun barang pinjaman dari lembaga) diproses terpusat melalui submenu <strong>Peminjaman</strong>.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-card p-4 border border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-1 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Cari nama, kode barang, lokasi simpan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full glass-input pl-9 text-xs"
          />
        </div>

        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full glass-input text-xs"
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
            className="w-full glass-input text-xs"
          >
            <option value="">Semua Kondisi Fisik</option>
            <option value="GOOD" className="bg-slate-900 text-white">Kondisi Baik</option>
            <option value="SLIGHTLY_DAMAGED" className="bg-slate-900 text-white">Rusak Ringan</option>
            <option value="DAMAGED" className="bg-slate-900 text-white">Rusak Berat</option>
          </select>
        </div>
      </div>

      {/* Inventory Grid Cards */}
      {loading ? (
        <div className="py-16 text-center text-slate-400">
          <div className="inline-block w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mb-2" />
          <p className="text-xs">Memuat katalog penyimpanan inventaris...</p>
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title="Tidak Ada Data Barang"
          message="Tidak ada barang inventaris yang sesuai dengan filter pencarian Anda."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="glass-card border border-white/10 overflow-hidden flex flex-col justify-between hover:border-[#800020]/60 transition-all duration-300 shadow-glass group"
            >
              <div>
                {/* Image Box */}
                <div className="w-full h-32 bg-slate-900/80 relative overflow-hidden flex items-center justify-center border-b border-white/5">
                  {item.photo ? (
                    <img
                      src={getImageUrl(item.photo)}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <Boxes className="w-8 h-8 text-slate-600" />
                  )}

                  <div className="absolute top-2 left-2">
                    <span className="text-[9px] font-bold font-mono px-1.5 py-0.5 rounded-md bg-slate-950/80 text-cyan-400 backdrop-blur-md border border-white/10">
                      {item.code}
                    </span>
                  </div>

                  <div className="absolute top-2 right-2 scale-90 origin-top-right">
                    <StatusBadge status={item.condition} />
                  </div>
                </div>

                {/* Details */}
                <div className="p-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-semibold text-rose-300 uppercase tracking-wider">
                      {item.category?.name || 'Inventaris'}
                    </span>
                    {item.source === 'LOAN_FROM_INSTITUTION' ? (
                      <span className="text-[8px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-semibold flex items-center gap-1">
                        <Building2 className="w-2.5 h-2.5" />
                        Pinjaman Lembaga
                      </span>
                    ) : (
                      <span className="text-[8px] px-1.5 py-0.2 rounded bg-[#800020]/20 text-rose-200 border border-[#800020]/40 font-semibold">
                        Milik Rojabiyyah
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-white text-xs line-clamp-1">{item.name}</h3>

                  <div className="space-y-1 text-[10px] text-slate-400">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-500 flex-shrink-0" />
                      <span className="line-clamp-1">{item.location || 'Gudang Utama'}</span>
                    </div>
                  </div>

                  <div className="pt-1.5 flex items-center justify-between border-t border-white/5 text-[10px]">
                    <span className="text-slate-400">Total Stok Fisik:</span>
                    <span className="font-bold text-white px-1.5 py-0.2 rounded bg-slate-800 border border-white/10 font-mono">
                      {item.quantity} Unit
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">Stok Siap Pakai:</span>
                    <span
                      className={`font-bold font-mono px-1.5 py-0.2 rounded ${
                        item.availableQuantity > 0
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {item.availableQuantity} Unit
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-3 pt-0">
                <button
                  onClick={() => setSelectedItemDetail(item)}
                  className="w-full py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 text-slate-200 text-[10px] font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm"
                >
                  <Eye className="w-3 h-3 text-cyan-400" />
                  <span>Lihat Rincian Pendataan</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Item Storage Detail */}
      <Modal
        isOpen={Boolean(selectedItemDetail)}
        onClose={() => setSelectedItemDetail(null)}
        title="Detail Pendataan Barang Inventaris"
      >
        {selectedItemDetail && (
          <div className="space-y-4 text-xs">
            {selectedItemDetail.photo && (
              <div className="w-full h-48 rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center border border-white/10">
                <img
                  src={getImageUrl(selectedItemDetail.photo)}
                  alt={selectedItemDetail.name}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-white/10">
              <div>
                <span className="text-slate-400 block text-[10px]">KODE BARANG:</span>
                <span className="font-mono font-bold text-cyan-400 text-sm">{selectedItemDetail.code}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">KONDISI BARANG:</span>
                <StatusBadge status={selectedItemDetail.condition} />
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">KATEGORI:</span>
                <span className="font-semibold text-white">{selectedItemDetail.category?.name || '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">KEPEMILIKAN:</span>
                <span className="font-semibold text-amber-300">
                  {selectedItemDetail.source === 'LOAN_FROM_INSTITUTION' ? 'Pinjaman dari Lembaga' : 'Milik Internal'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div>
                <span className="text-slate-400 block font-semibold">Nama Barang:</span>
                <p className="text-white font-bold text-sm">{selectedItemDetail.name}</p>
              </div>

              <div>
                <span className="text-slate-400 block font-semibold">Lokasi Penyimpanan:</span>
                <p className="text-slate-200">{selectedItemDetail.location || 'Gudang Utama'}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-white/5">
                  <span className="text-slate-400 block text-[10px]">TOTAL STOK FISIK</span>
                  <span className="font-bold text-white text-base">{selectedItemDetail.quantity} Unit</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-white/5">
                  <span className="text-slate-400 block text-[10px]">STOK SIAP PAKAI</span>
                  <span className="font-bold text-emerald-400 text-base">{selectedItemDetail.availableQuantity} Unit</span>
                </div>
              </div>

              {selectedItemDetail.notes && (
                <div>
                  <span className="text-slate-400 block font-semibold">Catatan / Spesifikasi:</span>
                  <p className="text-slate-300 p-2.5 rounded-lg bg-slate-900/50 border border-white/5">
                    {selectedItemDetail.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSelectedItemDetail(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
              >
                Tutup
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedItemDetail(null);
                  navigate('/member/loans');
                }}
                className="px-4 py-2 rounded-xl gradient-btn text-xs font-bold flex items-center gap-1.5 shadow-glow"
              >
                <HandCoins className="w-3.5 h-3.5" />
                <span>Ajukan di Sub Peminjaman</span>
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
