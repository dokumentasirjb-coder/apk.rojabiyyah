import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Phone,
  MapPin,
  Sparkles,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Copy,
  Download,
  Share2,
  GraduationCap,
  Briefcase,
  Layers,
  Shirt,
  Building,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Check,
} from 'lucide-react';
import api from '../../api/axios.js';
import { useThemeStore } from '../../store/themeStore.js';

const DIVISIONS = [
  'Koordinator',
  'Wakil Koordinator',
  'PJ Desain',
  'Fotografer',
  'Videografer',
  'Perkabelan',
  'Proyektor',
  'Live Streaming / Desain Grafis',
  'Shooting / Editor',
  'Logistik & Perlengkapan',
  'Humas & Akomodasi',
];

const EDUCATIONS = [
  'Abiturent',
  'UNWAHA',
  'IAIBAFA',
  'MAN 3 Jombang',
  'MTs FH',
  'MA FH',
  'MMP',
  'MMA',
  'Umum / Mahasiswa',
];

const DOMICILES = [
  'Al-Muhibbin',
  'Al-Ikhlas',
  'Al-Amanah',
  'Al-Mardliyah',
  'Al-Asror',
  'Jombang',
  'Gresik',
  'Mojokerto',
  'Surabaya',
  'Lainnya',
];

const SHIRT_SIZES = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

