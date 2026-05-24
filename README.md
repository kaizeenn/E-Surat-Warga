# e-Surat Desa

**e-Surat Desa** adalah aplikasi web untuk membantu proses pengajuan surat keterangan warga secara online. Melalui aplikasi ini, warga dapat membuat akun, login, mengajukan surat, mengunggah lampiran KTP dan KK, melihat status permohonan, serta mengunduh surat PDF jika sudah disetujui admin.

Admin desa/RT/RW dapat melihat permohonan warga, memeriksa lampiran, memberi catatan, menyetujui atau menolak permohonan, dan menerbitkan surat secara otomatis dalam bentuk PDF.

---

## Fitur Utama

### Fitur Warga

- Registrasi akun warga.
- Login warga.
- Mengajukan permohonan surat.
- Memilih jenis surat yang tersedia.
- Mengisi keterangan sesuai jenis surat.
- Upload lampiran KTP dan KK.
- Melihat daftar riwayat permohonan.
- Melihat detail status permohonan.
- Melihat status verifikasi lampiran.
- Mengunduh PDF surat jika sudah disetujui admin.

### Fitur Admin

- Login admin.
- Melihat dashboard ringkasan data.
- Melihat daftar permohonan warga.
- Membuka detail permohonan.
- Melihat dan preview lampiran KTP/KK.
- Memverifikasi lampiran dengan status:
  - `pending`
  - `valid`
  - `tidak_valid`
- Menyetujui permohonan.
- Menolak permohonan dengan catatan.
- Generate nomor surat otomatis.
- Generate PDF surat otomatis.
- Melihat arsip surat selesai.
- Mengelola template/jenis surat.
- Upload tanda tangan digital admin.

---

## Jenis Surat Default

Aplikasi menyediakan beberapa jenis surat default:

1. **Surat Keterangan Domisili**
   - Nomor KK
   - Tujuan Instansi/Pihak

2. **Surat Keterangan Tidak Mampu**
   - Nomor KK
   - Tujuan Penggunaan Surat
   - Ringkasan Kondisi Ekonomi

3. **Surat Keterangan Usaha**
   - Nomor KK
   - Nama Usaha
   - Jenis Usaha
   - Alamat Usaha
   - Tahun Berdiri

Data NIK warga tidak diisi ulang saat pengajuan karena NIK sudah tersimpan pada akun warga.

---

## Teknologi yang Digunakan

### Backend

- Node.js
- Express.js
- MySQL
- MySQL2
- JWT untuk autentikasi
- Bcrypt untuk enkripsi password
- Multer untuk upload file
- Puppeteer untuk generate PDF

### Frontend

- React
- Vite
- Tailwind CSS
- Axios
- React Router

---

## Struktur Project

```txt
surat-warga/
├── backend/
│   ├── app.js
│   ├── server.js
│   ├── config/
│   │   └── db.js
│   ├── database/
│   │   └── schema.sql
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── Admin.js
│   │   ├── Warga.js
│   │   ├── TemplateSurat.js
│   │   ├── PermohonanSurat.js
│   │   ├── NomorSurat.js
│   │   └── index.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── surat.js
│   │   └── admin.js
│   ├── services/
│   │   └── pdfGenerator.js
│   ├── templates/
│   │   ├── domisili.html
│   │   ├── tidak_mampu.html
│   │   └── usaha.html
│   ├── uploads/
│   │   ├── persyaratan/
│   │   ├── surat/
│   │   └── ttd/
│   └── utils/
│       ├── jwt.js
│       └── nomorSurat.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   └── warga/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── docs/
├── e-surat.md
└── README.md
```

---

## Struktur Database

Database memakai desain **Hybrid**:
- Field dinamis disimpan dalam JSON agar form bisa fleksibel.
- Lampiran KTP/KK tetap kolom eksplisit supaya bisa diverifikasi per file.

Tabel utama:

```txt
admin
warga
template_surat
permohonan_surat
nomor_surat
```

### Tabel Penting

#### `warga`

Menyimpan data akun warga, seperti:

