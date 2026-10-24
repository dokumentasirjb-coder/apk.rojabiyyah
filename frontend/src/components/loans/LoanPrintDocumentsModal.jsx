import React, { useState, useEffect } from 'react';
import {
  Printer,
  FileText,
  Truck,
  QrCode,
  X,
  Check,
  Calendar,
  User,
  Shield,
  Layers,
  Phone,
  Barcode,
  Sparkles,
} from 'lucide-react';
import { formatDate } from '../../lib/utils.js';
import { generateQrDataUrl, generateBarcodeDataUrl } from '../../utils/labelGenerator.js';
import { useThemeStore } from '../../store/themeStore.js';

export const LoanPrintDocumentsModal = ({ isOpen, onClose, loan }) => {
  const [activeDoc, setActiveDoc] = useState('bukti'); // 'bukti' | 'surat_jalan' | 'stiker'
  const [stickerMode, setStickerMode] = useState('multi'); // 'multi' | 'large' | 'medium' | 'small'
  const [qrCodeUrls, setQrCodeUrls] = useState({});
  const [barcodeUrls, setBarcodeUrls] = useState({});

  // Ambil kop dari branding store (dinamis, diatur admin sekali saja)
  const { branding } = useThemeStore();
  const KOP_NAMA = branding.kopNama || 'ADMINISTRASI ROJABIYYAAH 2026 • LOGISTIK';
  const SUB_TEMA_LENGKAP = branding.kopSubtitle || 'Haul ke-5 Al-Maghfurlah K.H. Moch. Djamaluddin Achmad & Rojabiyyah 2026';
  const SUB_TEMA_SINGKAT = branding.kopSubtitleSingkat || 'Haul Ke-5 & Rojabiyyah 2026';
  const LOGO_URL = branding.logoUrl?.startsWith('/uploads') ? `http://localhost:5000${branding.logoUrl}` : (branding.logoUrl || '/logo-rojabiyyah.png');

  // Generate QR codes and Barcodes for all items in the loan
  useEffect(() => {
    if (!loan || !loan.loanItems) return;

    const generateCodes = async () => {
      const qrs = {};
      const bcs = {};

      for (const item of loan.loanItems) {
        const itemCode = item.inventoryItem?.code || 'ITEM';
        const itemName = item.inventoryItem?.name || 'Barang Logistik';
        const borrower = loan.borrowerName || 'Peminjam';
        const ownership =
          item.inventoryItem?.source === 'LOAN_FROM_INSTITUTION'
            ? `Pinjaman dari ${item.inventoryItem?.institution?.name || 'Lembaga Mitra'}`
            : 'Milik Internal Rojabiyyah';

        // Scannable text content
        const qrText = [
          `[LOGISTIK - ${SUB_TEMA_SINGKAT}]`,
          `Barang: ${itemName}`,
          `Kode: ${itemCode}`,
          `Peminjam: ${borrower}`,
          `No. Pinjam: ${loan.loanCode}`,
          `Kepemilikan: ${ownership}`,
          `Tenggat: ${formatDate(loan.endDate)}`,
          `Acara: ${loan.purpose || SUB_TEMA_LENGKAP}`,
        ].join('\n');

        qrs[item.id] = await generateQrDataUrl(qrText, 180);
        bcs[item.id] = generateBarcodeDataUrl(itemCode, {
          width: 1.6,
          height: 36,
          fontSize: 9,
        });
      }

      setQrCodeUrls(qrs);
      setBarcodeUrls(bcs);
    };

    generateCodes();
  }, [loan]);

  if (!isOpen || !loan) return null;

  const handlePrint = () => {
    window.print();
  };

  const getStatusDisplay = () => {
    switch (loan.status) {
      case 'BORROWED':
        return 'DIPINJAM';
      case 'RETURNED':
        return 'DIKEMBALIKAN';
      case 'APPROVED':
        return 'DISETUJUI';
      case 'PENDING':
        return 'MENUNGGU';
      case 'REJECTED':
        return 'DITOLAK';
      default:
        return loan.status || 'DIPINJAM';
    }
  };

  const adminApproverName = loan.approvedBy?.username || 'muizzun';
  const borrowerEmail = loan.member?.user?.email || (loan.member?.phone ? `WA: ${loan.member.phone}` : 'alfani27@gmail.com');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto print:static print:p-0 print:bg-white print:overflow-visible print:z-auto print:block">
      {/* Outer Card */}
      <div className="relative w-full max-w-4xl bg-slate-900 border border-white/15 rounded-2xl shadow-2xl flex flex-col max-h-[94vh] overflow-hidden print:max-h-none print:m-0 print:p-0 print:border-none print:shadow-none print:bg-white print:text-black print:overflow-visible print:w-full print:max-w-none">
        
        {/* Top Controls (Hidden in Print) */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-white/10 bg-slate-950/90 print:hidden flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">
              Dokumen:
            </span>
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-white/10 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveDoc('bukti')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                  activeDoc === 'bukti'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Bukti Peminjaman</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveDoc('surat_jalan')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                  activeDoc === 'surat_jalan'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Surat Jalan</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveDoc('stiker')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                  activeDoc === 'stiker'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Barcode className="w-3.5 h-3.5" />
                <span>Stiker A4 (Multi-Ukuran)</span>
              </button>
            </div>
          </div>

          {/* Sub-selector for Stiker mode */}
          {activeDoc === 'stiker' && (
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-white/10 text-[11px] font-medium">
              <span className="text-slate-400 px-1 hidden sm:inline">Ukuran:</span>
              <button
                type="button"
                onClick={() => setStickerMode('multi')}
                className={`px-2 py-1 rounded ${stickerMode === 'multi' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                1 Lembar A4 (Multi-Ukuran)
              </button>
              <button
                type="button"
                onClick={() => setStickerMode('large')}
                className={`px-2 py-1 rounded ${stickerMode === 'large' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                Besar (Box)
              </button>
              <button
                type="button"
                onClick={() => setStickerMode('medium')}
                className={`px-2 py-1 rounded ${stickerMode === 'medium' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                Sedang
              </button>
              <button
                type="button"
                onClick={() => setStickerMode('small')}
                className={`px-2 py-1 rounded ${stickerMode === 'small' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                Kecil/Mini
              </button>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              type="button"
              className="px-4 py-2 rounded-xl gradient-btn text-xs font-bold text-white flex items-center gap-2 shadow-glow"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Sekarang (Print A4)</span>
            </button>
            <button
              onClick={onClose}
              type="button"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Viewport */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-950/40 print:p-0 print:bg-white print:overflow-visible">
          
          {/* ========================================================================= */}
          {/* 1. DOKUMEN: BUKTI PEMINJAMAN BARANG (PERSIS SEPERTI FOTO CONTOH)         */}
          {/* ========================================================================= */}
          {activeDoc === 'bukti' && (
            <div className="bg-white text-slate-900 p-8 sm:p-12 rounded-2xl shadow-xl max-w-2xl mx-auto border border-slate-200 print:border-none print:shadow-none print:p-6 print:max-w-none text-xs font-sans leading-relaxed">
              
              {/* Card Header (Persis Foto) */}
              <div className="text-center pb-4 mb-2">
                <h2 className="text-xl sm:text-2xl font-black tracking-wide text-emerald-900 uppercase">
                  BUKTI PEMINJAMAN BARANG
                </h2>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-800 tracking-wider mt-0.5 uppercase">
                  {KOP_NAMA}
                </h3>
                <p className="text-xs font-bold text-emerald-800 mt-1">
                  {SUB_TEMA_LENGKAP}
                </p>
                {/* Horizontal Green Bar (Persis Foto) */}
                <div className="w-full h-1 bg-emerald-900 mt-3 rounded-full" />
              </div>

              {/* Table List Rows (Persis Foto) */}
              <div className="divide-y divide-slate-200 text-xs my-4">
                <div className="py-2.5 flex items-start">
                  <span className="w-44 font-bold text-slate-800">Nama Peminjam</span>
                  <span className="flex-1 text-slate-900 font-medium">{loan.borrowerName}</span>
                </div>

                <div className="py-2.5 flex items-start">
                  <span className="w-44 font-bold text-slate-800">Email / Kontak</span>
                  <span className="flex-1 text-slate-900">{borrowerEmail}</span>
                </div>

                <div className="py-2.5 flex items-start">
                  <span className="w-44 font-bold text-slate-800">Barang</span>
                  <div className="flex-1 text-slate-900 space-y-1">
                    {loan.loanItems?.map((li, idx) => (
                      <div key={li.id} className="font-medium">
                        {idx + 1}. {li.inventoryItem?.name} ({li.quantity} Unit)
                        {li.inventoryItem?.source === 'LOAN_FROM_INSTITUTION' && (
                          <span className="ml-1 text-[10px] text-emerald-700 font-semibold">
                            [Pinjaman dari {li.inventoryItem?.institution?.name || 'Mitra'}]
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="py-2.5 flex items-start">
                  <span className="w-44 font-bold text-slate-800">Kode Barang</span>
                  <div className="flex-1 text-slate-900 font-mono font-semibold">
                    {loan.loanItems?.map((li) => li.inventoryItem?.code).filter(Boolean).join(', ')}
                  </div>
                </div>

                <div className="py-2.5 flex items-start">
                  <span className="w-44 font-bold text-slate-800">Jumlah</span>
                  <span className="flex-1 text-slate-900 font-semibold">
                    {loan.loanItems?.reduce((acc, curr) => acc + (curr.quantity || 1), 0)} Unit
                  </span>
                </div>

                <div className="py-2.5 flex items-start">
                  <span className="w-44 font-bold text-slate-800">Tanggal Pinjam</span>
                  <span className="flex-1 text-slate-900">{formatDate(loan.startDate)}</span>
                </div>

                <div className="py-2.5 flex items-start">
                  <span className="w-44 font-bold text-slate-800">Rencana Kembali</span>
                  <span className="flex-1 text-slate-900">{formatDate(loan.endDate)}</span>
                </div>

                <div className="py-2.5 flex items-start">
                  <span className="w-44 font-bold text-slate-800">Tanggal Kembali Realisasi</span>
                  <span className="flex-1 text-slate-900">
                    {loan.returnDate ? formatDate(loan.returnDate) : '-'}
                  </span>
                </div>

                <div className="py-2.5 flex items-start">
                  <span className="w-44 font-bold text-slate-800">Keperluan</span>
                  <span className="flex-1 text-slate-900 uppercase font-semibold">
                    {loan.purpose}
                  </span>
                </div>

                <div className="py-2.5 flex items-start">
                  <span className="w-44 font-bold text-slate-800">Status</span>
                  <span className="flex-1 text-emerald-700 font-black tracking-wide uppercase">
                    {getStatusDisplay()}
                  </span>
                </div>

                <div className="py-2.5 flex items-start">
                  <span className="w-44 font-bold text-slate-800">Catatan Admin</span>
                  <span className="flex-1 text-slate-700 italic">
                    {loan.adminNotes || `Disetujui oleh admin pada ${formatDate(loan.createdAt, true)}`}
                  </span>
                </div>
              </div>

              {/* Tanda Tangan Dua Kolom (Persis Foto: Peminjam & Admin) */}
              <div className="grid grid-cols-2 gap-8 text-center pt-12 pb-4 mt-6">
                <div>
                  <p className="text-slate-600 text-xs mb-20 font-medium">Peminjam</p>
                  <p className="font-extrabold text-sm text-slate-900">{loan.borrowerName}</p>
                </div>
                <div>
                  <p className="text-slate-600 text-xs mb-20 font-medium">Admin</p>
                  <p className="font-extrabold text-sm text-slate-900">{adminApproverName}</p>
                </div>
              </div>

              <div className="text-center pt-4 border-t border-slate-100 text-[10px] text-slate-400">
                Kode Referensi: {loan.loanCode} • Dicetak pada: {new Date().toLocaleDateString('id-ID')}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 2. DOKUMEN: SURAT JALAN PENGIRIMAN & MOBILISASI LOGISTIK                  */}
          {/* ========================================================================= */}
          {activeDoc === 'surat_jalan' && (
            <div className="bg-white text-slate-900 p-8 sm:p-12 rounded-2xl shadow-xl max-w-3xl mx-auto border border-slate-200 print:border-none print:shadow-none print:p-6 print:max-w-none text-xs font-sans leading-relaxed">
              
              {/* Kop Surat Jalan */}
              <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <img
                    src={LOGO_URL}
                    alt="Logo"
                    className="w-14 h-14 object-contain"
                  />
                  <div>
                    <h2 className="text-lg font-black uppercase tracking-tight text-slate-900">
                      {KOP_NAMA}
                    </h2>
                    <p className="text-xs font-bold text-emerald-800">
                      {SUB_TEMA_LENGKAP}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Divisi Transportasi & Pengawalan Logistik Penugasan
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2.5 py-0.5 rounded font-mono font-bold text-[11px] bg-emerald-100 text-emerald-900 border border-emerald-300">
                    SURAT JALAN RESMI
                  </span>
                  <p className="font-mono font-bold text-slate-900 mt-1 text-xs">
                    SJ/HAUL5/{loan.loanCode}
                  </p>
                </div>
              </div>

              {/* Judul Dokumen */}
              <div className="text-center my-3">
                <h3 className="text-base font-black uppercase underline tracking-wider text-slate-900">
                  SURAT JALAN PENGELUARAN & TRANSPORTASI BARANG
                </h3>
                <span className="text-[11px] text-slate-600">
                  Acara: <strong>{SUB_TEMA_SINGKAT}</strong> • Ref Peminjaman: <strong className="font-mono">{loan.loanCode}</strong>
                </span>
              </div>

              {/* Data Mobilisasi */}
              <div className="grid grid-cols-2 gap-4 my-4 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                <div className="space-y-1">
                  <div className="flex">
                    <span className="w-32 text-slate-500 font-semibold">Petugas Pembawa</span>
                    <span className="font-bold text-slate-900">: {loan.borrowerName}</span>
                  </div>
                  <div className="flex">
                    <span className="w-32 text-slate-500 font-semibold">Kontak / No WA</span>
                    <span className="text-slate-800">: {loan.member?.phone || '-'}</span>
                  </div>
                  <div className="flex">
                    <span className="w-32 text-slate-500 font-semibold">Tujuan / Lokasi</span>
                    <span className="font-semibold text-slate-900">: {loan.purpose}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex">
                    <span className="w-32 text-slate-500 font-semibold">Tanggal Berangkat</span>
                    <span className="font-bold text-slate-900">: {formatDate(loan.startDate)}</span>
                  </div>
                  <div className="flex">
                    <span className="w-32 text-slate-500 font-semibold">Estimasi Kembali</span>
                    <span className="font-bold text-slate-900">: {formatDate(loan.endDate)}</span>
                  </div>
                  <div className="flex">
                    <span className="w-32 text-slate-500 font-semibold">Status Izin Jalan</span>
                    <span className="font-bold text-emerald-700">: RESMI DIIZINKAN</span>
                  </div>
                </div>
              </div>

              {/* Tabel Barang Surat Jalan */}
              <div className="my-4">
                <table className="w-full border-collapse border border-slate-300 text-left text-xs">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-300 font-bold text-slate-800 text-[11px]">
                      <th className="border border-slate-300 py-2 px-2.5 text-center w-8">NO</th>
                      <th className="border border-slate-300 py-2 px-3">KODE ALAT</th>
                      <th className="border border-slate-300 py-2 px-3">DESKRIPSI BARANG</th>
                      <th className="border border-slate-300 py-2 px-3">ASAL KEPEMILIKAN</th>
                      <th className="border border-slate-300 py-2 px-2 text-center w-12">QTY</th>
                      <th className="border border-slate-300 py-2 px-2 text-center w-16">CHECK GO</th>
                      <th className="border border-slate-300 py-2 px-2 text-center w-16">CHECK BACK</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loan.loanItems?.map((li, idx) => (
                      <tr key={li.id} className="border-b border-slate-200">
                        <td className="border border-slate-300 py-2 px-2 text-center font-mono font-medium">
                          {idx + 1}
                        </td>
                        <td className="border border-slate-300 py-2 px-3 font-mono font-bold text-emerald-800">
                          {li.inventoryItem?.code}
                        </td>
                        <td className="border border-slate-300 py-2 px-3 font-semibold text-slate-900">
                          {li.inventoryItem?.name}
                        </td>
                        <td className="border border-slate-300 py-2 px-3 text-[11px] text-slate-600">
                          {li.inventoryItem?.source === 'LOAN_FROM_INSTITUTION' ? (
                            <span className="font-semibold text-cyan-800">
                              Pinjaman {li.inventoryItem?.institution?.name || 'Mitra'}
                            </span>
                          ) : (
                            <span className="font-semibold text-indigo-800">
                              Milik Internal Rojabiyyah
                            </span>
                          )}
                        </td>
                        <td className="border border-slate-300 py-2 px-2 text-center font-bold">
                          {li.quantity}
                        </td>
                        <td className="border border-slate-300 py-2 px-2 text-center font-mono">
                          [  ✓  ]
                        </td>
                        <td className="border border-slate-300 py-2 px-2 text-center font-mono">
                          [     ]
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="text-[10px] text-slate-500 italic mb-6">
                * Surat jalan ini adalah dokumen sah pengawalan dan izin pengangkutan perlengkapan di jalan raya dan pos pengamanan {SUB_TEMA_SINGKAT}.
              </p>

              {/* Tanda Tangan 3 Pihak */}
              <div className="grid grid-cols-3 gap-6 text-center pt-4 border-t border-slate-200">
                <div>
                  <p className="text-slate-600 text-xs mb-16 font-medium">Pengirim (Gudang/Admin),</p>
                  <p className="font-bold underline text-slate-900">{adminApproverName}</p>
                  <span className="text-[10px] text-slate-500">Petugas Logistik</span>
                </div>
                <div>
                  <p className="text-slate-600 text-xs mb-16 font-medium">Petugas Pembawa / Driver,</p>
                  <p className="font-bold underline text-slate-900">{loan.borrowerName}</p>
                  <span className="text-[10px] text-slate-500">Peminjam Lapangan</span>
                </div>
                <div>
                  <p className="text-slate-600 text-xs mb-16 font-medium">Penerima Lokasi Tugas,</p>
                  <p className="font-bold underline text-slate-900">( ........................................ )</p>
                  <span className="text-[10px] text-slate-500">Penanggung Jawab Acara</span>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 3. DOKUMEN: STIKER A4 DENGAN BEBERAPA UKURAN (MULTI-SIZE SHEET)           */}
          {/* ========================================================================= */}
          {activeDoc === 'stiker' && (
            <div className="max-w-4xl mx-auto space-y-4">
              {/* Notice Banner */}
              <div className="bg-slate-900/90 border border-white/10 p-3.5 rounded-xl text-slate-300 text-xs flex items-center justify-between print:hidden">
                <div className="flex items-center gap-2.5">
                  <Barcode className="w-5 h-5 text-amber-400" />
                  <div>
                    <p className="font-bold text-white">
                      Lembar Stiker Penanda Barang Ukuran A4 (Siap Cetak pada Kertas Stiker Label)
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Dilengkapi Barcode & QR Code cerdas. Ketika di-scan oleh kamera HP, langsung menampilkan identitas pemilik, peminjam, dan acara!
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-amber-400 font-bold block">{loan.loanItems?.length || 0} Barang</span>
                  <span className="text-[10px] text-slate-400">{SUB_TEMA_SINGKAT}</span>
                </div>
              </div>

              {/* Printable A4 Sticker Sheet */}
              <div className="bg-white text-slate-900 p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-200 print:border-none print:shadow-none print:p-2 print:m-0 font-sans">
                
                {/* Header Sheet A4 */}
                <div className="border-b-2 border-slate-900 pb-2 mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src={LOGO_URL} alt="Logo" className="w-7 h-7 object-contain" />
                    <div>
                      <span className="text-xs font-black uppercase tracking-tight text-slate-900 block leading-tight">
                        {KOP_NAMA}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-800">
                        {SUB_TEMA_LENGKAP}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-xs text-slate-900">
                      LEMBAR STIKER LABEL A4
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      Ref: {loan.loanCode}
                    </span>
                  </div>
                </div>

                {/* Iterate over each borrowed item in loan */}
                <div className="space-y-6">
                  {loan.loanItems?.map((li) => {
                    const item = li.inventoryItem;
                    const qrUrl = qrCodeUrls[li.id];
                    const bcUrl = barcodeUrls[li.id];
                    const isInstitution = item?.source === 'LOAN_FROM_INSTITUTION';
                    const ownershipText = isInstitution
                      ? `Pinjaman: ${item?.institution?.name || 'Mitra'}`
                      : 'Milik Internal Rojabiyyah';

                    return (
                      <div key={li.id} className="space-y-4 pb-6 border-b border-dashed border-slate-300 last:border-none">
                        
                        {/* ----------------------------------------------------------------- */}
                        {/* UKURAN 1: STIKER BESAR (Large / Untuk Box, Hardcase, Boks Alat)  */}
                        {/* ----------------------------------------------------------------- */}
                        {(stickerMode === 'multi' || stickerMode === 'large') && (
                          <div className="border-2 border-slate-900 rounded-xl p-3 bg-white shadow-sm flex flex-col justify-between relative overflow-hidden">
                            {/* Sticker Subhead */}
                            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2 bg-slate-900 text-white -m-3 p-2.5 rounded-t-lg">
                              <div className="flex items-center gap-2">
                                <img src={LOGO_URL} alt="Logo" className="w-5 h-5 object-contain bg-white rounded p-0.5" />
                                <div>
                                  <span className="text-[11px] font-black uppercase tracking-wider block leading-tight">
                                    {KOP_NAMA}
                                  </span>
                                  <span className="text-[8px] font-semibold text-emerald-300">
                                    {SUB_TEMA_LENGKAP}
                                  </span>
                                </div>
                              </div>
                              <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-mono text-[9px] font-extrabold uppercase">
                                STIKER BOKS / HARDCASE
                              </span>
                            </div>

                            {/* Main Body with Barcode & QR Code */}
                            <div className="grid grid-cols-12 gap-3 items-center mt-2">
                              {/* Left: QR Code for Phone Scanner */}
                              <div className="col-span-3 text-center flex flex-col items-center justify-center p-1 border border-slate-300 rounded-lg bg-slate-50">
                                {qrUrl ? (
                                  <img src={qrUrl} alt="QR Code" className="w-20 h-20 object-contain mx-auto" />
                                ) : (
                                  <div className="w-20 h-20 bg-slate-200 animate-pulse rounded" />
                                )}
                                <span className="text-[8px] font-bold text-slate-600 mt-0.5 uppercase tracking-tighter">
                                  SCAN HP UNTUK CEK
                                </span>
                              </div>

                              {/* Middle: Details */}
                              <div className="col-span-6 space-y-1 text-xs">
                                <div>
                                  <span className="text-[9px] font-bold text-slate-500 uppercase block">
                                    NAMA ALAT / PERLENGKAPAN:
                                  </span>
                                  <h4 className="text-sm font-black text-slate-900 leading-tight">
                                    {item?.name}
                                  </h4>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-[10px]">
                                  <div>
                                    <span className="text-slate-500 font-semibold block">KODE ALAT:</span>
                                    <span className="font-mono font-extrabold text-xs text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 inline-block">
                                      {item?.code}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-slate-500 font-semibold block">ASAL BARANG:</span>
                                    <span className={`font-bold text-[10px] ${isInstitution ? 'text-cyan-800' : 'text-slate-900'}`}>
                                      {ownershipText}
                                    </span>
                                  </div>
                                </div>

                                <div className="text-[10px] pt-0.5">
                                  <span className="text-slate-500 font-semibold">PEMINJAM / PIC: </span>
                                  <span className="font-bold text-slate-900">{loan.borrowerName}</span>
                                  <span className="text-slate-500"> ({loan.member?.division || 'Divisi'})</span>
                                </div>

                                <div className="text-[9px] text-slate-600 flex items-center gap-2">
                                  <span>No. Pinjam: <strong className="font-mono">{loan.loanCode}</strong></span>
                                  <span>•</span>
                                  <span>Tenggat: <strong className="text-rose-700">{formatDate(loan.endDate)}</strong></span>
                                </div>
                              </div>

                              {/* Right: 1D Barcode */}
                              <div className="col-span-3 text-center flex flex-col items-center justify-center border-l border-slate-200 pl-2">
                                {bcUrl ? (
                                  <img src={bcUrl} alt="Barcode" className="max-w-full h-10 object-contain mx-auto" />
                                ) : (
                                  <div className="w-full h-10 bg-slate-200 animate-pulse rounded" />
                                )}
                                <span className="font-mono text-[9px] font-extrabold text-slate-800 mt-1">
                                  {item?.code}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* ----------------------------------------------------------------- */}
                        {/* UKURAN 2: STIKER SEDANG (Medium / Body Kamera, Mixer, Proyektor) */}
                        {/* ----------------------------------------------------------------- */}
                        {(stickerMode === 'multi' || stickerMode === 'medium') && (
                          <div className="grid grid-cols-2 gap-3">
                            {[1, 2].map((copyIdx) => (
                              <div
                                key={copyIdx}
                                className="border border-slate-800 rounded-lg p-2.5 bg-white shadow-sm flex items-center justify-between gap-2"
                              >
                                <div className="flex-1 min-w-0 space-y-0.5 text-xs">
                                  <div className="flex items-center justify-between border-b border-slate-200 pb-0.5">
                                    <span className="text-[8px] font-black uppercase text-emerald-900 truncate">
                                      {SUB_TEMA_SINGKAT}
                                    </span>
                                    <span className="font-mono font-extrabold text-[10px] text-emerald-800 bg-emerald-50 px-1 rounded">
                                      {item?.code}
                                    </span>
                                  </div>

                                  <p className="font-extrabold text-[11px] text-slate-900 truncate mt-0.5">
                                    {item?.name}
                                  </p>

                                  <div className="text-[9px] text-slate-700">
                                    <span>Peminjam: </span>
                                    <strong className="text-slate-900">{loan.borrowerName}</strong>
                                  </div>

                                  <div className="text-[8px] text-slate-500 truncate">
                                    <span>Asal: </span>
                                    <strong className={isInstitution ? 'text-cyan-800' : 'text-slate-700'}>
                                      {ownershipText}
                                    </strong>
                                  </div>
                                </div>

                                {/* QR Code on the right */}
                                <div className="text-center flex-shrink-0">
                                  {qrUrl && <img src={qrUrl} alt="QR" className="w-12 h-12 object-contain" />}
                                  <span className="text-[7px] font-bold text-slate-500 block uppercase">
                                    SCAN HP
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* ----------------------------------------------------------------- */}
                        {/* UKURAN 3: STIKER KECIL / MINI (Small / Lensa, Mic Clip, Baterai)  */}
                        {/* ----------------------------------------------------------------- */}
                        {(stickerMode === 'multi' || stickerMode === 'small') && (
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {[1, 2, 3, 4].map((miniIdx) => (
                              <div
                                key={miniIdx}
                                className="border border-slate-600 rounded p-1.5 bg-slate-50 flex items-center gap-1.5 text-[8px]"
                              >
                                {qrUrl && <img src={qrUrl} alt="QR" className="w-7 h-7 object-contain flex-shrink-0" />}
                                <div className="min-w-0 leading-tight">
                                  <span className="font-mono font-black text-slate-900 block truncate">
                                    {item?.code}
                                  </span>
                                  <span className="text-slate-600 block truncate">
                                    {loan.borrowerName}
                                  </span>
                                  <span className="text-emerald-700 font-bold block truncate text-[7px]">
                                    {SUB_TEMA_SINGKAT}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>

                {/* Footer Sheet */}
                <div className="mt-4 pt-2 border-t border-slate-300 text-center text-[9px] text-slate-500 flex items-center justify-between">
                  <span>Properti Resmi Logistik {branding.appName || 'Rojabiyyah'} • {SUB_TEMA_SINGKAT}</span>
                  <span>Kertas Stiker Standar A4 (Gunting/Kupas sesuai pola kotak)</span>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
export default LoanPrintDocumentsModal;
