import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatRupiah(amount) {
  if (amount === null || amount === undefined) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString, includeTime = false) {
  if (!dateString) return '-';
  const options = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  };
  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }
  return new Date(dateString).toLocaleDateString('id-ID', options);
}

export function getImageUrl(path) {
  if (!path) return null;
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('blob:') ||
    path.startsWith('data:')
  ) {
    return path;
  }
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
  const backendBase = apiBase.replace(/\/api\/v1\/?$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${backendBase}${cleanPath}`;
}

export const STATUS_COLORS = {
  // Loan
  PENDING: { label: 'Menunggu', bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' },
  APPROVED: { label: 'Disetujui', bg: 'bg-indigo-500/15', text: 'text-indigo-400', border: 'border-indigo-500/30' },
  REJECTED: { label: 'Ditolak', bg: 'bg-rose-500/15', text: 'text-rose-400', border: 'border-rose-500/30' },
  BORROWED: { label: 'Dipinjam', bg: 'bg-cyan-500/15', text: 'text-cyan-400', border: 'border-cyan-500/30' },
  RETURNED: { label: 'Dikembalikan', bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  OVERDUE: { label: 'Terlambat', bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/40' },

  // Inventory Condition & Report Status
  GOOD: { label: 'Baik', bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  SLIGHTLY_DAMAGED: { label: 'Rusak Ringan', bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' },
  DAMAGED: { label: 'Rusak Berat', bg: 'bg-rose-500/15', text: 'text-rose-400', border: 'border-rose-500/30' },
  ATTENTION_NEEDED: { label: 'Perlu Perhatian', bg: 'bg-orange-500/15', text: 'text-orange-400', border: 'border-orange-500/30' },

  // Member Status
  ACTIVE: { label: 'Aktif', bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  INACTIVE: { label: 'Non-Aktif', bg: 'bg-slate-500/15', text: 'text-slate-400', border: 'border-slate-500/30' },

  // Transaction
  INCOME: { label: 'Pemasukan', bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  EXPENSE: { label: 'Pengeluaran', bg: 'bg-rose-500/15', text: 'text-rose-400', border: 'border-rose-500/30' },
};

