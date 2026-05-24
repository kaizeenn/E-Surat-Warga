# Generator Surat Warga Otomatis

Aplikasi web yang memungkinkan warga memohon surat keterangan secara online — pilih jenis surat, isi form, sistem generate PDF siap cetak. Admin RT/RW cukup review, approve, dan tanda tangan. Tidak perlu ketik ulang, tidak perlu antri.

---

## Daftar Isi

- [Fitur Utama](#fitur-utama)
- [Tech Stack](#tech-stack)
- [Struktur Proyek](#struktur-proyek)
- [Instalasi & Setup](#instalasi--setup)
- [Konfigurasi Environment](#konfigurasi-environment)
- [Menjalankan Aplikasi](#menjalankan-aplikasi)
- [Skema Database](#skema-database)
  - [Diagram Relasi (ERD)](#diagram-relasi-erd)
  - [Trade-off Pemisahan warga & admin](#trade-off-pemisahan-warga--admin)
- [API Endpoint](#api-endpoint)
- [Jenis Surat yang Didukung](#jenis-surat-yang-didukung)
- [Alur Penggunaan](#alur-penggunaan)
- [Struktur Halaman](#struktur-halaman)
- [Role & Hak Akses](#role--hak-akses)
- [Contoh Generate PDF](#contoh-generate-pdf)
- [Deployment](#deployment)
- [Roadmap](#roadmap)

---

## Fitur Utama

### Warga
- Daftar dan login ke akun pribadi
- Pilih jenis surat dari daftar yang tersedia
- Isi form sesuai kebutuhan surat (data otomatis sebagian dari profil)
- Preview tampilan surat sebelum submit permohonan
- Pantau status permohonan secara real-time
- Download PDF surat yang sudah diapprove

### Admin RT/RW
- Notifikasi permohonan masuk dari warga
- Review detail data yang diisi warga
- Approve atau tolak permohonan (dengan catatan alasan)
- Sistem generate PDF otomatis setelah approve — lengkap dengan kop surat, nomor surat berurutan, dan tanggal
- Arsip digital semua surat yang pernah diterbitkan
- Cari dan filter surat berdasarkan nama warga, jenis surat, atau tanggal

---

## Tech Stack

| Layer | Teknologi |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | MySQL 8 |
| Database Driver | MySQL2 (`mysql2/promise`) |
| Autentikasi | JWT (JSON Web Token) |
| Generate PDF | Puppeteer (render HTML → PDF) |
| Upload File | Multer |
| Hosting Backend | Railway |
| Hosting Frontend | Vercel |

---

## Struktur Proyek

```
surat-warga/
├── backend/
│   ├── app.js
│   ├── server.js
│   ├── config/
│   │   └── db.js                    # Koneksi MySQL langsung dengan mysql2
│   ├── middleware/
│   │   └── auth.js                  # Verifikasi JWT + role
│   ├── models/                      # fungsi query MySQL per tabel, tanpa Sequelize/ORM
│   │   ├── Warga.js
│   │   ├── Admin.js
│   │   ├── TemplateSurat.js
│   │   ├── PermohonanSurat.js
│   │   └── NomorSurat.js
│   ├── routes/                      # endpoint Express yang memanggil models
│   │   ├── auth.js
│   │   ├── surat.js
│   │   └── admin.js
│   ├── database/
│   │   └── schema.sql               # Struktur tabel dan data awal database
│   ├── services/
│   │   └── pdfGenerator.js          # Logic generate PDF dengan Puppeteer
│   ├── templates/                   # Template HTML universal
│   │   ├── _kop.html
│   │   └── universal.html
│   ├── uploads/
│   │   ├── persyaratan/
│   │   ├── surat/
│   │   └── ttd/
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Icon.jsx
    │   │   ├── ProtectedRoute.jsx
    │   │   └── StatusBadge.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── Landing.jsx
    │   │   ├── Login.jsx
    │   │   ├── Profil.jsx
    │   │   ├── Register.jsx
    │   │   ├── warga/
    │   │   │   ├── AjukanSurat.jsx
    │   │   │   ├── Dashboard.jsx
    │   │   │   ├── PermohonanDetail.jsx
    │   │   │   └── PermohonanList.jsx
    │   │   └── admin/
    │   │       ├── Arsip.jsx
    │   │       ├── Dashboard.jsx
    │   │       ├── PermohonanDetail.jsx
    │   │       ├── PermohonanList.jsx
    │   │       ├── TemplateForm.jsx
    │   │       └── TemplateList.jsx
    │   ├── services/
    │   │   └── api.js
    │   ├── utils/
    │   │   └── session.js
    │   └── App.jsx
    ├── .env.example
    └── package.json
```

---

## Instalasi & Setup

### Prasyarat

Pastikan sudah terinstal di komputer:
- Node.js v18 atau lebih baru
- npm atau yarn
- MySQL 8
- Google Chrome / Chromium (dibutuhkan Puppeteer untuk generate PDF)

### Clone Repository

```bash
git clone https://github.com/username/surat-warga.git
cd surat-warga
```

### Install Dependensi Backend

```bash
cd backend
npm install
```

Dependensi utama yang akan terinstall:

```
express         → Framework HTTP server
mysql2          → Driver MySQL untuk query SQL langsung
jsonwebtoken    → Autentikasi JWT
bcryptjs        → Hash password
puppeteer       → Generate PDF dari HTML
cors            → Izinkan akses dari frontend
dotenv          → Baca file .env
```

### Install Dependensi Frontend

```bash
cd ../frontend
npm install
```

---

## Konfigurasi Environment

### Backend — `backend/.env`

```bash
cp .env.example .env
```

Isi file `.env`:

```env
# Server
PORT=3000
NODE_ENV=development

# Database MySQL
DB_HOST=localhost
DB_PORT=3306
DB_NAME=surat_warga
DB_USER=root
DB_PASS=password_mysql_kamu

# JWT
JWT_SECRET=ganti_dengan_string_acak_panjang_minimal_32_karakter
JWT_EXPIRES_IN=7d

# Info RT/RW (tampil di kop surat PDF)
RT_NOMOR=02
RW_NOMOR=03
KELURAHAN=Saronggi
KECAMATAN=Saronggi
KOTA=Sumenep
PROVINSI=Jawa Timur
```

### Frontend — `frontend/.env`

```env
VITE_API_URL=http://localhost:3000/api
```

---

## Menjalankan Aplikasi

### 1. Buat Database MySQL

```sql
CREATE DATABASE surat_warga CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Import Database

```bash
cd backend
mysql -u root -p < database/schema.sql
```

File `database/schema.sql` akan membuat tabel dan mengisi data awal seperti akun admin serta template surat default.

Data awal akan membuat 1 akun admin default di tabel `admin`:
```
Email    : atmin@rtrw.local
Password : atmin123
Jabatan  : Ketua RT
```
> Ganti password admin setelah login pertama kali via endpoint `PUT /api/auth/profil`.
> Akun warga **tidak dibuat lewat data awal** — warga mendaftar mandiri lewat
> halaman `/register`.

### 3. Jalankan Backend

```bash
cd backend
npm run dev
# Server berjalan di http://localhost:3000
```

### 4. Jalankan Frontend

```bash
cd frontend
npm run dev
# Aplikasi berjalan di http://localhost:3001
```

---

## Skema Database

> **Catatan desain:** akun **warga** dan **admin** disimpan di **tabel terpisah**
> (bukan satu tabel `users` dengan kolom `role`). Alasan:
> - Admin tidak perlu menyimpan data sensitif khas warga (NIK, agama, pekerjaan, dll).
> - Mengurangi kolom NULL yang tidak relevan → storage & validasi lebih bersih.
> - Admin punya kolom khusus seperti `jabatan` dan `ttd_image` untuk dipakai di kop surat.
> - Audit trail lebih jelas: `permohonan_surat.admin_id` mencatat admin mana yang approve/tolak.

### Tabel `warga`

Menyimpan akun warga (pemohon surat). Data demografisnya dipakai untuk auto-fill
isi surat saat di-generate.

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | INT (PK, AI) | Primary key |
| nama_lengkap | VARCHAR(100) | Nama lengkap warga |
| nik | VARCHAR(16) | Nomor Induk Kependudukan, unik |
| email | VARCHAR(100) | Email untuk login, unik |
| password | VARCHAR(255) | Bcrypt hash |
| tempat_lahir | VARCHAR(50) | Untuk isi surat otomatis |
| tanggal_lahir | DATE | Untuk isi surat otomatis |
| jenis_kelamin | ENUM | `laki-laki`, `perempuan` |
| alamat | TEXT | Alamat lengkap |
| agama | VARCHAR(20) | Untuk isi surat otomatis |
| pekerjaan | VARCHAR(50) | Untuk isi surat otomatis |
| no_hp | VARCHAR(15) | Nomor handphone |
| created_at | DATETIME | Waktu daftar |

### Tabel `admin`

Menyimpan akun pengurus RT/RW (Ketua RT, Sekretaris, dll). Hanya berisi kolom
yang relevan untuk operasional admin.

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | INT (PK, AI) | Primary key |
| nama_lengkap | VARCHAR(100) | Nama lengkap admin |
| email | VARCHAR(100) | Email untuk login, unik |
| password | VARCHAR(255) | Bcrypt hash |
| jabatan | VARCHAR(50) | `Ketua RT`, `Sekretaris`, dll (tampil di kop surat) |
| no_hp | VARCHAR(15) | Nomor handphone |
| ttd_image | VARCHAR(255) | Path file gambar tanda tangan untuk PDF |
| aktif | BOOLEAN | `true` jika masih menjabat (soft-disable) |
| created_at | DATETIME | Waktu akun dibuat |

### Tabel `template_surat`

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | INT (PK, AI) | Primary key |
| kode | VARCHAR(30) | Kode unik, misal: `DOMISILI` |
| nama | VARCHAR(100) | Nama jenis surat |
| deskripsi | TEXT | Penjelasan kegunaan surat |
| file_template | VARCHAR(100) | Nama file HTML template (universal.html) |
| fields | JSON | Definisi form dinamis (name, label, type, required) |
| kalimat_penutup | TEXT | Teks penutup surat (bisa pakai placeholder) |
| aktif | BOOLEAN | Apakah jenis surat ini aktif |

Catatan:
- Semua jenis surat memakai `universal.html`.
- Admin cukup mengisi **fields** dan **kalimat_penutup** lewat dashboard.

### Tabel `permohonan_surat`

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | INT (PK, AI) | Primary key |
| warga_id | INT (FK) | FK ke `warga.id` — pemohon |
| template_id | INT (FK) | FK ke `template_surat.id` — jenis surat |
| admin_id | INT (FK, NULL) | FK ke `admin.id` — admin yang approve/tolak (NULL saat masih `menunggu`) |
| nomor_surat | VARCHAR(50) | Nomor surat (diisi saat approve) |
| keperluan | TEXT | Tujuan pembuatan surat |
| data_form | JSON | Isian form dinamis sesuai template |
| file_ktp | VARCHAR(255) | Path file KTP warga |
| file_kk | VARCHAR(255) | Path file KK warga |
| status_ktp | ENUM | `pending`, `valid`, `tidak_valid` |
| status_kk | ENUM | `pending`, `valid`, `tidak_valid` |
| status | ENUM | `menunggu`, `diproses`, `selesai`, `ditolak` |
| catatan_admin | TEXT | Catatan dari admin (opsional) |
| file_pdf | VARCHAR(255) | Path file PDF hasil generate |
| tanggal_approve | DATETIME | Waktu diapprove admin |
| created_at | DATETIME | Waktu permohonan masuk |

> Struktur dibuat sederhana dengan **Hybrid JSON**:
> - `data_form` menyimpan isian dinamis sesuai template.
> - KTP/KK tetap kolom eksplisit supaya bisa diverifikasi per file.
> - Verifikasi lampiran hanya menggunakan `status_ktp` dan `status_kk`.

### Tabel `nomor_surat`

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | INT (PK, AI) | Primary key |
| tahun | YEAR | Tahun penerbitan |
| bulan | TINYINT | Bulan penerbitan |
| urutan | INT | Nomor urut dalam bulan tersebut |

> Nomor surat otomatis format: `001/DS-RT02/V/2025`

### Diagram Relasi (ERD)

```
  WARGA (1) ───< PERMOHONAN_SURAT (N) >─── (1) TEMPLATE_SURAT
                       │
                       │ (N)
                       │
                  (1) ADMIN
                  └─ mencatat siapa yang approve/tolak

  NOMOR_SURAT  →  sequence helper, dibaca saat approve
               (tidak punya FK langsung)
```

| Relasi | Kardinalitas | Keterangan |
|---|---|---|
| `warga` → `permohonan_surat` | 1 : N | Satu warga bisa mengajukan banyak permohonan |
| `template_surat` → `permohonan_surat` | 1 : N | Satu template dipakai banyak permohonan |
| `admin` → `permohonan_surat` | 1 : N | Satu admin bisa approve/tolak banyak permohonan |
| `nomor_surat` | (sequence) | Counter helper, tidak punya FK |

### Trade-off Pemisahan `warga` & `admin`

Konsekuensi dari pemisahan tabel yang perlu diperhatikan saat implementasi:

1. **Login dibuat terpadu** pada satu endpoint login dan sistem menentukan role berdasarkan tabel yang cocok.
2. **Email tidak unik antar tabel** — secara teknis email yang sama bisa ada di kedua tabel. Validasi di aplikasi sebelum INSERT untuk mencegah hal ini.
3. **Middleware `auth.js`** membaca field `type` di JWT untuk menentukan tabel mana yang di-query.
4. **Route dibuat langsung berisi logic endpoint** agar struktur backend lebih sederhana dan sesuai materi kampus yang belum memakai controller terpisah.

---

## API Endpoint

### Autentikasi

Tabel `warga` dan `admin` tetap terpisah, tetapi login dibuat terpadu. Sistem akan
mencari akun berdasarkan email, lalu menentukan role user (`warga` / `admin`) dan
menyimpan `type` pada JWT untuk kebutuhan middleware.

| Method | Endpoint | Deskripsi | Auth |
|---|---|---|---|
| POST | `/api/auth/warga/register` | Daftar akun warga baru | — |
| POST | `/api/auth/login` | Login terpadu warga/admin, dapat JWT token | — |
| GET | `/api/auth/me` | Data profil user yang login (warga/admin sesuai token) | JWT |
| PUT | `/api/auth/profil` | Update data profil sendiri | JWT |

> Akun admin **tidak punya endpoint register publik**. Admin baru ditambahkan
> manual lewat database atau dashboard admin yang sudah login.

### Permohonan Surat (Warga)

| Method | Endpoint | Deskripsi | Auth |
|---|---|---|---|
| GET | `/api/surat/template` | Daftar jenis surat yang tersedia | JWT |
| GET | `/api/surat/template/:kode` | Detail template + field yang dibutuhkan | JWT |
| POST | `/api/surat/ajukan` | Ajukan permohonan surat baru + upload lampiran | JWT |
| GET | `/api/surat/saya` | Riwayat permohonan surat milik sendiri | JWT |
| GET | `/api/surat/saya/:id` | Detail satu permohonan milik warga | JWT |

### Manajemen Admin

| Method | Endpoint | Deskripsi | Auth |
|---|---|---|---|
| GET | `/api/admin/permohonan` | Semua permohonan masuk (bisa filter) | JWT + Admin |
| GET | `/api/admin/permohonan/:id` | Detail permohonan beserta data warga | JWT + Admin |
| PATCH | `/api/admin/permohonan/:id/lampiran/:index/verifikasi` | Verifikasi lampiran per item | JWT + Admin |
| PATCH | `/api/admin/permohonan/:id/approve` | Approve → generate PDF otomatis | JWT + Admin |
| PATCH | `/api/admin/permohonan/:id/tolak` | Tolak permohonan + isi alasan | JWT + Admin |
| POST | `/api/admin/profil/ttd` | Upload TTD digital admin | JWT + Admin |
| DELETE | `/api/admin/profil/ttd` | Hapus TTD digital admin | JWT + Admin |
| GET | `/api/admin/arsip` | Semua surat yang sudah diterbitkan | JWT + Admin |
| GET | `/api/admin/stats` | Statistik ringkasan dashboard | JWT + Admin |

### Contoh Request & Response

**POST `/api/surat/ajukan`**

Request body (contoh Domisili):
```json
{
  "templateKode": "DOMISILI",
  "keperluan": "Keperluan melamar pekerjaan",
  "dataTambahan": {
    "tujuanInstansi": "PT. Maju Bersama Surabaya"
  }
}
```

Request body (contoh Surat Keterangan Usaha):
```json
{
  "templateKode": "USAHA",
  "keperluan": "Keperluan izin usaha dari pemerintah",
  "dataTambahan": {
    "namaUsaha": "Toko Elektronik Jaya",
    "jenisUsaha": "Ritel Barang Elektronik",
    "alamatUsaha": "Jl. Merdeka No. 42 Saronggi",
    "tahunBerdiri": "2020",
    "nomorKk": "3275XXXXXXXXXXXX"
  }
}
```

Response:
```json
{
  "success": true,
  "message": "Permohonan berhasil diajukan",
  "data": {
    "id": 42,
    "status": "menunggu",
    "jenisSurat": "Surat Keterangan Domisili",
    "createdAt": "2025-05-06T09:30:00.000Z"
  }
}
```

**PATCH `/api/admin/permohonan/42/approve`**

Response:
```json
{
  "success": true,
  "message": "Surat berhasil diterbitkan",
  "data": {
    "nomorSurat": "042/DS-RT02/V/2025",
    "filePdf": "/uploads/surat/surat-042-2025.pdf",
    "tanggalTerbit": "2025-05-06T10:15:00.000Z",
    "diapproveOleh": {
      "id": 1,
      "nama": "Budi Santoso",
      "jabatan": "Ketua RT"
    }
  }
}
```

**POST `/api/auth/login`**

Request body:
```json
{
  "email": "warga@example.com",
  "password": "rahasia123"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5...",
    "user": {
      "id": 12,
      "type": "warga",
      "nama_lengkap": "Andi Wijaya",
      "email": "warga@example.com"
    }
  }
}
```

> JWT payload berisi `{ id, type }`. Middleware `auth.js` membaca `type` untuk
> menentukan apakah harus query ke tabel `warga` atau `admin`.

---

## Jenis Surat yang Didukung

| Kode | Nama Surat | Keterangan |
|---|---|---|
| `DOMISILI` | Surat Keterangan Domisili | Bukti tempat tinggal warga |
| `TIDAK_MAMPU` | Surat Keterangan Tidak Mampu | Untuk keringanan biaya pendidikan/kesehatan |
| `USAHA` | Surat Keterangan Usaha | Bukti usaha warga di wilayah RT/RW |

Jenis surat baru dapat ditambahkan admin melalui dashboard tanpa perlu ubah kode.

---

## Alur Penggunaan

### Warga Mengajukan Surat

```
Login → Pilih Jenis Surat → Isi Form → Preview → Submit
  ↓
Status: MENUNGGU
  ↓
(Admin review)
  ↓
Status: SELESAI → Warga download PDF
```

### Admin Memproses Permohonan

```
Notifikasi masuk → Buka detail permohonan → Cek data warga
  ↓
Approve → Sistem generate nomor surat otomatis
  ↓
Puppeteer render HTML template → Export PDF
  ↓
PDF tersimpan di server → Warga bisa download
```

---

## Struktur Halaman

### Halaman Publik
- `/` — Landing page + info cara penggunaan
- `/login` — Form login
- `/register` — Form pendaftaran warga

### Dashboard Warga
- `/dashboard` — Ringkasan: permohonan aktif, surat selesai
- `/surat/buat` — Pilih jenis surat
- `/surat/buat/:kode` — Form isi data surat
- `/surat/preview` — Preview surat sebelum submit
- `/surat/riwayat` — Semua riwayat permohonan
- `/surat/:id` — Detail status permohonan + tombol download

### Dashboard Admin
- `/admin` — Statistik + permohonan terbaru
- `/admin/permohonan` — Daftar semua permohonan (filter status/tanggal)
- `/admin/permohonan/:id` — Detail + tombol approve/tolak
- `/admin/arsip` — Arsip surat yang sudah diterbitkan

---

## Role & Hak Akses

Karena `warga` dan `admin` ada di tabel berbeda, otorisasi ditentukan dari
`type` di JWT, bukan dari kolom `role` lagi.

| Aksi | Warga | Admin |
|---|---|---|
| Daftar mandiri (self-register) | Ya | — (ditambahkan via database/dashboard) |
| Login | Ya | Ya |
| Ajukan permohonan surat | Ya | — |
| Lihat permohonan sendiri | Ya | — |
| Download PDF surat sendiri | Ya | — |
| Lihat semua permohonan | — | Ya |
| Approve / tolak permohonan | — | Ya |
| Generate PDF otomatis | — | Ya (otomatis) |
| Lihat arsip semua surat | — | Ya |
| Kelola template surat | — | Ya |
| Lihat statistik dashboard | — | Ya |

---

## Contoh Generate PDF

File `backend/services/pdfGenerator.js`:

```javascript
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function generateSuratPDF(templateFile, data) {
  // Baca file HTML template
  const templatePath = path.join(__dirname, '../templates', templateFile);
  let html = fs.readFileSync(templatePath, 'utf-8');

  // Ganti placeholder dengan data nyata
  Object.keys(data).forEach(key => {
    html = html.replaceAll(`{{${key}}}`, data[key]);
  });

  // Launch Puppeteer dan generate PDF
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });

  const pdfBuffer = await page.pdf({
    format: 'A4',
    margin: { top: '2cm', right: '2cm', bottom: '2cm', left: '2.5cm' },
    printBackground: true,
  });

  await browser.close();
  return pdfBuffer;
}

module.exports = { generateSuratPDF };
```

Catatan penting (sistem universal):
- `template.file_template` diarahkan ke `universal.html`.
- `EXTRA_ROWS` dibuat dari `template.fields` + `data_form` warga.
- `KALIMAT_PENUTUP` diambil dari `template.kalimat_penutup`.

Contoh template `backend/templates/universal.html`:

```html
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Times New Roman', serif; font-size: 12pt; }
    .kop { text-align: center; border-bottom: 3px double #000; padding-bottom: 10px; }
    .kop h2 { font-size: 16pt; margin: 0; }
    .kop p  { margin: 2px 0; }
    .nomor  { text-align: center; margin: 20px 0; }
    .isi    { line-height: 1.8; }
    .isi td { vertical-align: top; padding: 2px 6px; }
    .ttd    { margin-top: 40px; float: right; text-align: center; width: 250px; }
  </style>
</head>
<body>
  <div class="kop">
    <h2>PEMERINTAH KABUPATEN {{KOTA}}</h2>
    <p>KECAMATAN {{KECAMATAN}} — DESA {{KELURAHAN}}</p>
    <p>RT {{RT_NOMOR}} / RW {{RW_NOMOR}}</p>
  </div>

  <div class="nomor">
    <strong>{{NAMA_SURAT}}</strong><br>
    Nomor: {{NOMOR_SURAT}}
  </div>

  <p>Yang bertanda tangan di bawah ini, Ketua RT {{RT_NOMOR}} RW {{RW_NOMOR}}
  Desa {{KELURAHAN}}, menerangkan bahwa:</p>

  <table class="isi">
    <tr><td>Nama Lengkap</td><td>:</td><td><strong>{{NAMA}}</strong></td></tr>
    <tr><td>NIK</td><td>:</td><td>{{NIK}}</td></tr>
    <tr><td>Tempat / Tgl. Lahir</td><td>:</td><td>{{TTL}}</td></tr>
    <tr><td>Jenis Kelamin</td><td>:</td><td>{{JENIS_KELAMIN}}</td></tr>
    <tr><td>Agama</td><td>:</td><td>{{AGAMA}}</td></tr>
    <tr><td>Pekerjaan</td><td>:</td><td>{{PEKERJAAN}}</td></tr>
    <tr><td>Alamat</td><td>:</td><td>{{ALAMAT}}</td></tr>
    {{EXTRA_ROWS}}
  </table>

  <div class="penutup">
    <p>{{KALIMAT_PENUTUP}}</p>
    <p>Demikian surat keterangan ini dibuat dengan sebenarnya untuk dapat dipergunakan sebagaimana mestinya.</p>
  </div>

  <div class="ttd">
    <p>{{KOTA}}, {{TANGGAL_TERBIT}}</p>
    <p>{{ADMIN_JABATAN}}</p>
    <br><br><br>
    <p><strong><u>{{NAMA_ADMIN}}</u></strong></p>
  </div>
</body>
</html>
```

---

## Deployment

### Backend — Railway

```bash
# Install Railway CLI
npm install -g @railway/cli
railway login

# Buat proyek baru
railway init

# Tambahkan plugin MySQL
railway add --plugin mysql

# Deploy
railway up
```

Set environment variable di dashboard Railway sesuai isi `.env`. URL backend akan seperti: `https://surat-warga-production.up.railway.app`

### Frontend — Vercel

```bash
npm install -g vercel
cd frontend
vercel
```

Set `VITE_API_URL` di Settings → Environment Variables → arahkan ke URL Railway.

### Catatan Puppeteer di Production

Tambahkan di `package.json` backend agar Chromium terinstall otomatis saat deploy:

```json
{
  "scripts": {
    "postinstall": "npx puppeteer browsers install chrome"
  }
}
```

---

## Roadmap

- [x] Autentikasi warga dan admin
- [x] Form permohonan surat dinamis per jenis surat
- [x] Generate PDF otomatis dengan Puppeteer
- [x] Nomor surat berurutan otomatis
- [x] Arsip digital surat yang diterbitkan
- [ ] Notifikasi WhatsApp saat surat selesai (via WA Gateway)
- [ ] QR Code verifikasi keaslian surat
- [ ] Tanda tangan digital admin
- [ ] Export arsip surat ke Excel per bulan
- [ ] Multi-RT (satu sistem untuk beberapa RT sekaligus)

---

## Lisensi

Proyek ini dibuat untuk keperluan tugas akhir. Bebas digunakan dan dikembangkan dengan menyertakan kredit.
