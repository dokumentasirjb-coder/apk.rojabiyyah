import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Boxes,
  Plus,
  Search,
  Filter,
  Download,
  Edit2,
  Trash2,
  Eye,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Building2,
  Upload,
  Info,
} from 'lucide-react';
import { StatusBadge } from '../../components/ui/StatusBadge.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { getImageUrl } from '../../lib/utils.js';
import api from '../../api/axios.js';

export const AdminInventoryPage = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [customFields, setCustomFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  // Filters (Default to INTERNAL so institution loans are not mixed)
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('');
  const [selectedSource, setSelectedSource] = useState('INTERNAL');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    categoryId: '',
    quantity: 1,
    condition: 'GOOD',
    location: '',
    source: 'INTERNAL',
    institutionId: '',
    notes: '',
    customFields: {},
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const fetchItems = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        search: search || undefined,
        categoryId: selectedCategory || undefined,
        condition: selectedCondition || undefined,
        source: selectedSource || undefined,
      };
      const res = await api.get('/inventory', { params });
      setItems(res.data.data);
      setPagination(res.data.meta);
    } catch (err) {
      console.error('Gagal mengambil data inventaris:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDependencies = async () => {
    try {
      const [catsRes, instsRes, cfieldsRes] = await Promise.all([
        api.get('/settings/categories?type=INVENTORY'),
        api.get('/institutions'),
        api.get('/settings/custom-fields?module=INVENTORY'),
      ]);
      setCategories(catsRes.data.data);
      setInstitutions(instsRes.data.data);
      setCustomFields(cfieldsRes.data.data);
    } catch (err) {
      console.error('Gagal memuat master data inventaris:', err);
    }
  };

  useEffect(() => {
    fetchDependencies();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchItems(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, selectedCategory, selectedCondition, selectedSource]);

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        code: item.code,
        name: item.name,
        categoryId: String(item.categoryId),
        quantity: item.quantity,
        condition: item.condition,
        location: item.location,
        source: item.source,
        institutionId: item.institutionId ? String(item.institutionId) : '',
        notes: item.notes || '',
        customFields: {},
      });
      setPhotoPreview(item.photo ? getImageUrl(item.photo) : null);
    } else {
      setEditingItem(null);
      setFormData({
        code: `INV-${Date.now().toString().slice(-4)}`,
        name: '',
        categoryId: categories[0]?.id ? String(categories[0].id) : '',
        quantity: 1,
        condition: 'GOOD',
        location: 'Gudang Inventaris Utama',
        source: 'INTERNAL',
        institutionId: '',
        notes: '',
        customFields: {},
      });
      setPhotoPreview(null);
    }
    setPhotoFile(null);
    setIsModalOpen(true);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const submitData = new FormData();
      submitData.append('code', formData.code);
      submitData.append('name', formData.name);
      submitData.append('categoryId', formData.categoryId);
      submitData.append('quantity', formData.quantity);
      submitData.append('condition', formData.condition);
      submitData.append('location', formData.location);
      submitData.append('source', formData.source);
      if (formData.source === 'LOAN_FROM_INSTITUTION' && formData.institutionId) {
        submitData.append('institutionId', formData.institutionId);
      }
      submitData.append('notes', formData.notes || '');
      submitData.append('customFields', JSON.stringify(formData.customFields));

      if (photoFile) {
        submitData.append('photo', photoFile);
      }

      if (editingItem) {
        await api.put(`/inventory/${editingItem.id}`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await api.post('/inventory', submitData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      setIsModalOpen(false);
      fetchItems(pagination.page);
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan barang inventaris');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/inventory/${id}`);
      setDeleteConfirmId(null);
      fetchItems(pagination.page);
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus barang');
    }
  };

  const handleExport = async () => {
    try {
      const response = await api.get('/inventory/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Inventaris_Rojabiyyaah_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Gagal mengunduh laporan excel');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Boxes className="w-6 h-6 text-indigo-400" />
            Data Inventaris & Logistik
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Kelola data aset, stok fisik, kondisi kelayakan, dan sumber kepemilikan barang.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => navigate('/admin/loans?tab=institution_loans')}
            className="px-3.5 py-2 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 text-xs font-bold flex items-center gap-2 transition-all shadow-sm"
          >
            <Building2 className="w-4 h-4 text-cyan-400" />
            <span>Katalog Pinjaman Lembaga</span>
          </button>
          <button
            onClick={handleExport}
            className="px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-white/10 text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Ekspor Excel</span>
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2 rounded-xl gradient-btn text-xs font-bold flex items-center gap-2 shadow-glow"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Barang</span>
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-start sm:items-center justify-between gap-3 text-xs text-indigo-200">
        <div className="flex items-start sm:items-center gap-3">
          <Info className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5 sm:mt-0" />
          <p>
            <strong>Penyimpanan Inventaris Internal:</strong> Modul ini khusus mendata dan menyimpan aset milik internal organisasi. Barang yang dipinjam dari lembaga mitra (contoh: UNWAHA, Ponpes Al-Muhibbin) memiliki katalog terpisah pada menu <strong>Katalog Pinjaman Lembaga</strong>.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-card p-4 border border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Cari kode, nama, lokasi..."
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
            <option value="">Semua Kondisi</option>
            <option value="GOOD" className="bg-slate-900 text-white">Baik</option>
            <option value="SLIGHTLY_DAMAGED" className="bg-slate-900 text-white">Rusak Ringan</option>
            <option value="DAMAGED" className="bg-slate-900 text-white">Rusak Berat</option>
          </select>
        </div>

        <div>
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="w-full glass-input text-xs"
          >
            <option value="INTERNAL" className="bg-slate-900 text-white">Milik Internal Saja</option>
            <option value="LOAN_FROM_INSTITUTION" className="bg-slate-900 text-white">Pinjaman Lembaga Mitra</option>
            <option value="" className="bg-slate-900 text-white">Semua Sumber</option>
          </select>
        </div>
      </div>

      {/* Table Data */}
      <div className="glass-card border border-white/10 overflow-hidden shadow-glass">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900/80 border-b border-white/10 text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Barang</th>
                <th className="py-3.5 px-4">Kategori</th>
                <th className="py-3.5 px-4 text-center">Total / Tersedia</th>
                <th className="py-3.5 px-4 text-center">Kondisi</th>
                <th className="py-3.5 px-4">Lokasi</th>
                <th className="py-3.5 px-4">Sumber</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <div className="inline-block w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-2" />
                    <p>Memuat data inventaris...</p>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan="7">
                    <EmptyState
                      title="Tidak Ada Barang Ditemukan"
                      message="Coba ubah filter pencarian atau tambahkan barang inventaris baru."
                    />
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-800 border border-white/10 flex-shrink-0 overflow-hidden flex items-center justify-center">
                          {item.photo ? (
                            <img
                              src={getImageUrl(item.photo)}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Boxes className="w-5 h-5 text-rose-400/60" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-white text-xs">{item.name}</p>
                          <span className="text-[10px] font-mono text-cyan-400">{item.code}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{item.category?.name || '-'}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-bold text-white">{item.quantity}</span>
                      <span className="text-slate-500 mx-1">/</span>
                      <span className={`font-bold ${item.availableQuantity > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {item.availableQuantity}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <StatusBadge status={item.condition} />
                    </td>
                    <td className="py-3 px-4 text-slate-300">{item.location}</td>
                    <td className="py-3 px-4">
                      {item.source === 'LOAN_FROM_INSTITUTION' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                          <Building2 className="w-3 h-3" />
                          Pinjaman: {item.institution?.name || 'Mitra'}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Milik Sendiri</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setViewingItem(item);
                            setIsDetailModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                          title="Lihat Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenModal(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                          title="Ubah Data"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(item.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
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

        {/* Pagination Bar */}
        {pagination.totalPages > 1 && (
          <div className="p-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <span>
              Menampilkan Halaman {pagination.page} dari {pagination.totalPages} ({pagination.total} total data)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={pagination.page <= 1}
                onClick={() => fetchItems(pagination.page - 1)}
                className="px-3 py-1 rounded-lg bg-slate-900 border border-white/10 disabled:opacity-40 hover:bg-slate-800 transition-colors"
              >
                Sebelumnya
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchItems(pagination.page + 1)}
                className="px-3 py-1 rounded-lg bg-slate-900 border border-white/10 disabled:opacity-40 hover:bg-slate-800 transition-colors"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Add / Edit Inventory */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Perbarui Data Barang Inventaris' : 'Tambah Barang Inventaris Baru'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Kode / Label Barang <span className="text-slate-400 font-normal">(Bisa buat kode sendiri, misal: BDM 2, SONY-01)</span>
              </label>
              <input
                type="text"
                required
                placeholder="misal: BDM 2, SONY-01, INV-001"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full glass-input"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Nama Barang</label>
              <input
                type="text"
                required
                placeholder="misal: Kamera Sony A7 III"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full glass-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Kategori</label>
              <select
                required
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full glass-input"
              >
                <option value="">Pilih Kategori</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Jumlah Unit</label>
              <input
                type="number"
                min="1"
                required
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                className="w-full glass-input"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Kondisi</label>
              <select
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                className="w-full glass-input"
              >
                <option value="GOOD" className="bg-slate-900 text-white">Baik</option>
                <option value="SLIGHTLY_DAMAGED" className="bg-slate-900 text-white">Rusak Ringan</option>
                <option value="DAMAGED" className="bg-slate-900 text-white">Rusak Berat</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Lokasi Penyimpanan</label>
              <input
                type="text"
                required
                placeholder="misal: Rak Audio B2"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full glass-input"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Sumber Kepemilikan</label>
              <select
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                className="w-full glass-input"
              >
                <option value="INTERNAL" className="bg-slate-900 text-white">Milik Internal Sendiri</option>
                <option value="LOAN_FROM_INSTITUTION" className="bg-slate-900 text-white">Pinjaman dari Lembaga Lain</option>
              </select>
            </div>
          </div>

          {formData.source === 'LOAN_FROM_INSTITUTION' && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <label className="block font-semibold text-amber-300 mb-1">Lembaga Pemberi Pinjaman</label>
              <select
                required
                value={formData.institutionId}
                onChange={(e) => setFormData({ ...formData, institutionId: e.target.value })}
                className="w-full glass-input"
              >
                <option value="">Pilih Mitra Lembaga</option>
                {institutions.map((inst) => (
                  <option key={inst.id} value={inst.id} className="bg-slate-900 text-white">
                    {inst.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Dynamic Custom Fields */}
          {customFields.length > 0 && (
            <div className="pt-2 border-t border-white/10 space-y-3">
              <p className="font-bold text-slate-300">Kolom Kustom Dinamis:</p>
              {customFields.map((cf) => (
                <div key={cf.id}>
                  <label className="block font-semibold text-slate-400 mb-1">{cf.fieldLabel}</label>
                  <input
                    type={cf.fieldType === 'NUMBER' ? 'number' : 'text'}
                    placeholder={`Masukkan ${cf.fieldLabel}`}
                    value={formData.customFields[cf.id] || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customFields: { ...formData.customFields, [cf.id]: e.target.value },
                      })
                    }
                    className="w-full glass-input"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Upload Photo */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Foto Barang (Opsional)</label>
            <div className="flex items-center gap-4">
              {photoPreview && (
                <div className="relative group">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-16 h-16 rounded-xl object-cover border border-white/20"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoFile(null);
                      setPhotoPreview(null);
                    }}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] hover:bg-rose-500 shadow-md"
                    title="Hapus foto"
                  >
                    ✕
                  </button>
                </div>
              )}
              <label className="cursor-pointer px-4 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-white/10 flex items-center gap-2 transition-colors">
                <Upload className="w-4 h-4 text-rose-400" />
                <span>{photoPreview ? 'Ganti Foto' : 'Pilih Foto'}</span>
                <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
              </label>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Catatan Tambahan</label>
            <textarea
              rows="2"
              placeholder="Kelengkapan unit, nomor seri, kabel pendukung..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full glass-input"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl gradient-btn font-bold shadow-glow disabled:opacity-50"
            >
              {isSubmitting ? 'Menyimpan...' : editingItem ? 'Simpan Perubahan' : 'Tambah Barang'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Detail Barang Inventaris"
        maxWidth="max-w-lg"
      >
        {viewingItem && (
          <div className="space-y-4 text-xs">
            {viewingItem.photo && (
              <div className="w-full h-48 rounded-xl overflow-hidden border border-white/10 mb-3">
                <img
                  src={getImageUrl(viewingItem.photo)}
                  alt={viewingItem.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-900/60 border border-white/5">
              <div>
                <span className="text-slate-400">Kode Barang:</span>
                <p className="font-bold text-white text-sm mt-0.5">{viewingItem.code}</p>
              </div>
              <div>
                <span className="text-slate-400">Nama Barang:</span>
                <p className="font-bold text-white text-sm mt-0.5">{viewingItem.name}</p>
              </div>
              <div>
                <span className="text-slate-400">Kategori:</span>
                <p className="font-bold text-white mt-0.5">{viewingItem.category?.name || '-'}</p>
              </div>
              <div>
                <span className="text-slate-400">Kondisi:</span>
                <div className="mt-0.5">
                  <StatusBadge status={viewingItem.condition} />
                </div>
              </div>
              <div>
                <span className="text-slate-400">Total Stok:</span>
                <p className="font-bold text-white mt-0.5">{viewingItem.quantity} Unit</p>
              </div>
              <div>
                <span className="text-slate-400">Stok Tersedia:</span>
                <p className="font-bold text-emerald-400 mt-0.5">{viewingItem.availableQuantity} Unit</p>
              </div>
              <div>
                <span className="text-slate-400">Lokasi:</span>
                <p className="font-bold text-white mt-0.5">{viewingItem.location}</p>
              </div>
              <div>
                <span className="text-slate-400">Sumber:</span>
                <p className="font-bold text-white mt-0.5">
                  {viewingItem.source === 'LOAN_FROM_INSTITUTION'
                    ? `Pinjaman dari ${viewingItem.institution?.name || 'Mitra'}`
                    : 'Milik Sendiri'}
                </p>
              </div>
            </div>

            {viewingItem.notes && (
              <div className="p-3 rounded-xl bg-slate-900/40 border border-white/5">
                <span className="text-slate-400 block mb-1">Catatan:</span>
                <p className="text-slate-200">{viewingItem.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        title="Konfirmasi Hapus Barang"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-300">
            Apakah Anda yakin ingin menghapus barang inventaris ini? Data yang dihapus tidak dapat dipulihkan.
          </p>
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
            <button
              onClick={() => setDeleteConfirmId(null)}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 font-semibold"
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
