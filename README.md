# 🏛️ Administrasi Rojabiyyah 2026

> **Sistem Informasi Manajemen Administrasi Organisasi, Logistik Terpadu, Penugasan Lapangan & Multi-Admin RBAC**  
> *Haul ke-5 Al-Maghfurlah K.H. Moch. Djamaluddin Achmad & Peringatan Rojabiyyah 2026*

[![Node.js](https://img.shields.io/badge/Node.js-v20+-68a063?style=flat-square&logo=node.js&logoColor=white)](#)
[![Express.js](https://img.shields.io/badge/Backend-Express%20v4.21-000000?style=flat-square&logo=express&logoColor=white)](#)
[![React](https://img.shields.io/badge/Frontend-React%20v19-61dafb?style=flat-square&logo=react&logoColor=black)](#)
[![Vite](https://img.shields.io/badge/Build-Vite%20v6-646cff?style=flat-square&logo=vite&logoColor=white)](#)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20v3.4-38bdf8?style=flat-square&logo=tailwind-css&logoColor=white)](#)
[![Prisma ORM](https://img.shields.io/badge/ORM-Prisma%20v6-2d3748?style=flat-square&logo=prisma&logoColor=white)](#)
[![MySQL](https://img.shields.io/badge/Database-MySQL%20(Laragon)-00758f?style=flat-square&logo=mysql&logoColor=white)](#)
[![Security](https://img.shields.io/badge/Auth-JWT%20Dual--Token-e11d48?style=flat-square&logo=json-web-tokens&logoColor=white)](#)
[![Documentation](https://img.shields.io/badge/Docs-PRD%20%26%20Swagger-10b981?style=flat-square&logo=swagger&logoColor=white)](#)

---

### 📖 Tentang Sistem
**Administrasi Rojabiyyah 2026** adalah platform otomasi administrasi operasional terpadu berbasis web modern yang dirancang untuk mendukung kelancaran kegiatan kepanitiaan berskala besar secara transparan, akuntabel, dan realtime.

Sistem ini mengintegrasikan seluruh lini operasional kepanitiaan ke dalam satu pintu:
- 📦 **Logistik & Inventaris Multi-Sumber**: Pelacakan aset internal dan barang pinjaman lembaga mitra luar lengkap dengan inspeksi kondisi unit fisik.
- 🔄 **Sirkulasi Peminjaman SOP**: Alur permohonan mandiri, persetujuan admin, bukti serah terima foto, hingga penerbitan **Surat Bukti Peminjaman (PDF)** resmi ber-kop surat.
- 👥 **Data Anggota & Smart Batch Import**: Impor massal anggota dari file spreadsheet **Excel / CSV**, pembagian divisi (*Dev*), nomor kontak WhatsApp, dan pembuatan akun login otomatis berurutan (`RJB-001`, `RJB-002`, dst.).
- 👤 **Portal Anggota Mandiri**: Dashboard khusus anggota untuk memantau titik penugasan, status logistik, dan kelola biodata dengan **Upload Foto Profil**.
- 📍 **Kontrol Wilayah & Pelaporan Lapangan Realtime**: Pemantauan posko dan titik acara (*Panggung Utama, Live Streaming, Dokumentasi, Audio, Proyektor, Perkabelan, dsb.*) dengan pelaporan kendala realtime disertai bukti foto/video dari lapangan.
- 💰 **Rekap Keuangan Kas & Bukti Nota**: Pembukuan kas masuk dan keluar secara terperinci, upload foto kuitansi/nota transaksi, grafik arus kas, serta ekspor ke **Excel (.xlsx)** & **PDF**.
- 🛡️ **Pusat Pengelola Admin (Multi-Admin RBAC)**: Manajemen tim pengelola admin (5 orang atau lebih) dengan hak akses setara dan proteksi keamanan ketat.
- 🧹 **Pusat Pembersihan Data (Danger Zone)**: Tombol pembersihan seluruh data riwayat operasional sekali klik dengan proteksi konfirmasi frasa verifikasi.
- ⚙️ **Kustomisasi Identitas & Dokumen PRD**: Personalisasi branding, integrasi arsip berkas Google Drive, dan pengunduhan dokumen spesifikasi **PRD & Flowchart (.docx)** langsung dari aplikasi.

Dibangun dengan arsitektur **Monorepo (Dua Project Terpisah: Backend REST API + Frontend Single Page Application)** menggunakan **JavaScript modern (ES Modules)**, performa tinggi dengan **Vite & React 19**, database **MySQL di Laragon via Prisma ORM**, serta antarmuka bergaya **Glassmorphism Premium** yang responsif untuk desktop maupun mobile.

---

## 🏗️ Arsitektur & Tech Stack

```
apk_rojabiyyah/
├── backend/                  # REST API (Port 5000)
│   ├── prisma/               # schema.prisma (MySQL Laragon), seed.js
│   ├── src/
│   │   ├── config/           # Database & Swagger JSDoc
│   │   ├── controllers/      # HTTP Request Handlers (Auth, Members, Loans, AdminUsers, etc.)
│   │   ├── middlewares/      # Auth JWT, Role Guard, Zod, Rate Limiter, Error Handler
│   │   ├── routes/           # RESTful Endpoints (/api/v1/auth, /members, /admin-users, etc.)
│   │   ├── services/         # Business Logic Layer
│   │   ├── utils/            # JWT, Standard Response, Upload Multer, Excel & PDF Generator
│   │   ├── validators/       # Zod Validation Schemas
│   │   ├── app.js            # Express app configuration & static routes
│   │   └── server.js         # HTTP Server entry point
│   ├── uploads/              # Penyimpanan media foto barang, nota kas, avatar & dokumen PRD (.docx)
│   ├── test_all_endpoints.js # Automated E2E API Test Suite (20/20 Pass)
│   ├── .env                  # Konfigurasi database MySQL Laragon & JWT Secrets
│   └── package.json
│
├── frontend/                 # Single Page Application (Port 5173)
│   ├── public/               # Static assets & file unduhan PRD_SISTEM_ADMINISTRASI_ROJABIYYAH_2026.docx
│   ├── src/
│   │   ├── api/              # Axios instance dengan interceptor auto-refresh token JWT
│   │   ├── components/
│   │   │   ├── admin/        # ResetDataModal, user management modals
│   │   │   ├── layout/       # Sidebar (collapsible & categorized), Header, BottomNav
│   │   │   ├── loans/        # LoanPhotoProofModal, LoanPrintDocumentsModal (PDF)
│   │   │   └── ui/           # Modal, StatCard, StatusBadge, ToastContainer
│   │   ├── pages/
│   │   │   ├── auth/         # LoginPage (Glassmorphism AI-style + Quick Demo Login)
│   │   │   ├── admin/        # AdminDashboard, Inventory, Loans, Members, RegionControl, Finance, 
│   │   │   │                 # AdminUsersPage (5 Pengelola), AdminSettingsPage
│   │   │   └── anggota/      # MemberDashboard, MemberLoansPage, MemberProfilePage (Foto Profil),
│   │   │                     # MemberRegionControlPage, MemberDirectoryPage
│   │   ├── routes/           # ProtectedRoute dengan role guard (SUPER_ADMIN / ANGGOTA)
│   │   ├── store/            # Zustand authStore & themeStore
│   │   ├── lib/              # Utility Tailwind, formatRupiah, formatDate
│   │   ├── App.jsx           # Routing & QueryClientProvider
│   │   └── main.jsx
│   ├── index.html            # Google Font: Plus Jakarta Sans
│   ├── tailwind.config.js    # Glassmorphism, glow shadows, indigo-violet-cyan gradients
│   ├── .env                  # VITE_API_URL
│   └── package.json
│
├── PRD_SISTEM_ADMINISTRASI_ROJABIYYAH_2026.docx # Dokumen Resmi Spesifikasi & Flowchart (Word)
└── README.md
```

---

## ⚡ Panduan Instalasi & Menjalankan

### 1. Prasyarat
- **Laragon**: Pastikan service **MySQL** dalam status Running (port default `3306`, user `root`, password kosong `""`).
- **Node.js**: v18 ke atas (direkomendasikan v20/v24) dan npm.

### 2. Setup Database & Backend
```bash
cd backend

# 1. Install dependencies
npm install

# 2. Sinkronisasi skema ke MySQL Laragon
npx prisma db push

# 3. Generate client Prisma
npx prisma generate

# 4. Muat data awal (Seeding)
node prisma/seed.js

# 5. Jalankan server backend (Port 5000)
npm run dev
```

Server backend akan aktif di: **http://localhost:5000**
Dokumentasi Swagger API interaktif: **http://localhost:5000/api/docs**

### 3. Setup Frontend
Buka terminal baru di folder frontend:
```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Jalankan server frontend Vite (Port 5173)
npm run dev
```

Aplikasi web dapat diakses langsung di browser: **http://localhost:5173**

---

## 🔑 Akun Demo Default (Hasil Seeding)

| Peran | Username | Email | Password | Hak Akses |
|---|---|---|---|---|
| **SUPER_ADMIN** | `admin` | `admin@rojabiyyah.org` | `admin123` | Akses penuh ke seluruh modul, persetujuan peminjaman, kontrol wilayah, keuangan, dan pengaturan |
| **ANGGOTA (PIC Panggung)** | `ahmad` | `ahmad@rojabiyyah.org` | `anggota123` | Akses katalog, ajukan pinjaman, kontrol wilayah pos panggung, direktori anggota |
| **ANGGOTA (PIC Gerbang)** | `siti` | `siti@rojabiyyah.org` | `anggota123` | Akses katalog, ajukan pinjaman, kontrol wilayah pos gerbang, direktori anggota |

> 💡 *Pada halaman login telah disediakan tombol instan **"Super Admin"** dan **"Anggota (Ahmad)"** untuk mengisi kredensial dengan satu kali klik.*

---

## 📋 Fitur Utama Sistem

### 1. 🛡️ Autentikasi, Keamanan Tingkat Tinggi & Multi-Admin RBAC (5+ Pengelola)
- **Keamanan Berlapis (Dual-Token JWT)**: Access Token (15 menit) + Refresh Token via cookie `httpOnly` (7 hari) dengan auto-refresh transparan via Axios Interceptor.
- **Proteksi Server**: Global Rate Limiting, Helmet HTTP security headers, sanitasi payload, dan pembatasan CORS ketat.
- **Kelola Pengelola Admin**: Mendukung tim pengelola admin (hingga 5 orang atau lebih) dengan hak akses setara, fitur ganti password aman, status aktif/nonaktif, serta proteksi akun Super Admin utama agar tidak terhapus.
- **Enkripsi Kredensial**: Hashing password menggunakan `bcrypt` ber-salt tinggi.

### 2. 👥 Manajemen Data Anggota & Smart Import Excel / CSV
- **Impor Massal Excel/CSV**: Fasilitas upload file `.xlsx`, `.xls`, atau `.csv` langsung dari modal dialog tanpa perlu input satu per satu.
- **Smart Column Mapping**: Mengenali susunan kolom: `NO`, `NAMA` (wajib), `DEV` (Divisi), `PENDIDIKAN`, `KELAS`, `DOMISILI`, `SERAGAM`, `NO WA`.
- **Otomasi Akun & ID**: Otomatis menghasilkan Nomor Induk Anggota unik (`RJB-001`, `RJB-002`, dst.) dan langsung membuatkan akun login portal anggota dengan password bawaan.
- **Unduh Template Excel**: Disediakan tombol download template spreadsheet standar agar format data yang dimasukkan selalu valid dan rapi.
- **Pencarian & Filter Cepat**: Filter anggota berdasarkan divisi/peran penugasan, status keaktifan, dan pencarian instan nama.

### 3. 👤 Portal Mandiri Anggota & Pengaturan Profil (Foto Profil)
- **Beranda Personal Anggota**: Ringkasan titik tugas wilayah yang diemban, permohonan logistik berjalan, dan riwayat peminjaman.
- **Kelola Profil & Foto**: Menu pengaturan profil anggota untuk memperbarui biodata, domisili, nomor WhatsApp, serta **Upload Foto Profil** pribadi dengan pratinjau langsung.
- **Akses Pintas Cepat**: Tombol akses langsung menuju Google Drive Unduhan Berkas resmi dan Jadwal Penugasan pada header portal.

### 4. 📦 Manajemen Inventaris & Logistik Terpadu
- **Dual Sumber Kepemilikan**:
  - **Inventaris Internal**: Aset mandiri milik organisasi/panitia.
  - **Pinjaman Lembaga Mitra**: Barang logistik yang dipinjam dari instansi eksternal (terlabel otomatis nama instansi peminjam).
- **Tracking Kondisi & Stok**: Pemantauan jumlah unit total, unit tersedia, unit dipinjam, serta klasifikasi kondisi (*Baik, Rusak Ringan, Rusak Berat*).
- **Upload Dokumentasi**: Unggah foto fisik barang dan integrasi kolom kustom dinamis (*Custom Fields*).
- **Ekspor Data**: Rekap data inventaris ke format spreadsheet **Excel (.xlsx)** dalam satu klik.

### 5. 🔄 Sirkulasi Peminjaman Logistik & Cetak Dokumen PDF Resmi
- **Alur Persetujuan SOP Transparan**:
  1. *Permohonan*: Anggota mengajukan permohonan unit via katalog portal.
  2. *Persetujuan*: Admin meninjau permohonan (*Setujui / Tolak*). Stok otomatis berkurang secara atomik saat disetujui.
  3. *Serah Terima (Dipinjam)*: Upload foto bukti serah terima logistik.
  4. *Pengembalian*: Pemeriksaan fisik unit saat kembali (*Baik / Rusak Ringan / Rusak Berat*), stok otomatis bertambah kembali ke gudang.
- **Cetak Surat Bukti Peminjaman (PDF)**: Otomatis menghasilkan lembar bukti peminjaman resmi lengkap dengan kop organisasi, QR/verifikasi, dan tanda tangan pihak terkait.

### 6. 📍 Kontrol Wilayah, Pembagian Penugasan & Pelaporan Lapangan Realtime
- **Penugasan Posko Acara**: Pembagian titik tugas panitia (*Panggung Utama, Dokumentasi, Live Streaming, Foto, Video, Proyektor, Perkabelan, dsb.*) dengan penunjukan PIC penanggung jawab.
- **Pelaporan Lapangan Realtime**: Anggota posko dapat melaporkan kondisi fasilitas di lokasi secara berkala (*Normal/Baik, Perlu Perhatian, Rusak/Kendala*) disertai deskripsi kendala dan bukti foto/video langsung dari lokasi.
- **Tindak Lanjut Admin**: Timeline kendala di dashboard admin dengan status interaktif (*In Progress* hingga *Resolved*) serta input instruksi solusi resmi.

### 7. 💰 Rekap Keuangan Kas & Pembukuan Transparan
- **Pencatatan Kas Masuk & Keluar**: Input nominal, tanggal transaksi, kategori kas, dan uraian kebutuhan.
- **Upload Bukti Pembayaran**: Lampiran foto nota, kuitansi, atau struk fisik belanja untuk transparansi akuntabilitas.
- **Kalkulasi & Grafik Otomatis**: Ringkasan Total Pemasukan, Total Pengeluaran, Saldo Kas Bersih terkini, serta grafik visual pergerakan kas 6 bulan.
- **Ekspor Laporan Keuangan**: Unduh laporan pembukuan rapi ke file **Excel (.xlsx)** dan dokumen cetak **PDF**.

### 8. 🗂️ Navigasi Dashboard Terkategori & Rapi
- Struktur sidebar disusun ergonomis berdasarkan kelompok kerja:
  - **RINGKASAN**: Administrasi Dashboard & metrik statistik utama.
  - **LAYANAN & OPERASIONAL**: Pembagian Penugasan, Inventaris Internal, Pinjaman Mitra, Peminjaman Anggota, Data Anggota, Kontrol Wilayah, dan Rekap Uang Kas.
  - **KONTEN & BERKAS**: Pengelolaan Foto Slider Depan dan Google Drive Berkas & Arsip Dokumen.
  - **PENGATURAN & SISTEM**: Kelola Pengelola Admin (Multi-User) dan Pengaturan Sistem & Branding.

### 9. 🧹 Pusat Pembersihan & Reset Data Operasional (Danger Zone)
- **Pembersihan Cepat Sekali Klik**: Fitur di Pengaturan Sistem untuk mereset seluruh data riwayat operasional (peminjaman, laporan lapangan, kas, penugasan, log) sekaligus sehingga tidak perlu menghapus satu per satu secara manual.
- **Proteksi Verifikasi Ganda**: Memerlukan konfirmasi frasa verifikasi (`RESET OPERASIONAL`) untuk mencegah ketidaksengajaan.
- **Jaminan Integritas Master Data**: Akun pengelola admin, master kategori, wilayah, dan konfigurasi identitas dasar tetap aman terlindungi dan tidak ikut terhapus.

### 10. ⚙️ Kustomisasi Identitas, Google Drive & Unduh Dokumen PRD
- **Pengaturan Branding & Kop Surat**: Kustomisasi nama sistem, logo aplikasi, sub-tema acara (Haul & Rojabiyyah), dan teks kop surat dokumen cetak.
- **Pusat Berkas Google Drive**: Konfigurasi tautan folder Google Drive terpusat yang otomatis terhubung ke seluruh dashboard admin dan portal anggota.
- **Kolom Kustom Dinamis (*Custom Fields*)**: Fleksibilitas menambah atribut kolom data baru (teks, angka, dropdown) tanpa merombak skema database.
- **Unduh Dokumen PRD & Flowchart (.docx)**: Tombol unduh instan dokumen spesifikasi sistem (Word `.docx`) langsung dari antarmuka Pengaturan Sistem.

### 11. 🖼️ Pengelolaan Slider Beranda Publik
- Pengaturan materi visual banner di halaman publik depan (upload gambar resolusi tinggi, penyesuaian judul, deskripsi banner, dan tombol aktivasi/nonaktif tayang).

---

## 🧪 Pengujian Sistem (Automated Tests)
Jalankan pengujian end-to-end seluruh modul API backend:
```bash
cd backend
node test_all_endpoints.js
```
Hasil: **20/20 Test Berhasil (100% Pass)**.
Dokumentasi Swagger OpenAPI interaktif dapat diuji di browser: **http://localhost:5000/api/docs**.

