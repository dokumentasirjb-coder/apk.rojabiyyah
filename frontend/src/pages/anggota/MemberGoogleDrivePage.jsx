import React, { useState } from 'react';
import {
  FolderOpen,
  Download,
  ExternalLink,
  Sparkles,
  Info,
  CheckCircle2,
  Copy,
  Check,
  RefreshCw,
} from 'lucide-react';
import { useThemeStore } from '../../store/themeStore.js';
import { toast } from '../../store/toastStore.js';

export const MemberGoogleDrivePage = () => {
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
    toast.success('Link Google Drive berhasil disalin!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleRefresh = () => {
    setIframeKey((prev) => prev + 1);
    toast.info('Menyegarkan pratinjau berkas...');
  };

  return (
    <div className="space-y-6 select-none">
      {/* Top Banner */}
      <div className="glass-card p-6 border border-white/10 bg-gradient-to-r from-indigo-950/70 via-slate-900/80 to-cyan-950/60 rounded-2xl shadow-glass flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
              <FolderOpen className="w-3.5 h-3.5" />
              Pusat Unduhan & Dokumentasi
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Hak Akses: Lihat & Download
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Berkas & Dokumentasi Resmi
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
            Akses dan unduh materi resmi kegiatan seperti foto dokumentasi, video haul, desain media,
            serta panduan tugas lapangan yang telah diunggah oleh tim admin & panitia.
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
            title="Muat ulang tampilan folder"
          >
            <RefreshCw className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <a
            href={driveUrl}
            target="_blank"
            rel="noreferrer"
            className="px-5 py-2.5 rounded-xl gradient-btn text-xs font-bold text-white flex items-center gap-2 shadow-glow hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Buka & Download di Google Drive</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Embedded Google Drive Explorer */}
      <div className="glass-card p-5 border border-white/10 rounded-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Jelajahi Berkas & Unduh File</h3>
          </div>
          <span className="text-[11px] text-slate-400">Pratinjau Cloud Storage</span>
        </div>

        {/* Embedded Iframe */}
        <div className="w-full h-[620px] rounded-xl overflow-hidden border border-white/15 bg-white shadow-2xl relative">
          <iframe
            key={iframeKey}
            src={embedUrl}
            title="Google Drive Folder Explorer"
            className="w-full h-full border-0"
            allow="autoplay"
          />
        </div>

        {/* Info Guide */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-white/5 flex items-start gap-2.5 text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Cara Download:</strong> Klik dua kali pada file di pratinjau di atas, atau klik tombol <strong>"Buka & Download di Google Drive"</strong> di kanan atas untuk mengunduh banyak file sekaligus.
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-white/5 flex items-start gap-2.5 text-slate-300">
            <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Perlu File Khusus?</strong> Jika Anda membutuhkan materi foto mentah atau rekaman resolusi tinggi yang belum ada, hubungi tim koordinator dokumentasi.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberGoogleDrivePage;

