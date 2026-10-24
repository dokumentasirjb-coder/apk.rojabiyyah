import React, { useState, useRef } from 'react';
import {
  Camera,
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  FileImage,
  RotateCw,
} from 'lucide-react';

export const LoanPhotoProofModal = ({
  isOpen,
  onClose,
  title = 'Unggah Bukti Foto Peminjaman',
  subtitle = 'Ambil foto langsung atau unggah file foto serah terima / pengembalian barang',
  onConfirm,
  isSubmitting = false,
}) => {
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [notes, setNotes] = useState('');
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearPhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm({ photoFile, notes });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-lg bg-slate-900 border border-white/15 rounded-2xl shadow-2xl p-6 text-xs text-slate-100 relative">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Camera className="w-5 h-5 text-cyan-400" />
              {title}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">{subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Photo Capture / Upload Box */}
          <div>
            <label className="block font-semibold text-slate-300 mb-2">
              Foto Barang Bukti Serah Terima / Kembali
            </label>

            {!photoPreview ? (
              <div className="p-6 rounded-xl border-2 border-dashed border-white/20 bg-slate-950/50 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto">
                  <Camera className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">
                    Pilih Metode Pengambilan Foto
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Dukung kamera HP langsung atau unggah file foto dari galeri
                  </p>
                </div>

                <div className="flex items-center justify-center gap-2 pt-1">
                  {/* Direct Camera Button */}
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="px-3.5 py-2 rounded-xl bg-cyan-600/20 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-600/30 font-bold flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Jepret Foto Kamera</span>
                  </button>

                  {/* File Upload Button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 border border-white/15 text-slate-200 hover:text-white hover:border-white/30 font-bold flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <Upload className="w-4 h-4 text-indigo-400" />
                    <span>Pilih dari Galeri/File</span>
                  </button>
                </div>

                {/* Hidden Inputs */}
                <input
                  type="file"
                  ref={cameraInputRef}
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="relative rounded-xl overflow-hidden border border-cyan-500/30 bg-slate-950 p-2 text-center">
                <img
                  src={photoPreview}
                  alt="Bukti Peminjaman"
                  className="max-h-56 mx-auto rounded-lg object-contain shadow-md"
                />
                <button
                  type="button"
                  onClick={handleClearPhoto}
                  className="absolute top-4 right-4 p-1.5 rounded-full bg-rose-600 text-white hover:bg-rose-500 shadow-lg"
                  title="Hapus / Foto Ulang"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
                <span className="block text-[10px] text-emerald-400 font-semibold mt-1 flex items-center justify-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Foto berhasil diambil
                </span>
              </div>
            )}
          </div>

          {/* Notes Input */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Catatan Kondisi Barang / Serah Terima (Opsional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Keterangan kelengkapan kabel, adaptor, kondisi fisik, dll."
              className="w-full glass-input text-xs"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-slate-800 border border-white/10 text-slate-300 hover:text-white"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl gradient-btn text-white font-bold flex items-center gap-1.5 shadow-glow disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Konfirmasi & Simpan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default LoanPhotoProofModal;

