# Frontend Administrasi Rojabiyyaah

Aplikasi web modern Single Page Application (SPA) untuk sistem administrasi organisasi **Administrasi Rojabiyyaah**.

## 🎨 Desain & UI/UX
- **Tema Visual**: Glassmorphism (kartu kaca blur), gradient halus indigo-violet-cyan, soft glow, border tipis semi-transparan.
- **Dark Mode**: Default dark mode dengan toggle instan ke mode terang.
- **Tipografi**: Plus Jakarta Sans & Inter.
- **Navigasi Responsif**: Collapsible sidebar untuk desktop & bottom navigation bar mobile-first untuk anggota di ponsel.

---

## 🛠️ Tech Stack
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS + Custom AI Glassmorphism
- **Routing**: React Router v7 dengan Role Guard (`SUPER_ADMIN` & `ANGGOTA`)
- **State Management**: Zustand
- **Data Fetching & Cache**: TanStack Query + Axios (Auto token refresh interceptor)
- **Animasi & Grafik**: Framer Motion & Recharts
- **Validasi Form**: react-hook-form + Zod

---

## 🚀 Cara Menjalankan Frontend
```bash
# Instal dependensi
npm install

# Jalankan server development
npm run dev

# Build untuk produksi
npm run build
```
Aplikasi akan aktif di: **http://localhost:5173**
Akses API Backend: **http://localhost:5000/api/v1**

