import { create } from 'zustand';
import api from '../api/axios.js';

const DEFAULT_BRANDING = {
  appName: 'Administrasi Rojabiyyah 2026',
  appSubtitle: 'Haul Ke-5 & Logistik Terpadu',
  logoUrl: '/logo-rojabiyyah.png',
  subTheme: 'Haul ke-5 Al-Maghfurlah K.H. Moch. Djamaluddin Achmad & Rojabiyyah 2026',
  heroTitlePrefix: 'Aplikasi Administrasi',
  heroTitleHighlight: 'Haul Ke-5 & Rojabiyyah 2026',
  footerText: '© 2026 Aplikasi Administrasi Haul Ke-5 & Rojabiyyah 2026.',
  // Kop Dokumen Cetak (Surat Jalan, Stiker, Bukti Peminjaman, dll)
  kopNama: 'ADMINISTRASI ROJABIYYAAH 2026 • LOGISTIK',
  kopSubtitle: 'Haul ke-5 Al-Maghfurlah K.H. Moch. Djamaluddin Achmad & Rojabiyyah 2026',
  kopSubtitleSingkat: 'Haul Ke-5 & Rojabiyyah 2026',
  googleDriveUrl: 'https://drive.google.com/drive/folders/1l91WsFBV_sZ89DlvzvSXlgedX0pOwsfa?usp=sharing',
};

export const useThemeStore = create((set, get) => ({
  theme: localStorage.getItem('rojabiyyaah_theme') || 'dark',
  branding: JSON.parse(localStorage.getItem('rojabiyyaah_branding') || 'null') || DEFAULT_BRANDING,

  toggleTheme: () => {
    set((state) => {
      const newTheme = state.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('rojabiyyaah_theme', newTheme);
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return { theme: newTheme };
    });
  },

  initTheme: () => {
    const savedTheme = localStorage.getItem('rojabiyyaah_theme') || 'dark';
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    set({ theme: savedTheme });

    // Fetch latest branding from server
    get().fetchBranding();
  },

  fetchBranding: async () => {
    try {
      const res = await api.get('/settings/public-branding');
      if (res.data?.data) {
        const merged = { ...DEFAULT_BRANDING, ...res.data.data };
        localStorage.setItem('rojabiyyaah_branding', JSON.stringify(merged));
        set({ branding: merged });
        return merged;
      }
    } catch (err) {
      console.warn('Gagal memuat branding, menggunakan fallback:', err);
    }
  },

  setBranding: (newBranding) => {
    const merged = { ...get().branding, ...newBranding };
    localStorage.setItem('rojabiyyaah_branding', JSON.stringify(merged));
    set({ branding: merged });
  },
}));

export default useThemeStore;
