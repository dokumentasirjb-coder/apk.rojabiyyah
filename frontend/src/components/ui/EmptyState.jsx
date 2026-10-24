import React from 'react';
import { PackageOpen } from 'lucide-react';

export const EmptyState = ({ title = 'Belum Ada Data', message = 'Tidak ada catatan atau item yang cocok dengan kriteria pencarian.', action }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 shadow-glow">
        <PackageOpen className="w-8 h-8" />
      </div>
      <h4 className="text-base font-semibold text-white mb-1">{title}</h4>
      <p className="text-sm text-slate-400 max-w-sm mb-5">{message}</p>
      {action && <div>{action}</div>}
    </div>
  );
};

