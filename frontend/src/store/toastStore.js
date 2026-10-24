import { create } from 'zustand';

export const useToastStore = create((set, get) => ({
  toasts: [],
  modal: null, // { isOpen, type, title, message, confirmText, cancelText, onConfirm, onCancel }

  addToast: ({ type = 'info', title, message, duration = 4000 }) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    
    // If message not provided but title is, adapt
    let finalTitle = title;
    let finalMessage = message;
    if (!finalMessage && finalTitle) {
      if (type === 'success') finalMessage = finalTitle, finalTitle = 'Berhasil';
      else if (type === 'error') finalMessage = finalTitle, finalTitle = 'Terjadi Kesalahan';
      else if (type === 'warning') finalMessage = finalTitle, finalTitle = 'Perhatian';
      else finalMessage = finalTitle, finalTitle = 'Informasi';
    }

    const newToast = { id, type, title: finalTitle, message: finalMessage, duration, createdAt: Date.now() };

    set((state) => ({
      toasts: [newToast, ...state.toasts].slice(0, 5), // Keep max 5 toasts on screen
    }));

    if (duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, duration);
    }

    return id;
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  clearAllToasts: () => {
    set({ toasts: [] });
  },

  // Modal Alert / Confirm Dialog
  showModal: ({ type = 'info', title, message, confirmText = 'OK', cancelText = null, onConfirm = null, onCancel = null }) => {
    set({
      modal: {
        isOpen: true,
        type,
        title: title || (type === 'success' ? 'Berhasil' : type === 'error' ? 'Peringatan' : 'Informasi'),
        message,
        confirmText,
        cancelText,
        onConfirm,
        onCancel,
      },
    });
  },

  closeModal: () => {
    set({ modal: null });
  },
}));

// Convenience helper methods
export const toast = {
  success: (message, title = 'Berhasil', duration = 4000) =>
    useToastStore.getState().addToast({ type: 'success', title, message, duration }),

  error: (message, title = 'Terjadi Kesalahan', duration = 5000) =>
    useToastStore.getState().addToast({ type: 'error', title, message, duration }),

  warning: (message, title = 'Perhatian', duration = 4500) =>
    useToastStore.getState().addToast({ type: 'warning', title, message, duration }),

  info: (message, title = 'Informasi', duration = 4000) =>
    useToastStore.getState().addToast({ type: 'info', title, message, duration }),

  // Modal popup for critical alerts / confirms
  alert: (message, title = 'Pemberitahuan') => {
    return new Promise((resolve) => {
      let detectedType = 'info';
      const lower = (message || '').toLowerCase();
      if (lower.includes('berhasil') || lower.includes('sukses') || lower.includes('disimpan') || lower.includes('disetujui')) {
        detectedType = 'success';
      } else if (lower.includes('gagal') || lower.includes('error') || lower.includes('salah') || lower.includes('tolak')) {
        detectedType = 'error';
      } else if (lower.includes('perhatian') || lower.includes('peringatan') || lower.includes('wajib')) {
        detectedType = 'warning';
      }

      useToastStore.getState().showModal({
        type: detectedType,
        title,
        message,
        confirmText: 'Mengerti',
        onConfirm: () => resolve(true),
      });
    });
  },

  confirm: (message, title = 'Konfirmasi Tindakan') => {
    return new Promise((resolve) => {
      useToastStore.getState().showModal({
        type: 'warning',
        title,
        message,
        confirmText: 'Ya, Lanjutkan',
        cancelText: 'Batal',
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false),
      });
    });
  },
};

export default toast;

