import React, { useState } from 'react';
import {
  FolderOpen,
  Upload,
  ExternalLink,
  Sparkles,
  Download,
  Info,
  ShieldCheck,
  RefreshCw,
  Copy,
  Check,
} from 'lucide-react';
import { useThemeStore } from '../../store/themeStore.js';
import { toast } from '../../store/toastStore.js';

export const AdminGoogleDrivePage = () => {
  const { branding } = useThemeStore();
  const driveUrl =
    branding?.googleDriveUrl ||
    'https://drive.google.com/drive/folders/1l91WsFBV_sZ89DlvzvSXlgedX0pOwsfa?usp=sharing';

  const [copied, setCopied] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  // Extract folder ID from Google Drive URL
  const getFolderId = (url) => {
    if (!url) return '1l91WsFBV_sZ89DlvzvSXlgedX0pOwsfa';
    const match = url.match(/folders\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : '1l91WsFBV_sZ89DlvzvSXlgedX0pOwsfa';
  };

  const folderId = getFolderId(driveUrl);
  const embedUrl = `https://drive.google.com/embeddedfolderview?id=${folderId}#grid`;

  const handleCopy = () => {
    navigator.clipboard.writeText(driveUrl);
    setCopied(true);
    toast.success('Tautan Google Drive berhasil disalin ke clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleRefresh = () => {
    setIframeKey((prev) => prev + 1);
    toast.info('Menyegarkan pratinjau Google Drive...');
  };

  return (
    <div className="space-y-6 select-none">
      {/* Top Banner / Actions */}
      <div className="glass-card p-6 border border-white/10 bg-gradient-to-r from-indigo-950/70 via-slate-900/80 to-cyan-950/60 rounded-2xl shadow-glass flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
              <FolderOpen className="w-3.5 h-3.5" />
              Pusat Cloud Storage & Dokumentasi
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Akses Admin: Upload & Kelola
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Google Drive Berkas & Dokumentasi
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Folder Google Drive resmi untuk mengunggah materi desain, foto haul & rojabiyyah, rekaman video,
            dan berkas penugasan yang dapat diakses serta diunduh oleh seluruh anggota yang terdaftar.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0">
          <button
            onClick={handleCopy}
            className="px-3.5 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-900 border border-white/15 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-cyan-400" />}
            <span>{copied ? 'Tersalin' : 'Salin Link'}</span>
          </button>

          <button
            onClick={handleRefresh}
            className="px-3.5 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-900 border border-white/15 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
            title="Muat ulang pratinjau"
          >
            <RefreshCw className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <a
            href={driveUrl}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 rounded-xl gradient-btn text-xs font-bold text-white flex items-center gap-2 shadow-glow hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Upload className="w-4 h-4" />
            <span>Buka Google Drive untuk Upload</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Guide Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold mb-2">
            1
          </div>
          <h4 className="font-bold text-white mb-1">Unggah File & Dokumen</h4>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            Klik tombol <strong>"Buka Google Drive untuk Upload"</strong> di atas. Anda dapat drag & drop file foto, video, desain spanduk, atau PDF ke folder Drive.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold mb-2">
            2
          </div>
          <h4 className="font-bold text-white mb-1">Otomatis Terlihat di Anggota</h4>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            File yang Anda unggah langsung dapat dilihat dan diunduh oleh anggota yang membuka menu <strong>Drive Berkas</strong> di dashboard anggota mereka.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold mb-2">
            3
          </div>
          <h4 className="font-bold text-white mb-1">Pengaturan Izin & Link</h4>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            Folder Google Drive dapat diganti kapan saja melalui menu <strong>Pengaturan Sistem & Branding</strong> tab identitas.
          </p>
        </div>
      </div>

      {/* Embedded Google Drive Explorer */}
      <div className="glass-card p-5 border border-white/10 rounded-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Pratinjau Folder Google Drive Langsung</h3>
          </div>
          <span className="text-[11px] text-slate-400">ID Folder: <code className="text-cyan-300 font-mono">{folderId}</code></span>
        </div>

        {/* Embedded Iframe */}
        <div className="w-full h-[650px] rounded-xl overflow-hidden border border-white/15 bg-white shadow-2xl relative">
          <iframe
            key={iframeKey}
            src={embedUrl}
            title="Google Drive Folder Explorer"
            className="w-full h-full border-0"
            allow="autoplay"
          />
        </div>

        {/* Footer Notice */}
        <div className="p-3 rounded-xl bg-slate-900/70 border border-white/5 flex items-start gap-2.5 text-xs text-slate-400">
          <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
          <span>
            Jika pratinjau di atas meminta login akun Google, pastikan Anda telah login ke akun Google di browser Anda, atau klik tombol <strong>"Buka Google Drive untuk Upload"</strong> di kanan atas untuk membuka langsung di tab baru.
          </span>
        </div>
      </div>
    </div>
  );
};

export default AdminGoogleDrivePage;

