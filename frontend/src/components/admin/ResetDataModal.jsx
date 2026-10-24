import React, { useState } from 'react';
import {
  AlertTriangle,
  Trash2,
  CheckCircle2,
  RefreshCw,
  ShieldAlert,
  Boxes,
  HandCoins,
  Users,
  Wallet,
  Compass,
  Building2,
  Bell,
  X,
} from 'lucide-react';
import { Modal } from '../ui/Modal.jsx';
import api from '../../api/axios.js';

export const ResetDataModal = ({ isOpen, onClose, onResetSuccess }) => {
  const [options, setOptions] = useState({
    resetLoans: true,
    resetInventory: true,
    resetMembers: true,
    resetFinance: true,
    resetRegionControl: true,
    resetInstitutions: true,
    resetLogsAndNotifications: true,
    resetCategories: false,
  });

  const [confirmText, setConfirmText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultReport, setResultReport] = useState(null);

  const REQUIRED_CONFIRM_WORD = 'RESET';

  const handleToggleOption = (key) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSelectAll = (val) => {
    setOptions({
      resetLoans: val,
      resetInventory: val,
      resetMembers: val,
      resetFinance: val,
      resetRegionControl: val,
      resetInstitutions: val,
      resetLogsAndNotifications: val,
      resetCategories: false,
    });
  };

  const handleExecuteReset = async (e) => {
    e.preventDefault();
    if (confirmText.trim().toUpperCase() !== REQUIRED_CONFIRM_WORD) {
      alert(`Mohon ketik kata '${REQUIRED_CONFIRM_WORD}' untuk mengonfirmasi tindakan ini.`);
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.post('/settings/reset-database', options);
      setResultReport(res.data.data);
      if (onResetSuccess) {
        onResetSuccess(res.data.data);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mereset database');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setResultReport(null);
    setConfirmText('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Pusat Reset & Pembersihan Data Sistem"
      maxWidth="max-w-xl"
    >
      {resultReport ? (
        <div className="space-y-4 text-xs py-2">
          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm text-white">Data Berhasil Dibersihkan!</h4>
              <p className="text-[11px] text-emerald-300/90 mt-1">
                Semua data operasional yang dipilih telah dihapus dari sistem. Database kini bersih dan siap digunakan
                kembali.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 p-3.5 rounded-xl bg-slate-900/80 border border-white/10 text-[11px]">
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/60">
              <span className="text-slate-400">Peminjaman Dihapus:</span>
              <span className="font-bold font-mono text-rose-400">{resultReport.deletedLoans || 0}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/60">
              <span className="text-slate-400">Barang Inventaris:</span>
              <span className="font-bold font-mono text-rose-400">{resultReport.deletedInventory || 0}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/60">
              <span className="text-slate-400">Data Anggota:</span>
              <span className="font-bold font-mono text-rose-400">{resultReport.deletedMembers || 0}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/60">
              <span className="text-slate-400">Transaksi Keuangan:</span>
              <span className="font-bold font-mono text-rose-400">{resultReport.deletedTransactions || 0}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/60">
              <span className="text-slate-400">Laporan Lapangan:</span>
              <span className="font-bold font-mono text-rose-400">{resultReport.deletedReports || 0}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/60">
              <span className="text-slate-400">Lembaga Mitra:</span>
              <span className="font-bold font-mono text-rose-400">{resultReport.deletedInstitutions || 0}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 text-[10px] text-slate-400">
            <strong>Catatan:</strong> Akun Super Admin Anda (<code>admin</code>) tetap utuh dan aktif.
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => {
                handleClose();
                window.location.reload();
              }}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/30 flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Selesai & Muat Ulang Halaman</span>
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleExecuteReset} className="space-y-4 text-xs">
          {/* Warning Banner */}
          <div className="p-3.5 rounded-2xl bg-rose-950/50 border border-rose-500/40 text-rose-200 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold text-white text-xs">Peringatan Tindakan Berisiko Tinggi</h4>
              <p className="text-[11px] text-rose-200/90 leading-relaxed">
                Tindakan ini akan <strong>menghapus data operasional secara permanen</strong> dari database agar Anda tidak perlu menghapusnya satu per satu di setiap menu.
              </p>
              <p className="text-[10px] text-amber-300 font-semibold pt-0.5">
                🛡️ Akun Super Admin ('admin') akan tetap aman dan tidak akan terhapus.
              </p>
            </div>
          </div>

          {/* Quick Select Buttons */}
          <div className="flex items-center justify-between pb-1">
            <span className="text-slate-300 font-bold text-xs">Pilih Data yang Ingin Dibersihkan:</span>
            <div className="flex items-center gap-2 text-[10px]">
              <button
                type="button"
                onClick={() => handleSelectAll(true)}
                className="text-rose-400 hover:text-rose-300 underline font-semibold"
              >
                Pilih Semua
              </button>
              <span className="text-slate-600">•</span>
              <button
                type="button"
                onClick={() => handleSelectAll(false)}
                className="text-slate-400 hover:text-slate-300 underline"
              >
                Batalkan Semua
              </button>
            </div>
          </div>

          {/* Checklist Items */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              {
                key: 'resetLoans',
                label: 'Semua Data Peminjaman',
                desc: 'Pengajuan, status, dan riwayat peminjaman',
                icon: HandCoins,
              },
              {
                key: 'resetInventory',
                label: 'Semua Stok Inventaris',
                desc: 'Daftar master alat & barang logistik',
                icon: Boxes,
              },
              {
                key: 'resetMembers',
                label: 'Data Anggota & Akun',
                desc: 'Biodata pendaftar & akun anggota (Admin aman)',
                icon: Users,
              },
              {
                key: 'resetFinance',
                label: 'Rekap Keuangan & Kas',
                desc: 'Transaksi pemasukan & pengeluaran uang',
                icon: Wallet,
              },
              {
                key: 'resetRegionControl',
                label: 'Kontrol Wilayah & Laporan',
                desc: 'Titik penugasan wilayah & laporan lapangan',
                icon: Compass,
              },
              {
                key: 'resetInstitutions',
                label: 'Daftar Lembaga Mitra',
                desc: 'Data pihak peminjam luar & instansi mitra',
                icon: Building2,
              },
              {
                key: 'resetLogsAndNotifications',
                label: 'Riwayat Log & Notifikasi',
                desc: 'Aktivitas audit sistem & daftar notifikasi',
                icon: Bell,
              },
            ].map((item) => {
              const Icon = item.icon;
              const isChecked = options[item.key];
              return (
                <div
                  key={item.key}
                  onClick={() => handleToggleOption(item.key)}
                  className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 select-none ${
                    isChecked
                      ? 'bg-rose-950/30 border-rose-500/40 text-white shadow-sm'
                      : 'bg-slate-900/60 border-white/5 text-slate-400 hover:border-white/10'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}}
                    className="mt-0.5 rounded text-rose-600 focus:ring-rose-500 bg-slate-900 border-white/20"
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-xs flex items-center gap-1.5">
                      <Icon className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </p>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Optional Category Reset */}
          <div
            onClick={() => handleToggleOption('resetCategories')}
            className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 select-none ${
              options.resetCategories
                ? 'bg-amber-950/30 border-amber-500/40 text-white'
                : 'bg-slate-900/40 border-white/5 text-slate-500 hover:border-white/10'
            }`}
          >
            <input
              type="checkbox"
              checked={options.resetCategories}
              onChange={() => {}}
              className="mt-0.5 rounded text-amber-600 focus:ring-amber-500 bg-slate-900 border-white/20"
            />
            <div>
              <p className="font-bold text-xs text-amber-300">Reset Kategori ke Standar Bawaan (Opsional)</p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Mengembalikan nama kategori inventaris & keuangan ke pengaturan standar awal aplikasi.
              </p>
            </div>
          </div>

          {/* Confirmation Input Word */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-white/15 space-y-2">
            <label className="block text-slate-300 font-semibold text-xs">
              Ketik kata <span className="font-mono text-rose-400 font-bold bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-500/30">RESET</span> untuk konfirmasi:
            </label>
            <input
              type="text"
              placeholder="Ketik RESET di sini..."
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full glass-input text-xs font-mono uppercase tracking-widest text-rose-300 placeholder:text-slate-600 placeholder:tracking-normal placeholder:font-sans"
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-white/10">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={
                isSubmitting ||
                confirmText.trim().toUpperCase() !== REQUIRED_CONFIRM_WORD ||
                !Object.values(options).some(Boolean)
              }
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-rose-900/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Membersihkan Data...' : 'Hapus Semua Data Sekarang'}</span>
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};

