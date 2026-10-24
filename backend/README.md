# Backend Administrasi Rojabiyyaah

RESTful API backend untuk sistem informasi manajemen organisasi **Administrasi Rojabiyyaah**.

## 🛠️ Tech Stack
- **Runtime**: Node.js v24 (JavaScript ES Modules)
- **Framework**: Express.js
- **Database**: MySQL via Laragon
- **ORM**: Prisma ORM v6
- **Autentikasi**: JWT (Access Token + Refresh Token via HTTP-only Cookie) + bcryptjs
- **Keamanan**: Helmet, CORS terproteksi, Rate Limiting terpusat
- **Dokumentasi**: Swagger OpenAPI di `/api/docs`

---

## 🚀 Panduan Instalasi & Menjalankan

### 1. Prasyarat
- Laragon terpasang dan service **MySQL** dalam keadaan Running.
- Node.js (v18+) dan npm.

### 2. Konfigurasi Database (.env)
Pastikan file `.env` di folder `backend/` memiliki kredensial MySQL Laragon yang sesuai:
```env
PORT=5000
FRONTEND_URL=http://localhost:5173
DATABASE_URL="mysql://root:@localhost:3306/administrasi_rojabiyyaah"
JWT_ACCESS_SECRET="rojabiyyaah_access_super_secret_key_2026_xyz"
JWT_REFRESH_SECRET="rojabiyyaah_refresh_super_secret_key_2026_abc"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
```

### 3. Migrasi & Seed Database
```bash
# Sinkronkan skema ke MySQL
npx prisma db push

# Generate Prisma Client
npx prisma generate

# Isi data awal (seed)
node prisma/seed.js
```

### 4. Menjalankan Server
```bash
# Mode development (live reload)
npm run dev

# Mode production
npm start
```
Server akan aktif di: **http://localhost:5000**
Dokumentasi Swagger API interaktif: **http://localhost:5000/api/docs**

---

## 🔑 Akun Demo Default (Hasil Seeding)
| Peran | Username | Email | Password |
|---|---|---|---|
| **SUPER_ADMIN** | `admin` | `admin@rojabiyyah.org` | `admin123` |
| **ANGGOTA** | `ahmad` | `ahmad@rojabiyyah.org` | `anggota123` |
| **ANGGOTA** | `siti` | `siti@rojabiyyah.org` | `anggota123` |

