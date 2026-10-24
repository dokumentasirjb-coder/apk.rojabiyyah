import React, { useState, useEffect } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore.js';
import api from '../../api/axios.js';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Nama lengkap minimal 2 karakter'),
  username: z
    .string()
    .min(3, 'Username minimal 3 karakter')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username hanya huruf, angka, dan underscore'),
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(6, 'Kata sandi minimal 6 karakter'),
  phone: z.string().optional(),
  address: z.string().optional(),
  regionId: z.string().optional(),
});

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register: registerUser, isAuthenticated, user } = useAuthStore();
  const [regions, setRegions] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [registerError, setRegisterError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated && user && !isSubmitting) {
    return <Navigate to={user.role === 'SUPER_ADMIN' ? '/admin' : '/member'} replace />;
  }

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const res = await api.get('/regions');
        setRegions(res.data.data);
      } catch {
        // ignore
      }
    };
    fetchRegions();
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      username: '',
      email: '',
      password: '',
      phone: '',
      address: '',
      regionId: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      setRegisterError(null);
      const payload = {
        ...data,
        regionId: data.regionId ? parseInt(data.regionId) : undefined,
      };

      await registerUser(payload);
      window.location.href = '/member';
    } catch (err) {
      setRegisterError(
        err.response?.data?.message || 'Pendaftaran gagal. Silakan periksa kembali data Anda.'
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-slate-950 text-slate-100 overflow-hidden py-10">
      {/* Ambient Glows */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#800020]/20 rounded-full blur-[130px] animate-pulse-slow pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-rose-500/10 rounded-full blur-[130px] animate-pulse-slow pointer-events-none" />

      {/* Mesh Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      {/* Main Glass Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg relative z-10 glass-card p-6 sm:p-8 border border-white/15 shadow-2xl backdrop-blur-2xl"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#800020] via-rose-600 to-amber-500 p-0.5 shadow-glow mb-3">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-amber-300" />
            </div>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white">
            Pendaftaran <span className="gradient-ai-text">Akun Login Anggota</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Khusus anggota yang ingin memiliki akun login ke Portal Sistem Rojabiyyaah
          </p>
        </div>

        {/* Error Alert */}
        {registerError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
            <span>{registerError}</span>
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Nama Lengkap</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                {...register('fullName')}
                placeholder="misal: Fulan bin Fulan"
                className="w-full glass-input pl-9"
              />
            </div>
            {errors.fullName && <p className="text-[11px] text-rose-400 mt-1">{errors.fullName.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Username Login</label>
              <input
                type="text"
                {...register('username')}
                placeholder="username unik"
                className="w-full glass-input"
              />
              {errors.username && <p className="text-[11px] text-rose-400 mt-1">{errors.username.message}</p>}
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Email</label>
              <input
                type="email"
                {...register('email')}
                placeholder="nama@email.com"
                className="w-full glass-input"
              />
              {errors.email && <p className="text-[11px] text-rose-400 mt-1">{errors.email.message}</p>}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Kata Sandi</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                placeholder="Minimal 6 karakter"
                className="w-full glass-input pl-9 pr-9"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-[11px] text-rose-400 mt-1">{errors.password.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">No. WhatsApp / HP</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  {...register('phone')}
                  placeholder="0812xxxxxxxx"
                  className="w-full glass-input pl-9"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Pilihan Wilayah</label>
              <select {...register('regionId')} className="w-full glass-input">
                <option value="">Pilih Wilayah Domisili</option>
                {regions.map((r) => (
                  <option key={r.id} value={r.id} className="bg-slate-900 text-white">
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Alamat Singkat</label>
            <textarea
              rows="2"
              {...register('address')}
              placeholder="Alamat domisili atau kelurahan..."
              className="w-full glass-input"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3 px-4 rounded-xl gradient-btn flex items-center justify-center gap-2 text-sm font-bold tracking-wide disabled:opacity-60"
          >
            {isSubmitting ? (
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Daftar Sekarang & Masuk</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link to Login & Form Pendaftaran */}
        <div className="mt-6 pt-4 border-t border-white/10 text-center text-xs text-slate-400 space-y-2">
          <div>
            Sudah memiliki akun pengurus atau anggota?{' '}
            <Link to="/login" className="text-amber-300 hover:text-amber-200 font-bold hover:underline">
              Masuk di Sini
            </Link>
          </div>
          <div className="text-[11px] text-slate-500">
            Hanya ingin isi data pendaftaran anggota / seragam tanpa akun?{' '}
            <Link to="/pendaftaran" className="text-emerald-400 hover:text-emerald-300 font-semibold hover:underline">
              Buka Formulir Pendaftaran
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

