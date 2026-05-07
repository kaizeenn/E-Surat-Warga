# Surat Warga — Generator Surat RT/RW

Sistem web untuk warga mengajukan surat keterangan (domisili, tidak mampu, usaha, dll) secara online. Admin RT/RW review, approve, dan sistem generate PDF otomatis.

## Quick Start

### Prasyarat
- Node.js ≥ 18
- MySQL ≥ 8
- npm

### Setup Database
```bash
mysql -u root -p
> CREATE DATABASE surat_warga CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
> exit
```

### Setup Backend
```bash
cd backend
cp .env.example .env   # edit sesuai kredensial MySQL kamu
npm install
npm run db:migrate     # buat tabel
npm run db:seed        # akun admin + template default
npm run dev            # default: http://localhost:3002
```

### Setup Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev            # http://localhost:3003
```

> **Catatan port:** Backend default di **3002**, frontend di **3003**.
> Ubah lewat `backend/.env` (`PORT=...`) dan `frontend/vite.config.js`,
> lalu sesuaikan `frontend/.env` (`VITE_API_URL`) dan
> `backend/.env` (`FRONTEND_URL` untuk CORS).

## Kredensial Default (setelah seed)

| Role | Email | Password |
|---|---|---|
| Admin | `atmin@rtrw.local` | `atmin123` |

> Ganti password admin setelah login pertama.

## Dokumentasi

- [ERD (Entity Relationship Diagram)](docs/ERD.md)
- [Activity Diagram](docs/Activity-Diagram.md)
- [Use Case Diagram](docs/Use-Case-Diagram.md)
- [API Documentation](docs/API.md)

## Tech Stack

**Backend:** Node.js · Express · Sequelize · MySQL · JWT · Bcrypt · Puppeteer
**Frontend:** React 18 · Vite · Tailwind CSS · React Router · Axios

## Struktur Project

```
surat-warga/
├── backend/                       # API Express + MySQL
│   ├── src/
│   │   ├── config/                # Database config (Sequelize)
│   │   ├── controllers/           # auth, surat, admin
│   │   ├── middleware/            # JWT auth (warga/admin)
│   │   ├── models/                # 5 model + asosiasi
│   │   ├── routes/                # /api/auth, /api/surat, /api/admin
│   │   ├── scripts/               # migrate.js, seed.js
│   │   ├── services/              # pdfGenerator (Puppeteer)
│   │   ├── templates/             # HTML template surat
│   │   ├── utils/                 # jwt, nomorSurat helper
│   │   ├── app.js                 # Express setup
│   │   └── server.js              # Entry point
│   ├── uploads/surat/             # Output PDF
│   ├── .env.example
│   └── package.json
├── frontend/                      # React SPA + Vite
│   ├── src/
│   │   ├── components/            # Icon, Layout, ProtectedRoute, StatusBadge
│   │   ├── context/               # AuthContext
│   │   ├── pages/
│   │   │   ├── warga/             # Dashboard, AjukanSurat, list, detail
│   │   │   ├── admin/             # Dashboard, list, detail, Arsip
│   │   │   └── Home, Login, Register
│   │   ├── services/              # api.js (axios)
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── public/
│   ├── .env.example
│   └── package.json
├── docs/                          # ERD, Activity, Use Case, API
├── start.sh                       # Helper run backend + frontend
├── .gitignore
└── README.md
```

## Cara Pakai (User Flow)

1. Buka `http://localhost:3003` → langsung tampil halaman **Login**.
2. Login admin: `atmin@rtrw.local` / `atmin123` → sistem otomatis arahkan ke dashboard admin.
3. Buka tab incognito → di halaman login klik **Daftar Akun Warga** → isi form registrasi.
4. Setelah daftar, otomatis masuk dashboard warga → **Ajukan Surat**.
5. Pilih jenis surat (Domisili / Tidak Mampu / Usaha), isi form, preview, kirim.
6. Kembali ke admin → lihat permohonan masuk → klik **Review**.
7. Klik **Approve & Terbitkan** → sistem auto-generate nomor + PDF.
8. Warga refresh detail permohonan → tombol **Download PDF** muncul.

> **Login terpadu:** satu halaman login untuk warga & admin.
> Sistem otomatis mendeteksi role berdasarkan email yang terdaftar di
> database (cek tabel `admin` dulu, lalu `warga`).
> Registrasi (`/register`) **hanya untuk warga** — akun admin
> dibuat oleh pengurus RT/RW lewat seed/database.

## Lisensi

MIT
