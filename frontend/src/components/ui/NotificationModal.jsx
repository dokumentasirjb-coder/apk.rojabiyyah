import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useToastStore } from '../../store/toastStore.js';

const MODAL_CONFIG = {
  success: {
    icon: CheckCircle2,
    iconColor: 'text-emerald-400',
    iconBg: 'bg-emerald-500/20 border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.3)]',
    buttonColor: 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400',
    titleColor: 'text-emerald-300',
  },
  error: {
    icon: AlertCircle,
    iconColor: 'text-rose-400',
    iconBg: 'bg-rose-500/20 border-rose-500/40 shadow-[0_0_30px_rgba(244,63,94,0.3)]',
    buttonColor: 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500',
    titleColor: 'text-rose-300',
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-amber-400',
    iconBg: 'bg-amber-500/20 border-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.3)]',
    buttonColor: 'bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400',
    titleColor: 'text-amber-300',
  },
  info: {
    icon: Info,
    iconColor: 'text-cyan-400',
    iconBg: 'bg-cyan-500/20 border-cyan-500/40 shadow-[0_0_30px_rgba(6,182,212,0.3)]',
    buttonColor: 'bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400',
    titleColor: 'text-cyan-300',
  },
};

export const NotificationModal = () => {
  const { modal, closeModal } = useToastStore();

  if (!modal || !modal.isOpen) return null;

  const config = MODAL_CONFIG[modal.type] || MODAL_CONFIG.info;
  const Icon = config.icon;

  const handleConfirm = () => {
    if (modal.onConfirm) modal.onConfirm();
    closeModal();
  };

  const handleCancel = () => {
    if (modal.onCancel) modal.onCancel();
    closeModal();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleCancel}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* Modal Dialog Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-md bg-slate-900/95 border border-white/20 rounded-3xl p-6 sm:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.8)] backdrop-blur-2xl text-center select-none"
        >
          {/* Close corner icon */}
          <button
            type="button"
            onClick={handleCancel}
            className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Centered Glowing Icon */}
          <div className={`w-16 h-16 rounded-2xl border ${config.iconBg} flex items-center justify-center mx-auto mb-4`}>
            <Icon className={`w-8 h-8 ${config.iconColor}`} />
          </div>

          {/* Title */}
          <h3 className={`text-lg font-black tracking-tight ${config.titleColor} mb-2`}>
            {modal.title}
          </h3>

          {/* Message */}
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium mb-6 px-2">
            {modal.message}
          </p>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-3">
            {modal.cancelText && (
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 text-slate-300 hover:text-white text-xs font-bold transition-all"
              >
                {modal.cancelText}
              </button>
            )}

            <button
              type="button"
              onClick={handleConfirm}
              autoFocus
              className={`flex-1 py-2.5 px-5 rounded-xl ${config.buttonColor} text-white text-xs font-bold shadow-glow transition-all active:scale-95`}
            >
              {modal.confirmText || 'OK'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default NotificationModal;

