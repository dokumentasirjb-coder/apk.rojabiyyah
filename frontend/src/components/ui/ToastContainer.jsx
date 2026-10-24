import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useToastStore } from '../../store/toastStore.js';

const TOAST_CONFIG = {
  success: {
    icon: CheckCircle2,
    borderColor: 'border-emerald-500/40',
    bgColor: 'bg-slate-900/95',
    iconColor: 'text-emerald-400',
    iconBg: 'bg-emerald-500/15',
    glowColor: 'shadow-[0_8px_25px_rgba(16,185,129,0.25)]',
    barColor: 'bg-emerald-400',
    titleColor: 'text-emerald-300',
  },
  error: {
    icon: AlertCircle,
    borderColor: 'border-rose-500/40',
    bgColor: 'bg-slate-900/95',
    iconColor: 'text-rose-400',
    iconBg: 'bg-rose-500/15',
    glowColor: 'shadow-[0_8px_25px_rgba(244,63,94,0.25)]',
    barColor: 'bg-rose-500',
    titleColor: 'text-rose-300',
  },
  warning: {
    icon: AlertTriangle,
    borderColor: 'border-amber-500/40',
    bgColor: 'bg-slate-900/95',
    iconColor: 'text-amber-400',
    iconBg: 'bg-amber-500/15',
    glowColor: 'shadow-[0_8px_25px_rgba(245,158,11,0.25)]',
    barColor: 'bg-amber-400',
    titleColor: 'text-amber-300',
  },
  info: {
    icon: Info,
    borderColor: 'border-cyan-500/40',
    bgColor: 'bg-slate-900/95',
    iconColor: 'text-cyan-400',
    iconBg: 'bg-cyan-500/15',
    glowColor: 'shadow-[0_8px_25px_rgba(6,182,212,0.25)]',
    barColor: 'bg-cyan-400',
    titleColor: 'text-cyan-300',
  },
};

export const ToastContainer = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed top-4 right-4 left-4 sm:left-auto sm:w-[420px] z-[9999] pointer-events-none flex flex-col gap-2.5">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          const config = TOAST_CONFIG[toast.type] || TOAST_CONFIG.info;
          const Icon = config.icon;

          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 450, damping: 30 }}
              className={`pointer-events-auto relative overflow-hidden rounded-2xl border ${config.borderColor} ${config.bgColor} backdrop-blur-2xl p-4 ${config.glowColor} text-slate-100 flex items-start gap-3.5 select-none`}
            >
              {/* Glowing Icon Box */}
              <div className={`w-10 h-10 rounded-xl ${config.iconBg} border ${config.borderColor} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                <Icon className={`w-5 h-5 ${config.iconColor}`} />
              </div>

              {/* Message Content */}
              <div className="flex-1 min-w-0 pr-2">
                <h4 className={`text-xs font-black uppercase tracking-wider ${config.titleColor}`}>
                  {toast.title}
                </h4>
                <p className="text-xs text-slate-200 mt-0.5 leading-relaxed font-medium break-words">
                  {toast.message}
                </p>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Smooth Progress Bar at bottom */}
              {toast.duration > 0 && (
                <motion.div
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: toast.duration / 1000, ease: 'linear' }}
                  className={`absolute bottom-0 left-0 h-[3px] ${config.barColor}`}
                />
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;