- nama lengkap
- NIK
- email
- password
- tempat lahir
- tanggal lahir
- alamat
- pekerjaan
- nomor HP

#### `admin`

Menyimpan data akun admin, seperti:

- nama lengkap
- email
- password
- jabatan
- tanda tangan digital
- status aktif

#### `template_surat`

Menyimpan jenis surat yang tersedia, misalnya:

- DOMISILI
- TIDAK_MAMPU
- USAHA

Kolom penting:
- `fields` (JSON) untuk definisi form dinamis (name, label, type, required).

#### `permohonan_surat`

Menyimpan data pengajuan surat warga, seperti:

- warga yang mengajukan
- jenis surat
- keperluan
- `data_form` (JSON) berisi isian form dinamis sesuai template
- file KTP
- file KK
- status verifikasi KTP
- status verifikasi KK
- status permohonan
- catatan admin
- nomor surat
- file PDF

#### `nomor_surat`

Menyimpan nomor urut surat berdasarkan bulan dan tahun agar nomor surat otomatis tidak bentrok.

---

## Alur Penggunaan Aplikasi

### 1. Warga Registrasi

Warga membuka aplikasi, lalu memilih menu daftar akun. Warga mengisi data seperti nama, NIK, email, password, dan data profil lainnya.

Setelah berhasil registrasi, warga dapat login menggunakan email dan password tersebut.

### 2. Warga Login

Warga login melalui halaman login utama. Sistem akan memeriksa email dan password. Jika cocok, warga masuk ke dashboard warga.

### 3. Warga Mengajukan Surat

Warga membuka menu **Ajukan Surat**, lalu:

1. memilih jenis surat,
2. mengisi keperluan,
3. mengisi keterangan sesuai jenis surat,
4. mengunggah KTP,
5. mengunggah KK,
6. mengirim permohonan.

Setelah berhasil dikirim, status permohonan awal adalah:

```txt
menunggu
```

### 4. Warga Melihat Riwayat Permohonan

Warga dapat membuka menu riwayat permohonan untuk melihat daftar surat yang pernah diajukan.

Status permohonan yang dapat muncul:

```txt
menunggu
diproses
selesai
ditolak
```

Warga hanya dapat melihat permohonan miliknya sendiri karena data difilter berdasarkan akun yang sedang login.

### 5. Admin Login

Admin login menggunakan akun admin default atau akun admin lain yang sudah dibuat.

Akun admin default:

```txt
Email    : atmin@rtrw.local
Password : atmin123
```

Setelah login, admin masuk ke dashboard admin.

### 6. Admin Review Permohonan

Admin membuka daftar permohonan, lalu memilih salah satu permohonan warga.

Pada halaman detail, admin dapat melihat:

- data warga,
- jenis surat,
- keperluan,
- keterangan surat,
- lampiran KTP,
- lampiran KK,
- status permohonan.

Admin juga dapat membuka preview gambar lampiran KTP/KK.

### 7. Admin Verifikasi Lampiran

Sebelum permohonan disetujui, admin harus memverifikasi lampiran KTP dan KK.

Status verifikasi lampiran:

```txt
pending
valid
tidak_valid
```

Permohonan tidak bisa disetujui jika KTP atau KK belum berstatus `valid`.

### 8. Admin Approve atau Tolak Permohonan

Jika data dan lampiran sudah benar, admin dapat klik tombol approve. Sistem akan:

1. membuat nomor surat otomatis,
2. mengubah status menjadi `selesai`,
3. membuat file PDF surat,
4. menyimpan path PDF ke database.

Jika permohonan tidak sesuai, admin dapat menolak permohonan dan memberikan catatan alasan penolakan.

### 9. Warga Download Surat

Jika permohonan sudah selesai, warga dapat membuka detail permohonan dan mengunduh file PDF surat.

Endpoint download surat:

```txt
GET /api/surat/saya/:id/download
```

Endpoint ini mengecek:

- permohonan harus milik warga yang sedang login,
- status harus `selesai`,
- file PDF harus tersedia,
- file PDF harus ada di server.

