import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate, Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock,
  User,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  Share2,
  Check,
  FileText,
  ChevronLeft,
  ChevronRight,
  LogIn,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore.js';
import { useThemeStore } from '../../store/themeStore.js';
import { Modal } from '../../components/ui/Modal.jsx';
import api from '../../api/axios.js';

const loginSchema = z.object({
  usernameOrEmail: z.string().min(1, 'Username atau email wajib diisi'),
  password: z.string().min(6, 'Kata sandi minimal 6 karakter'),
});

const DEFAULT_SLIDERS = [
  {
    id: 'default-1',
    title: 'Haul ke-5 Al-Maghfurlah K.H. Moch. Djamaluddin Achmad & Rojabiyyah 2026',
    subtitle: 'Meneladani Jejak Perjuangan, Mempererat Ukhuwah, dan Menjaga Amanah Kebersamaan',
    imageUrl: 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&w=1920&q=85',
    order: 1,
    isActive: true,
  },
  {
    id: 'default-2',
    title: 'Sistem Logistik & Inventaris Terpadu',
    subtitle: 'Manajemen peralatan, audio visual, cetak stiker barcode & surat jalan resmi',
    imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1920&q=85',
    order: 2,
    isActive: true,
  },
  {
    id: 'default-3',
    title: 'Pendaftaran Anggota & Penugasan Panitia',
    subtitle: 'Formulir pendaftaran mandiri terbuka tanpa mewajibkan akun login',
    imageUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1920&q=85',
    order: 3,
    isActive: true,
  },
];