export const PublicRegistrationPage = () => {
  const navigate = useNavigate();
  const { branding } = useThemeStore();
  const [regions, setRegions] = useState([]);
  const [isLoadingRegions, setIsLoadingRegions] = useState(true);

  // Form states
  const [fullName, setFullName] = useState('');
  const [division, setDivision] = useState('');
  const [customDivision, setCustomDivision] = useState('');
  const [education, setEducation] = useState('');
  const [customEducation, setCustomEducation] = useState('');
  const [grade, setGrade] = useState('');
  const [domicile, setDomicile] = useState('');
  const [customDomicile, setCustomDomicile] = useState('');
  const [shirtSize, setShirtSize] = useState('L');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [regionId, setRegionId] = useState('');

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [submittedData, setSubmittedData] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const res = await api.get('/regions');
        setRegions(res.data.data || []);
      } catch {
        // non-blocking
      } finally {
        setIsLoadingRegions(false);
      }
    };
    fetchRegions();
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim()) {
      setErrorMessage('Nama lengkap wajib diisi');
      return;
    }

    const finalDivision = division === 'Lainnya' ? customDivision : division;
    const finalEducation = education === 'Lainnya' ? customEducation : education;
    const finalDomicile = domicile === 'Lainnya' ? customDomicile : domicile;

    try {
      setIsSubmitting(true);
      const payload = {
        fullName: fullName.trim(),
        division: finalDivision || null,
        education: finalEducation || null,
        grade: grade.trim() || null,
        domicile: finalDomicile || null,
        shirtSize: shirtSize || null,
        phone: phone.trim() || null,
        address: address.trim() || null,
        regionId: regionId ? parseInt(regionId) : null,
        createAccount: false,
      };

      const res = await api.post('/members/public-register', payload);
      setSubmittedData(res.data.data);
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || 'Gagal mengirimkan formulir. Silakan coba beberapa saat lagi.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden py-8 px-4 sm:px-6 lg:px-8">
      {/* Background Decorative Glows */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#800020]/15 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-rose-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Navigation Bar / Top Bar */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
          <Link to="/login" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-slate-900 border border-white/15 p-1 shadow-glow flex items-center justify-center overflow-hidden">
              <img
                src={branding.logoUrl?.startsWith('/uploads') ? `http://localhost:5000${branding.logoUrl}` : (branding.logoUrl || '/logo-rojabiyyah.png')}
                alt={branding.appName || 'Rojabiyyah'}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className="text-base font-extrabold tracking-tight text-white block">
                {branding.appName || 'Administrasi'} <span className="gradient-ai-text">Rojabiyyaah</span>
              </span>
              <span className="text-[11px] text-slate-400 block -mt-0.5">
                Portal Formulir Pendaftaran Anggota
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900/80 border border-white/10 text-slate-300 hover:text-white hover:border-rose-500/50 transition-all shadow-sm"
              title="Salin Tautan Form Pendaftaran"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">Tersalin!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-amber-300" />
                  <span className="hidden sm:inline">Bagikan Link</span>
                </>
              )}
            </button>
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white transition-all shadow-sm"
            >
              Portal Login
            </Link>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!submittedData ? (
            /* ================================= FORM REGISTRASI ================================= */
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="glass-card p-6 sm:p-10 border border-white/15 shadow-2xl backdrop-blur-2xl rounded-2xl"
            >
              {/* Header Box */}
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#800020]/20 border border-[#800020]/30 text-rose-300 text-xs font-semibold mb-3">
                  <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                  Formulir Pendataan Anggota & Divisi
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Formulir Registrasi Anggota
                </h1>
                <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                  Silakan isi formulir di bawah ini dengan lengkap untuk pendataan penugasan (DEV),
                  pendidikan, domisili, serta ukuran seragam panitia. Anggota <strong className="text-amber-300">tidak diwajibkan memiliki akun login</strong>, formulir ini murni untuk pendataan panitia.
                </p>
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="mb-6 p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-start gap-3 text-xs text-rose-300">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 1. Nama Lengkap */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Nama Lengkap <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Contoh: M. Nasrul Wathon / Azzam Wahyu"
                      className="w-full glass-input pl-10 text-white placeholder:text-slate-500"
                    />
                  </div>
                </div>

                {/* 2. Grid DEV & Pendidikan */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Bidang / Divisi Tugas (DEV) */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Divisi / Bidang Tugas (DEV)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <Briefcase className="w-4 h-4" />
                      </div>
                      <select
                        value={division}
                        onChange={(e) => setDivision(e.target.value)}
                        className="w-full glass-input pl-10 text-white bg-slate-900"
                      >
                        <option value="">Pilih Bidang / Divisi</option>
                        {DIVISIONS.map((d) => (
                          <option key={d} value={d} className="bg-slate-900 text-white">
                            {d}
                          </option>
                        ))}
                        <option value="Lainnya" className="bg-slate-900 text-white">
                          -- Ketik Sendiri (Lainnya) --
                        </option>
                      </select>
                    </div>
                    {division === 'Lainnya' && (
                      <input
                        type="text"
                        value={customDivision}
                        onChange={(e) => setCustomDivision(e.target.value)}
                        placeholder="Ketikkan divisi / dev Anda"
                        className="w-full glass-input mt-2 text-xs text-white"
                      />
                    )}
                  </div>

                  {/* Pendidikan */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Pendidikan / Kampus / Sekolah
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <select
                        value={education}
                        onChange={(e) => setEducation(e.target.value)}
                        className="w-full glass-input pl-10 text-white bg-slate-900"
                      >
                        <option value="">Pilih Jenjang / Kampus</option>
                        {EDUCATIONS.map((ed) => (
                          <option key={ed} value={ed} className="bg-slate-900 text-white">
                            {ed}
                          </option>
                        ))}
                        <option value="Lainnya" className="bg-slate-900 text-white">
                          -- Ketik Sendiri (Lainnya) --
                        </option>
                      </select>
                    </div>
                    {education === 'Lainnya' && (
                      <input
                        type="text"
                        value={customEducation}
                        onChange={(e) => setCustomEducation(e.target.value)}
                        placeholder="Contoh: UNWAHA, MAN 3 Jombang, dll."
                        className="w-full glass-input mt-2 text-xs text-white"
                      />
                    )}
                  </div>
                </div>

                {/* 3. Grid Kelas & Domisili */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Kelas */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Kelas / Tingkat / Angkatan
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <Layers className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                        placeholder="Contoh: XII IPA 1 / Semester 4"
                        className="w-full glass-input pl-10 text-white placeholder:text-slate-500"
                      />
                    </div>
                  </div>

                  {/* Domisili / Asrama / Pondok */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Domisili / Pondok / Asrama
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <Building className="w-4 h-4" />
                      </div>
                      <select
                        value={domicile}
                        onChange={(e) => setDomicile(e.target.value)}
                        className="w-full glass-input pl-10 text-white bg-slate-900"
                      >
                        <option value="">Pilih Domisili / Pondok</option>
                        {DOMICILES.map((dom) => (
                          <option key={dom} value={dom} className="bg-slate-900 text-white">
                            {dom}
                          </option>
                        ))}
                      </select>
                    </div>
                    {domicile === 'Lainnya' && (
                      <input
                        type="text"
                        value={customDomicile}
                        onChange={(e) => setCustomDomicile(e.target.value)}
                        placeholder="Ketikkan nama pondok / kota domisili"
                        className="w-full glass-input mt-2 text-xs text-white"
                      />
                    )}
                  </div>
                </div>

                {/* 4. Ukuran Seragam */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Ukuran Seragam Panitia / Organisasi
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {SHIRT_SIZES.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setShirtSize(size)}
                        className={`py-2.5 px-3 rounded-xl border text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
                          shirtSize === size
                            ? 'bg-gradient-to-r from-indigo-600 to-cyan-500 border-cyan-400 text-white shadow-glow'
                            : 'bg-slate-900/60 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                        }`}
                      >
                        <Shirt className="w-4 h-4" />
                        <span>{size}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 5. Nomor WhatsApp & Wilayah */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      No. WhatsApp (No WA)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="0812xxxxxxxx"
                        className="w-full glass-input pl-10 text-white placeholder:text-slate-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Wilayah Operasional (Opsional)
                    </label>
                    <select
                      value={regionId}
                      onChange={(e) => setRegionId(e.target.value)}
                      className="w-full glass-input text-white bg-slate-900"
                    >
                      <option value="">Pilih Wilayah Operasional</option>
                      {regions.map((r) => (
                        <option key={r.id} value={r.id} className="bg-slate-900 text-white">
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 6. Alamat / Catatan Lengkap */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Alamat Lengkap / Keterangan Tambahan
                  </label>
                  <textarea
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Alamat asal atau catatan khusus lainnya (opsional)"
                    className="w-full glass-input text-white placeholder:text-slate-500"
                  />
                </div>

                {/* Link Terpisah untuk Pembuatan Akun Login Anggota */}
                <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-300">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/30 flex items-center justify-center flex-shrink-0">
                      <Lock className="w-4 h-4 text-rose-300" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">Ingin membuat Akun Login ke Portal Anggota?</p>
                      <p className="text-[11px] text-slate-400">Pendaftaran akun pengguna dipisahkan dari formulir data di atas.</p>
                    </div>
                  </div>
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#800020] hover:bg-[#9e1034] border border-rose-500/40 text-white text-xs font-bold transition-all flex-shrink-0 shadow-glow"
                  >
                    <span>Daftar Akun Login</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 rounded-xl gradient-btn flex items-center justify-center gap-2 text-sm font-bold tracking-wide shadow-glow disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Kirimkan Data Pendaftaran</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          ) : (
            /* ========================= KARTU BUKTI PENDAFTARAN SUKSES ========================= */
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-6 sm:p-10 border border-emerald-500/30 shadow-2xl backdrop-blur-2xl rounded-2xl text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-4 shadow-glow">
                <CheckCircle className="w-8 h-8" />
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Pendaftaran Berhasil!
              </h2>
              <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
                Data Anda telah resmi tersimpan dalam sistem Administrasi Rojabiyyaah.
              </p>

              {/* Virtual ID Card Showcase */}
              <div className="my-8 max-w-md mx-auto p-6 rounded-2xl bg-gradient-to-br from-slate-900/90 to-indigo-950/60 border border-cyan-500/30 shadow-xl text-left relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                  <Sparkles className="w-24 h-24 text-cyan-400" />
                </div>

                <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block">
                      Tanda Registrasi Anggota
                    </span>
                    <span className="text-xs font-semibold text-slate-300">
                      Administrasi Rojabiyyaah
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded-md bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 font-mono text-xs font-bold">
                    {submittedData.memberId}
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Nama Lengkap</span>
                    <span className="font-bold text-white text-base">{submittedData.fullName}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/5">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Divisi (DEV)</span>
                      <span className="font-semibold text-cyan-300">{submittedData.division || '-'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Ukuran Seragam</span>
                      <span className="font-bold text-white bg-indigo-600/30 px-2 py-0.5 rounded inline-block">
                        {submittedData.shirtSize || '-'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/5">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Pendidikan</span>
                      <span className="font-medium text-slate-200">{submittedData.education || '-'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Domisili</span>
                      <span className="font-medium text-slate-200">{submittedData.domicile || '-'}</span>
                    </div>
                  </div>

                  {submittedData.phone && (
                    <div className="pt-1 border-t border-white/5">
                      <span className="text-slate-400 block text-[10px]">Kontak WhatsApp</span>
                      <span className="font-mono text-slate-200">{submittedData.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => window.print()}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 border border-white/10 hover:border-white/20 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <Download className="w-4 h-4 text-cyan-400" />
                  <span>Cetak / Simpan Bukti</span>
                </button>
                <button
                  onClick={() => {
                    setSubmittedData(null);
                    setFullName('');
                    setPhone('');
                    setAddress('');
                    setGrade('');
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600/30 border border-indigo-500/40 hover:bg-indigo-600/40 text-indigo-200 text-xs font-semibold transition-all"
                >
                  Isi Formulir Baru Lagi
                </button>
                <Link
                  to="/login"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl gradient-btn text-white text-xs font-bold transition-all"
                >
                  Ke Halaman Utama
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
export default PublicRegistrationPage;

