import React from 'react';
import { STATUS_COLORS } from '../../lib/utils.js';

export const StatusBadge = ({ status }) => {
  const config = STATUS_COLORS[status] || {
    label: status,
    bg: 'bg-slate-500/15',
    text: 'text-slate-300',
    border: 'border-slate-500/30',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border} shadow-sm backdrop-blur-md`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      {config.label}
    </span>
  );
};

