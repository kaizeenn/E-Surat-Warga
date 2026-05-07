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
npm run dev            # http://localhost:3001
```

> **Catatan port:** Backend default di **3002** (port 3000 sering bentrok
> dengan dev server lain). Ubah lewat `backend/.env` (`PORT=...`)
> dan sesuaikan `frontend/.env` (`VITE_API_URL=http://localhost:PORT/api`).

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
├── backend/         # API Express + MySQL
├── frontend/        # React SPA
├── docs/            # ERD, Activity, Use Case
└── README.md
```

## Cara Pakai (User Flow)

1. Buka `http://localhost:3001` → klik "Masuk sebagai Admin".
2. Login dengan `atmin@rtrw.local` / `atmin123`.
3. Buka tab incognito → daftar akun warga baru di `/register`.
4. Setelah daftar otomatis masuk dashboard warga → "Ajukan Surat".
5. Pilih jenis surat (Domisili / Tidak Mampu / Usaha), isi form, preview, kirim.
6. Kembali ke admin → lihat permohonan masuk → klik Review.
7. Klik "Approve & Terbitkan" → sistem auto-generate nomor + PDF.
8. Warga refresh detail permohonan → tombol Download PDF muncul.

## Lisensi

MIT