export const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, isAuthenticated, user } = useAuthStore();
  const { branding, fetchBranding } = useThemeStore();

  // Slider State
  const [sliders, setSliders] = useState(DEFAULT_SLIDERS);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Modal Login State
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(searchParams.get('modal') === 'true');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // If already logged in before visiting this page, redirect to respective role dashboard
  if (isAuthenticated && user && !isSubmitting) {
    return <Navigate to={user.role === 'SUPER_ADMIN' ? '/admin' : '/member'} replace />;
  }

  // Fetch Sliders from backend
  useEffect(() => {
    const fetchSliders = async () => {
      try {
        const res = await api.get('/settings/public-sliders');
        if (res.data.data && res.data.data.length > 0) {
          const activeOnly = res.data.data.filter((s) => s.isActive !== false);
          if (activeOnly.length > 0) {
            setSliders(activeOnly);
          }
        }
      } catch (err) {
        console.warn('Menggunakan default slider:', err);
      }
    };
    fetchSliders();
    // Refresh branding juga saat halaman login dimuat
    fetchBranding();
  }, []);

  // Slider Autoplay Timer (Bergulir otomatis setiap 10 detik sekali)
  useEffect(() => {
    if (sliders.length <= 1 || isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliders.length);
    }, 10000);
    return () => clearInterval(timer);
  }, [sliders.length, isPaused]);

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % sliders.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + sliders.length) % sliders.length);
  };

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      usernameOrEmail: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      setLoginError(null);
      const loggedUser = await login(data);
      const target = loggedUser?.role === 'SUPER_ADMIN' ? '/admin' : '/member';
      // Menggunakan redirect bersih agar seluruh layout, store, dan session siap tanpa tabrakan state
      window.location.href = target;
    } catch (err) {
      setLoginError(
        err.response?.data?.message || 'Login gagal. Periksa kembali username dan kata sandi Anda.'
      );
      setIsSubmitting(false);
    }
  };

  const handleQuickFill = (u, p) => {
    setValue('usernameOrEmail', u);
    setValue('password', p);
    setLoginError(null);
  };

  const handleCopyRegistrationLink = () => {
    const registrationUrl = `${window.location.origin}/pendaftaran`;
    navigator.clipboard.writeText(registrationUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const getFullImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `http://localhost:5000${url}`;
  };

  const activeBanner = sliders[currentSlide] || sliders[0];

  return (
    <div
      className="relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden bg-slate-950 text-slate-100 select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* ===================== FULL BACKGROUND SLIDER FOTO ANIMASI ULTRA-SMOOTH (CROSS-FADE 10 DETIK) ===================== */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {sliders.map((slider, index) => {
          const isActive = index === currentSlide;
          return (
            <div
              key={slider.id || index}
              className={`absolute inset-0 w-full h-full transition-opacity duration-[1800ms] ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              <img
                src={getFullImageUrl(slider.imageUrl)}
                alt={slider.title || 'Latar Belakang Haul & Rojabiyyah'}
                className={`w-full h-full object-cover object-center transform transition-transform duration-[10000ms] ease-out ${
                  isActive ? 'scale-105' : 'scale-100'
                }`}
              />
            </div>
          );
        })}

        {/* Overlay Sinematik Bersih & Elegan dengan Nuansa Gelap Halus */}
        <div className="absolute inset-0 bg-slate-950/60 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/70 z-10" />
      </div>

      {/* ===================== TOP HEADER NAVBAR (RESPONSIF HP & DESKTOP) ===================== */}
      <header className="relative z-20 border-b border-white/10 backdrop-blur-md bg-slate-950/70 px-3.5 sm:px-8 py-2.5 sm:py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Logo & Judul Brand (Rapi di HP, tidak berantakan) */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-slate-900 border border-white/20 p-1 shadow-glow flex items-center justify-center overflow-hidden flex-shrink-0">
              <img
                src={branding.logoUrl?.startsWith('/uploads') ? `http://localhost:5000${branding.logoUrl}` : (branding.logoUrl || '/logo-rojabiyyah.png')}
                alt={branding.appName || 'Rojabiyyah'}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <span className="text-xs sm:text-base font-extrabold tracking-tight text-white block truncate drop-shadow-md">
                {branding.appName || 'Administrasi Rojabiyyah 2026'}
              </span>
              <span className="text-[10px] sm:text-[11px] text-amber-300 font-semibold block truncate">
                {branding.appSubtitle || 'Haul Ke-5 & Logistik Terpadu'}
              </span>
            </div>
          </div>

          {/* Action Buttons Header */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
            {/* Tombol Salin WA (Hanya Desktop) */}
            <button
              onClick={handleCopyRegistrationLink}
              type="button"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900/80 border border-white/15 text-slate-300 hover:text-white hover:border-rose-500/50 transition-all shadow-sm backdrop-blur-sm"
              title="Salin Tautan Pendaftaran Anggota via WhatsApp"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">Link Tersalin!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-amber-300" />
                  <span>Salin Link Form</span>
                </>
              )}
            </button>

            {/* Tombol Pendaftaran Anggota (Hanya Desktop/Tablet, di HP sudah ada tombol besar di tengah) */}
            <Link
              to="/pendaftaran"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg gradient-btn text-white shadow-glow transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Pendaftaran Anggota</span>
            </Link>

            {/* Tombol Masuk / Login Petugas (Compact di HP & Desktop) */}
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 text-xs font-bold rounded-lg bg-slate-900/80 border border-white/15 hover:border-rose-400 text-slate-200 hover:text-white transition-all shadow-sm backdrop-blur-sm"
              title="Buka Portal Masuk Petugas & Pengurus"
            >
              <LogIn className="w-3.5 h-3.5 text-rose-400" />
              <span>Masuk Petugas</span>
            </button>
          </div>
        </div>
      </header>

      {/* ===================== HERO CENTER KONTEN SINEMATIK ===================== */}
      <main className="relative z-10 max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-12 flex-1 flex flex-col justify-center items-center text-center my-auto">
        


        {/* Judul Utama Elegan & Bersih (Teks Berbayang Tebal agar Terbaca di atas Foto Terang) */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight max-w-3xl drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]"
        >
          {branding.heroTitlePrefix || 'Aplikasi Administrasi'}{' '}
          <span className="gradient-ai-text block sm:inline">{branding.heroTitleHighlight || 'Haul Ke-5 & Rojabiyyah 2026'}</span>
        </motion.h1>

        {/* Dynamic Slide Caption yang Selaras dengan Background Foto */}
        <div className="min-h-[55px] sm:min-h-[65px] mt-2.5 sm:mt-3.5 max-w-2xl flex flex-col justify-center px-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeBanner?.id || currentSlide}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4 }}
              className="space-y-1"
            >
              {activeBanner?.title && (
                <h3 className="text-xs sm:text-base font-bold text-amber-300 drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
                  {activeBanner.title}
                </h3>
              )}
              {activeBanner?.subtitle && (
                <p className="text-[11px] sm:text-xs text-slate-100 drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] leading-relaxed max-w-xl mx-auto">
                  {activeBanner.subtitle}
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Tombol Aksi Utama Mengambang (Responsif HP: Rapi & Mudah Diklik) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3 w-full max-w-md sm:max-w-xl"
        >
          {/* Tombol 1: Pendaftaran Anggota */}
          <Link
            to="/pendaftaran"
            className="w-full sm:w-auto px-6 py-3 rounded-xl gradient-btn text-xs sm:text-sm font-bold text-white flex items-center justify-center gap-2 shadow-glow hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <FileText className="w-4 h-4 flex-shrink-0" />
            <span>Formulir Pendaftaran Anggota</span>
            <ArrowRight className="w-4 h-4 flex-shrink-0" />
          </Link>

          {/* Tombol 2: Masuk Petugas */}
          <button
            onClick={() => setIsLoginModalOpen(true)}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-900/85 hover:bg-slate-900 border border-white/20 hover:border-rose-400 text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 backdrop-blur-md transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98]"
          >
            <Lock className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>Masuk ke Akun Petugas</span>
          </button>

          {/* Tombol 3: Bagikan WA */}
          <button
            onClick={handleCopyRegistrationLink}
            className="w-full sm:w-auto px-4 py-3 rounded-xl bg-slate-900/80 hover:bg-slate-900 border border-white/15 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 backdrop-blur-md transition-all"
            title="Salin Tautan Pendaftaran via WhatsApp"
          >
            {copiedLink ? (
              <>
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="text-emerald-300">Link Tersalin!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-amber-300 flex-shrink-0" />
                <span>Bagikan WA</span>
              </>
            )}
          </button>
        </motion.div>

        {/* Kontrol Navigasi Slider & Dots (Menyatu di Bawah, Tidak Menabrak Teks Judul!) */}
        <div className="mt-6 sm:mt-8 flex items-center justify-center gap-2.5">
          <button
            onClick={handlePrevSlide}
            type="button"
            className="w-8 h-8 rounded-full bg-slate-950/70 hover:bg-slate-900 border border-white/20 hover:border-rose-400 text-white flex items-center justify-center transition-all backdrop-blur-md shadow-md active:scale-95"
            title="Foto Sebelumnya"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1.5 p-1 rounded-full bg-slate-950/70 backdrop-blur-md border border-white/15">
            {sliders.map((s, idx) => {
              const isActive = idx === currentSlide;
              return (
                <button
                  key={s.id || idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`relative h-2 rounded-full overflow-hidden transition-all ${
                    isActive ? 'w-8 bg-white/20' : 'w-2.5 bg-white/40 hover:bg-white/80'
                  }`}
                  title={`Lihat Foto Slide ${idx + 1}`}
                >
                  {isActive && (
                    <motion.div
                      key={`progress-${currentSlide}`}
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 10, ease: 'linear' }}
                      className="absolute inset-0 bg-gradient-to-r from-amber-400 to-rose-400 shadow-glow"
                    />
                  )}
                </button>
              );
            })}
          </div>

          <button
            onClick={handleNextSlide}
            type="button"
            className="w-8 h-8 rounded-full bg-slate-950/70 hover:bg-slate-900 border border-white/20 hover:border-rose-400 text-white flex items-center justify-center transition-all backdrop-blur-md shadow-md active:scale-95"
            title="Foto Selanjutnya"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <span className="px-2 py-0.5 rounded-full bg-slate-950/70 backdrop-blur-md text-[10px] font-mono font-bold text-amber-300 border border-white/15">
            {currentSlide + 1} / {sliders.length}
          </span>
        </div>

      </main>

      {/* ===================== TOMBOL NAVIGASI DI TEPI HANYA DI DESKTOP LAYAR LEBAR ===================== */}
      <button
        onClick={handlePrevSlide}
        type="button"
        className="hidden lg:flex fixed left-5 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-slate-950/70 hover:bg-slate-900 border border-white/20 hover:border-rose-400 text-white items-center justify-center transition-all z-20 backdrop-blur-md shadow-2xl hover:scale-110 active:scale-95"
        title="Foto Sebelumnya"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={handleNextSlide}
        type="button"
        className="hidden lg:flex fixed right-5 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-slate-950/70 hover:bg-slate-900 border border-white/20 hover:border-rose-400 text-white items-center justify-center transition-all z-20 backdrop-blur-md shadow-2xl hover:scale-110 active:scale-95"
        title="Foto Selanjutnya"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* ===================== FOOTER RESMI ===================== */}
      <footer className="relative z-20 border-t border-white/10 backdrop-blur-md bg-slate-950/70 py-3 px-4 text-center text-[11px] sm:text-xs text-slate-400">
        <p>{branding.footerText || '© 2026 Aplikasi Administrasi Haul Ke-5 & Rojabiyyah 2026.'}</p>
      </footer>

      {/* ===================== MODAL LOGIN PETUGAS (COMPACT & MODERN) ===================== */}
      <Modal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        title="Portal Masuk Petugas"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 text-xs">
          <div className="text-center pb-2 border-b border-white/10">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-900 border border-white/15 p-1 shadow-glow mb-2 overflow-hidden">
              <img
                src={branding.logoUrl?.startsWith('/uploads') ? `http://localhost:5000${branding.logoUrl}` : (branding.logoUrl || '/logo-rojabiyyah.png')}
                alt={branding.appName || 'Rojabiyyah'}
                className="w-full h-full object-contain"
              />
            </div>
            <h3 className="text-sm font-black text-white">
              {branding.appName || 'Administrasi Haul Ke-5 & Rojabiyyah 2026'}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Masuk sebagai Super Admin atau Anggota yang memiliki akun
            </p>
          </div>

          {/* Error Alert */}
          {loginError && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
              <span>{loginError}</span>
            </div>
          )}

          {/* Form Login */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Username atau Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  {...register('usernameOrEmail')}
                  placeholder="misal: admin atau ahmad"
                  className="w-full glass-input pl-9 text-white placeholder:text-slate-500 text-xs"
                />
              </div>
              {errors.usernameOrEmail && (
                <p className="text-[11px] text-rose-400 mt-1">{errors.usernameOrEmail.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Kata Sandi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  placeholder="••••••••"
                  className="w-full glass-input pl-9 pr-9 text-white placeholder:text-slate-500 text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[11px] text-rose-400 mt-1">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl gradient-btn flex items-center justify-center gap-2 text-xs font-bold tracking-wide disabled:opacity-60 disabled:cursor-not-allowed shadow-glow text-white"
            >
              {isSubmitting ? (
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Masuk ke Akun</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Fill */}
          <div className="pt-3 border-t border-white/10 text-center">
            <p className="text-[10px] font-medium text-slate-400 mb-2">
              Pilih akun demo untuk pengujian cepat:
            </p>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => handleQuickFill('admin', 'admin123')}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-rose-500/30 hover:border-rose-400 text-rose-300 transition-all font-medium flex items-center justify-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                Super Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('ahmad', 'anggota123')}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-amber-500/30 hover:border-amber-400 text-amber-300 transition-all font-medium flex items-center justify-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                Anggota (Ahmad)
              </button>
            </div>
          </div>

          {/* Opsi Registrasi Akun Anggota */}
          <div className="pt-3 border-t border-white/10 text-center text-slate-400 text-[11px]">
            <span>Belum memiliki akun login? </span>
            <Link
              to="/register"
              className="text-amber-300 hover:text-amber-200 font-bold hover:underline"
            >
              Daftar Akun Anggota
            </Link>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default LoginPage;
