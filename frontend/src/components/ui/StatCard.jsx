import React from 'react';
import { motion } from 'framer-motion';

export const StatCard = ({ title, value, icon: Icon, color = 'indigo', subtitle, trend }) => {
  const colorMap = {
    indigo: 'from-rose-500/20 to-[#800020]/10 text-rose-300 border-rose-500/30',
    cyan: 'from-amber-500/20 to-orange-500/10 text-amber-300 border-amber-500/30',
    amber: 'from-amber-500/20 to-yellow-500/10 text-amber-400 border-amber-500/30',
    emerald: 'from-emerald-500/20 to-teal-500/10 text-emerald-400 border-emerald-500/30',
    rose: 'from-rose-500/20 to-[#800020]/10 text-rose-300 border-rose-500/30',
  };

  const selectedColor = colorMap[color] || colorMap.indigo;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.3 }}
      className="glass-card p-5 relative overflow-hidden group border border-white/10 hover:border-white/20 transition-all duration-300 shadow-glass"
    >
      <div className={`absolute -right-8 -top-8 w-28 h-28 bg-gradient-to-br ${selectedColor} rounded-full blur-2xl opacity-60 group-hover:opacity-100 transition-opacity`} />

      <div className="flex items-center justify-between mb-3 relative z-10">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className={`w-10 h-10 rounded-xl bg-slate-800/80 border border-white/10 flex items-center justify-center ${selectedColor} shadow-inner`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="relative z-10">
        <h3 className="text-2xl font-bold tracking-tight text-white">{value}</h3>
        {subtitle && (
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
            {trend && <span className="font-semibold text-emerald-400">{trend}</span>}
            <span>{subtitle}</span>
          </p>
        )}
      </div>
    </motion.div>
  );
};

