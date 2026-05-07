# Surat Warga — Generator Surat RT/RW

Sistem web untuk warga mengajukan surat keterangan (domisili, tidak mampu, usaha, dll) secara online. Admin RT/RW review, approve, dan sistem generate PDF otomatis.

## 🚀 Quick Start

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
npm run dev            # jalan di http://localhost:3000
```

### Setup Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev            # jalan di http://localhost:3001
```

## 🔑 Kredensial Default (setelah seed)

| Role | Email | Password |
|---|---|---|
| Admin | `atmin@rtrw.local` | `atmin123` |

> ⚠️ Ganti password admin setelah login pertama!

## 📚 Dokumentasi

- [ERD (Entity Relationship Diagram)](docs/ERD.md)
- [Activity Diagram](docs/Activity-Diagram.md)
- [Use Case Diagram](docs/Use-Case-Diagram.md)
- [API Documentation](docs/API.md)

## 🛠️ Tech Stack

**Backend:** Node.js · Express · Sequelize · MySQL · JWT · Bcrypt · Puppeteer
**Frontend:** React 18 · Vite · Tailwind CSS · React Router · Axios

## 📁 Struktur Project

```
surat-warga/
├── backend/         # API Express + MySQL
├── frontend/        # React SPA
├── docs/            # ERD, Activity, Use Case
└── README.md
```

## 📜 Lisensi

MIT
