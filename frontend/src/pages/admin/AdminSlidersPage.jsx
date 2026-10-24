import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Plus,
  Trash2,
  Image as ImageIcon,
  CheckCircle,
  Eye,
  ArrowUp,
  ArrowDown,
  Layers,
  Upload,
  Link as LinkIcon,
  RefreshCw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Modal } from '../../components/ui/Modal.jsx';
import api from '../../api/axios.js';

export const AdminSlidersPage = () => {
  const [sliders, setSliders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [inputMode, setInputMode] = useState('upload'); // 'upload' | 'url'
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [order, setOrder] = useState(1);

  // Live Preview Slider Index
  const [activePreviewIndex, setActivePreviewIndex] = useState(0);

  const fetchSliders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/settings/sliders');
      setSliders(res.data.data || []);
      setOrder((res.data.data?.length || 0) + 1);
    } catch (err) {
      console.error('Gagal memuat slider:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSliders();
  }, []);

  // Auto rotate preview slider
  useEffect(() => {
    if (sliders.length <= 1) return;
    const interval = setInterval(() => {
      setActivePreviewIndex((prev) => (prev + 1) % sliders.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [sliders]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleOpenAddModal = () => {
    setTitle('');
    setSubtitle('');
    setImageUrl('');
    setSelectedFile(null);
    setPreviewUrl(null);
    setInputMode('upload');
    setOrder(sliders.length + 1);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (inputMode === 'upload' && !selectedFile) {
      alert('Silakan pilih file foto untuk diunggah.');
      return;
    }
    if (inputMode === 'url' && !imageUrl.trim()) {
      alert('Silakan masukkan tautan / URL foto.');
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('title', title);
      formData.append('subtitle', subtitle);
      formData.append('order', order);

      if (inputMode === 'upload' && selectedFile) {
        formData.append('image', selectedFile);
      } else {
        formData.append('imageUrl', imageUrl.trim());
      }

      await api.post('/settings/sliders', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setIsModalOpen(false);
      fetchSliders();
      alert('Foto slider berhasil ditambahkan!');
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menambahkan slider');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (sliderId) => {
    if (!window.confirm('Yakin ingin menghapus foto slider ini?')) return;
    try {
      await api.delete(`/settings/sliders/${sliderId}`);
      fetchSliders();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus slider');
    }
  };

  const handleToggleActive = async (slider) => {
    const updated = sliders.map((s) =>
      s.id === slider.id ? { ...s, isActive: !s.isActive } : s
    );
    setSliders(updated);
    try {
      await api.put('/settings/sliders', { sliders: updated });
    } catch (err) {
      alert('Gagal memperbarui status slider');
      fetchSliders();
    }
  };

  const getFullImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `http://localhost:5000${url}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-cyan-400" />
            Kelola Foto Slider / Banner Halaman Depan
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Unggah dan atur foto-foto dokumentasi Haul Ke-5 & Rojabiyyah 2026 yang tampil berputar otomatis di halaman utama.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 rounded-xl gradient-btn text-xs font-bold text-white flex items-center gap-2 shadow-glow flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Tambah Foto Slider Baru</span>
        </button>
      </div>

      {/* Live Preview Simulator */}
      {sliders.length > 0 && (
        <div className="glass-card p-4 sm:p-5 border border-white/10 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5 uppercase tracking-wider">
              <Eye className="w-4 h-4" />
              Live Preview Tampilan Halaman Depan:
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              Slide {activePreviewIndex + 1} dari {sliders.length}
            </span>
          </div>

          <div className="relative w-full h-56 sm:h-72 md:h-80 rounded-2xl overflow-hidden border border-white/15 bg-slate-950 shadow-2xl">
            <AnimatePresence mode="wait">
              {sliders[activePreviewIndex] && (
                <motion.div
                  key={sliders[activePreviewIndex].id}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.7 }}
                  className="absolute inset-0"
                >
                  <img
                    src={getFullImageUrl(sliders[activePreviewIndex].imageUrl)}
                    alt={sliders[activePreviewIndex].title || 'Banner Slide'}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                    {sliders[activePreviewIndex].title && (
                      <h3 className="text-lg sm:text-2xl font-black drop-shadow-md">
                        {sliders[activePreviewIndex].title}
                      </h3>
                    )}
                    {sliders[activePreviewIndex].subtitle && (
                      <p className="text-xs sm:text-sm text-slate-300 max-w-xl drop-shadow">
                        {sliders[activePreviewIndex].subtitle}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Dots Indicator */}
            <div className="absolute bottom-3 right-6 flex items-center gap-1.5 z-10">
              {sliders.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => setActivePreviewIndex(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === activePreviewIndex
                      ? 'w-6 bg-cyan-400 shadow-glow'
                      : 'w-2 bg-white/40 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Grid of Sliders */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-400" />
          <span>Daftar Foto yang Terpasang ({sliders.length} Foto)</span>
        </h3>

        {loading ? (
          <div className="py-12 text-center text-slate-400">
            <div className="inline-block w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mb-2" />
            <p className="text-xs">Memuat foto slider...</p>
          </div>
        ) : sliders.length === 0 ? (
          <div className="glass-card p-8 border border-white/10 rounded-2xl text-center text-slate-400 text-xs">
            Belum ada foto slider yang ditambahkan. Silakan klik tombol <strong>"+ Tambah Foto Slider Baru"</strong> di atas.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sliders.map((slider, index) => (
              <div
                key={slider.id}
                className="glass-card rounded-2xl border border-white/10 overflow-hidden shadow-glass flex flex-col justify-between group hover:border-cyan-500/40 transition-all"
              >
                <div className="relative h-44 bg-slate-900 overflow-hidden">
                  <img
                    src={getFullImageUrl(slider.imageUrl)}
                    alt={slider.title || `Slide ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <span className="px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-md text-amber-300 font-mono font-bold text-[10px] border border-white/10">
                      Urutan #{slider.order || index + 1}
                    </span>
                  </div>
                  <div className="absolute top-2.5 right-2.5">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(slider)}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-all ${
                        slider.isActive
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400 border-white/10'
                      }`}
                    >
                      {slider.isActive ? 'Tampil' : 'Nonaktif'}
                    </button>
                  </div>
                </div>

                <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <h4 className="font-bold text-white text-xs line-clamp-1">
                      {slider.title || <span className="text-slate-500 italic">Tanpa Judul</span>}
                    </h4>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
                      {slider.subtitle || <span className="text-slate-500 italic">Tanpa Keterangan</span>}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-mono truncate max-w-[150px]">
                      {slider.id}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDelete(slider.id)}
                      className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-[11px] font-semibold flex items-center gap-1 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Tambah Slider Baru */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Tambah Foto Slider / Banner Baru"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Input Mode Selector */}
          <div className="flex rounded-xl bg-slate-900 p-1 border border-white/10">
            <button
              type="button"
              onClick={() => setInputMode('upload')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                inputMode === 'upload'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Unggah File Foto</span>
            </button>
            <button
              type="button"
              onClick={() => setInputMode('url')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                inputMode === 'url'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>Gunakan Link / URL Gambar</span>
            </button>
          </div>

          {/* Upload or URL field */}
          {inputMode === 'upload' ? (
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Pilih File Foto (JPG, PNG, WebP) <span className="text-rose-400">*</span>
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full glass-input text-xs"
              />
            </div>
          ) : (
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Tautan / URL Gambar Web <span className="text-rose-400">*</span>
              </label>
              <input
                type="url"
                placeholder="https://example.com/foto-haul.jpg"
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value);
                  setPreviewUrl(e.target.value);
                }}
                className="w-full glass-input"
              />
            </div>
          )}

          {/* Photo Preview if any */}
          {previewUrl && (
            <div className="relative h-40 rounded-xl overflow-hidden border border-white/15 bg-slate-900">
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-slate-950/80 text-[10px] text-cyan-300 font-mono">
                Preview Gambar
              </span>
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Judul Slide <span className="text-slate-400 font-normal">(Opsional)</span>
            </label>
            <input
              type="text"
              placeholder="misal: Haul ke-5 Al-Maghfurlah K.H. Moch. Djamaluddin Achmad"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full glass-input"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Subjudul / Keterangan Singkat <span className="text-slate-400 font-normal">(Opsional)</span>
            </label>
            <input
              type="text"
              placeholder="misal: Momen Kebersamaan & Khidmah Panitia Rojabiyyah 2026"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full glass-input"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Nomor Urutan Tampil
            </label>
            <input
              type="number"
              min="1"
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              className="w-full glass-input"
            />
          </div>

          <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-900 border border-white/10 text-slate-300"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl gradient-btn text-white font-bold shadow-glow disabled:opacity-60"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Foto Slider'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default AdminSlidersPage;