Jika semua sesuai, file dikirim ke pengguna.

---

## Cara Menjalankan Aplikasi

### 1. Persiapan

Pastikan sudah terinstall:

- Node.js
- npm
- MySQL atau MariaDB

---

### 2. Setup Database

Masuk ke folder backend:

```bash
cd backend
```

Import database:

```bash
mysql -u root -p < database/schema.sql
```

Jika MySQL root tidak memakai password, bisa gunakan:

```bash
mysql -u root < database/schema.sql
```

---

### 3. Setup Backend

Masuk ke folder backend:

```bash
cd backend
```

Install dependency:

```bash
npm install
```

Salin file environment:

```bash
cp .env.example .env
```

Sesuaikan isi `.env`, contoh:

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=surat_warga
JWT_SECRET=secret_key_kamu
FRONTEND_URL=http://localhost:3001
```

Jalankan backend:

```bash
npm run dev
```

Backend berjalan di:

```txt
http://localhost:3000
```

---

### 4. Setup Frontend

Buka terminal baru, masuk ke folder frontend:

```bash
cd frontend
```

Install dependency:

```bash
npm install
```

Salin file environment:

```bash
cp .env.example .env
```

Pastikan isi `.env` frontend:

```env
VITE_API_URL=http://localhost:3000/api
```

Jalankan frontend:

```bash
npm run dev
```

Frontend berjalan di:

```txt
http://localhost:3001
```

---

## Cara Login

### Login Admin

Gunakan akun default:

```txt
Email    : atmin@rtrw.local
Password : atmin123
```

### Login Warga

Warga harus daftar terlebih dahulu melalui halaman register, lalu login menggunakan email dan password yang dibuat.

---

## Endpoint Penting

### Auth

```txt
POST /api/auth/warga/register
POST /api/auth/login
GET  /api/auth/me
PUT  /api/auth/profil
```

### Warga / Surat

```txt
GET  /api/surat/template
GET  /api/surat/template/:kode
POST /api/surat/ajukan
GET  /api/surat/saya
GET  /api/surat/saya/:id
GET  /api/surat/saya/:id/download
```

### Admin

```txt
GET    /api/admin/stats
GET    /api/admin/permohonan
GET    /api/admin/permohonan/:id
PATCH  /api/admin/permohonan/:id/lampiran/:index/verifikasi
PATCH  /api/admin/permohonan/:id/approve
PATCH  /api/admin/permohonan/:id/tolak
GET    /api/admin/arsip
GET    /api/admin/template
POST   /api/admin/template
PUT    /api/admin/template/:id
PATCH  /api/admin/template/:id/toggle
DELETE /api/admin/template/:id
```

---

## Folder Upload

File upload disimpan di folder berikut:

```txt
backend/uploads/persyaratan   # file KTP dan KK
backend/uploads/ttd           # tanda tangan admin
backend/uploads/surat         # file PDF surat
```

---

## Catatan Penting

- Backend berjalan di port `3000`.
- Frontend berjalan di port `3001`.
- Database menggunakan file `backend/database/schema.sql`.
- Project menggunakan `models`, tetapi tidak memakai Sequelize.
- Query database menggunakan MySQL2.
- Password disimpan dalam bentuk hash menggunakan bcrypt.
- Autentikasi menggunakan JWT.
- File KTP dan KK hanya disimpan sebagai path file di database.
- Validasi ukuran file dilakukan di program, bukan disimpan di database.

---

## Alur Uji Coba Aplikasi

Untuk mencoba aplikasi dari awal sampai akhir:

1. Jalankan backend dan frontend.
2. Login admin menggunakan akun default.
3. Register akun warga baru.
4. Login sebagai warga.
5. Ajukan surat dan upload KTP/KK.
6. Login kembali sebagai admin.
7. Buka detail permohonan.
8. Preview lampiran KTP/KK.
9. Verifikasi KTP dan KK.
10. Approve permohonan.
11. Login kembali sebagai warga.
12. Buka detail permohonan.
13. Download PDF surat.

---

## Lisensi

MIT
