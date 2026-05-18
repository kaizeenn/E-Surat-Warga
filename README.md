# e-Surat Desa — Layanan Surat Digital

Sistem web untuk warga mengajukan surat keterangan (domisili, tidak mampu, usaha, dll) secara online. Admin desa/RT/RW review, approve, dan sistem generate PDF otomatis.

## Quick Start

### Prasyarat
- Node.js ≥ 18
- MySQL ≥ 8
- npm

### Setup Database
```bash
cd backend
mysql -u root -p < database/schema.sql
```

### Setup Backend
```bash
cd backend
cp .env.example .env   # edit sesuai kredensial MySQL kamu
npm install
npm run dev            # default: http://localhost:3000
```

### Setup Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev            # http://localhost:3001
```

> **Catatan port:** Backend default di **3000**, frontend di **3001**.
> Ubah lewat `backend/.env` (`PORT=...`) dan `frontend/vite.config.js`,
> lalu sesuaikan `frontend/.env` (`VITE_API_URL`) dan
> `backend/.env` (`FRONTEND_URL` untuk CORS).

## Kredensial Default

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

**Backend:** Node.js · Express · MySQL2 · MySQL · JWT · Bcrypt · Puppeteer · Multer
**Frontend:** React 18 · Vite · Tailwind CSS · React Router · Axios

## Struktur Project

```
surat-warga/                       # project e-Surat Desa
├── backend/                       # API Express + MySQL, struktur mirip PeringatanBanjir
│   ├── config/                    # db.js koneksi MySQL langsung
│   ├── middleware/                # JWT auth (warga/admin)
│   ├── models/                    # fungsi query MySQL per tabel, tanpa Sequelize/ORM
│   ├── routes/                    # endpoint Express, memanggil models
│   ├── database/                  # schema.sql untuk struktur dan data awal database
│   ├── services/                  # pdfGenerator (Puppeteer)
│   ├── templates/                 # HTML template surat
│   ├── utils/                     # jwt, nomorSurat helper
│   ├── app.js                     # Express setup
│   ├── server.js                  # Entry point
│   ├── uploads/surat/             # Output PDF
│   ├── uploads/ttd/               # File TTD digital admin
│   ├── uploads/persyaratan/       # Lampiran persyaratan surat dari warga
│   ├── .env.example
│   └── package.json
├── frontend/                      # React SPA + Vite
│   ├── src/
│   │   ├── components/            # Icon, Layout, ProtectedRoute, StatusBadge
│   │   ├── context/               # AuthContext
│   │   ├── pages/
│   │   │   ├── warga/             # Dashboard, AjukanSurat, list, detail
│   │   │   ├── admin/             # Dashboard, list, detail, Arsip, Template
│   │   │   └── Login, Register, Profil
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

1. Buka `http://localhost:3001` → langsung tampil halaman **Login**.
2. Login admin: `atmin@rtrw.local` / `atmin123` → sistem otomatis arahkan ke dashboard admin.
3. Buka tab incognito → di halaman login klik **Daftar Akun Warga** → isi form registrasi.
4. Setelah daftar, otomatis masuk dashboard warga → **Ajukan Surat**.
5. Pilih jenis surat (Domisili / Tidak Mampu / Usaha), isi form, upload lampiran persyaratan, preview, lalu kirim.
6. Opsional: admin buka **Profil → TTD Digital** untuk upload tanda tangan.
7. Kembali ke admin → lihat permohonan masuk → klik **Review**.
8. Admin verifikasi lampiran satu per satu (valid / tidak valid / pending) dan bisa memberi catatan per lampiran.
9. Jika semua lampiran wajib sudah valid, klik **Approve & Terbitkan** → sistem auto-generate nomor + PDF.
10. Warga refresh detail permohonan → status lampiran, catatan admin, dan tombol **Download PDF** akan tampil sesuai progres.

> **Login terpadu:** satu halaman login untuk warga & admin.
> Sistem otomatis mendeteksi role berdasarkan email yang terdaftar di
> database (cek tabel `admin` dulu, lalu `warga`).
> Registrasi (`/register`) **hanya untuk warga** — akun admin
> dibuat oleh pengurus desa/RT/RW lewat database.

## Template Surat Default

Saat ini template default yang tersedia:
- **Surat Keterangan Domisili**
- **Surat Keterangan Tidak Mampu (SKTM)**
- **Surat Keterangan Usaha (SKU)**

NIK **tidak diinput ulang** saat pengajuan surat karena sistem mengambilnya dari akun warga yang sedang login.

## Upload Lampiran Persyaratan

Warga dapat mengunggah berkas persyaratan langsung saat mengajukan surat.

- format upload memakai `multipart/form-data`
- file disimpan di `backend/uploads/persyaratan`
- batas ukuran file: **5 MB per file**
- lampiran wajib harus diunggah sebelum permohonan dikirim

## Verifikasi Lampiran oleh Admin

Admin dapat memverifikasi lampiran per persyaratan dengan status:
- `valid`
- `tidak_valid`
- `pending`

Admin juga bisa menambahkan catatan verifikasi per lampiran.
Permohonan **tidak bisa di-approve** jika masih ada lampiran wajib yang:
- belum diupload, atau
- belum berstatus `valid`

## Catatan Struktur Database

Struktur database dibuat sederhana seperti kebutuhan tugas kampus. Tabel utama hanya:
- `warga`
- `admin`
- `template_surat`
- `permohonan_surat`
- `nomor_surat`

Data penting pengajuan disimpan langsung di `permohonan_surat`, misalnya:
- `nomor_kk`
- `tujuan_instansi`
- `tujuan_penggunaan`
- `kondisi_ekonomi`
- `nama_usaha`, `jenis_usaha`, `alamat_usaha`
- `file_ktp`, `file_kk` untuk path file upload
- `status_ktp`, `status_kk`

Jadi tidak ada lagi penyimpanan JSON dan tidak ada tabel tambahan untuk data yang tidak diperlukan.

## Lisensi

MIT
