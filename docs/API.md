# API Documentation

Base URL: `http://localhost:3002/api`

Semua endpoint yang membutuhkan autentikasi pakai header:
```
Authorization: Bearer <token>
```

---

## Health

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| GET | `/health` | - | Cek API hidup |

---

## Autentikasi

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| POST | `/auth/login` | - | **Login terpadu** — sistem auto-detect role (warga/admin) |
| POST | `/auth/warga/register` | - | Daftar akun warga |
| POST | `/auth/warga/login` | - | Login warga (legacy) |
| POST | `/auth/admin/login` | - | Login admin (legacy) |
| GET  | `/auth/me` | JWT | Profil user yang login |
| GET  | `/auth/session` | JWT | Info sesi (iat, exp, sisa waktu) |
| PUT  | `/auth/profil` | JWT | Update profil sendiri |

### POST `/auth/login` (terpadu)
```json
{ "email": "...", "password": "..." }
```

Backend cek tabel `admin` dulu → jika tidak ada, cek tabel `warga`.
Response `data.user.type` akan berisi `"admin"` atau `"warga"`,
frontend tinggal arahkan ke dashboard yang sesuai.

Response error: pesan generik `"Email atau password salah"`
(tidak membocorkan apakah email exists).

### GET `/auth/session`
Dipakai frontend untuk **kelola sesi login**: dipanggil setelah refresh
halaman, saat tab idle lama, atau saat user membuka popover sesi.

Response:
```json
{
  "success": true,
  "data": {
    "type": "admin",
    "user_id": 1,
    "iat": 1778169216,
    "exp": 1778774016,
    "now": 1778169216,
    "remaining_sec": 604800,
    "remaining_ms": 604800000
  }
}
```

Kalau token sudah expired atau dicabut, server membalas `401` dan
frontend otomatis menghapus session lalu redirect ke `/login?expired=1`.

### POST `/auth/warga/register`
```json
{
  "nama_lengkap": "Andi Wijaya",
  "nik": "3201010101010001",
  "email": "andi@example.com",
  "password": "rahasia123",
  "tempat_lahir": "Bogor",
  "tanggal_lahir": "1995-08-17",
  "jenis_kelamin": "laki-laki",
  "alamat": "Jl. Mawar No. 12",
  "agama": "Islam",
  "pekerjaan": "Karyawan Swasta",
  "no_hp": "081234567899"
}
```

### POST `/auth/warga/login` & `/auth/admin/login`
```json
{ "email": "...", "password": "..." }
```

Response sukses:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOi...",
    "user": { "id": 1, "type": "warga", "nama_lengkap": "...", "email": "..." }
  }
}
```

---

## Surat (Warga)

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| GET   | `/surat/template` | JWT | Daftar jenis surat aktif |
| GET   | `/surat/template/:kode` | JWT | Detail template + fields |
| POST  | `/surat/ajukan` | Warga | Ajukan permohonan |
| GET   | `/surat/saya` | Warga | List permohonan milik sendiri |
| GET   | `/surat/saya/:id` | Warga | Detail permohonan sendiri |

### POST `/surat/ajukan`
```json
{
  "templateKode": "DOMISILI",
  "keperluan": "Melamar pekerjaan",
  "dataTambahan": { "tujuanInstansi": "PT. Maju Bersama" }
}
```

---

## Admin — Permohonan

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| GET   | `/admin/permohonan?status=&q=` | Admin | List permohonan (filter status & search nama/NIK) |
| GET   | `/admin/permohonan/:id` | Admin | Detail permohonan + data warga |
| PATCH | `/admin/permohonan/:id/approve` | Admin | Approve + auto-generate nomor & PDF |
| PATCH | `/admin/permohonan/:id/tolak` | Admin | Tolak (body: `{ catatan }`) |
| GET   | `/admin/arsip` | Admin | Semua surat selesai |
| GET   | `/admin/stats` | Admin | Statistik dashboard |

## Admin — TTD Digital

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| POST | `/admin/profil/ttd` | Admin | Upload TTD digital (`multipart/form-data`, field: `ttd`) |
| DELETE | `/admin/profil/ttd` | Admin | Hapus TTD digital |

### POST `/admin/profil/ttd`

Field form-data:

| Field | Tipe | Wajib | Catatan |
|---|---|---|---|
| `ttd` | file | Ya | PNG/JPG/JPEG/WEBP, maksimal 2MB |

Response sukses mengembalikan data admin terbaru dengan `ttd_image`, contoh:

```json
{
  "success": true,
  "message": "TTD digital berhasil diupload",
  "data": {
    "id": 1,
    "nama_lengkap": "Atmin Sistem",
    "ttd_image": "/uploads/ttd/ttd-admin-1-xxx.png"
  }
}
```

TTD otomatis disisipkan ke PDF surat baru saat admin melakukan approve.
PDF lama tidak berubah otomatis.

## Admin — Kelola Template

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| GET    | `/admin/template` | Admin | List semua template (aktif/nonaktif) |
| GET    | `/admin/template/files` | Admin | List file HTML di `src/templates/` |
| GET    | `/admin/template/:id` | Admin | Detail template |
| POST   | `/admin/template` | Admin | Buat template baru |
| PUT    | `/admin/template/:id` | Admin | Update template |
| PATCH  | `/admin/template/:id/toggle` | Admin | Toggle aktif/nonaktif |
| DELETE | `/admin/template/:id` | Admin | Hapus (ditolak jika sudah dipakai permohonan) |

### POST `/admin/template`
```json
{
  "kode": "PINDAH",
  "nama": "Surat Keterangan Pindah",
  "deskripsi": "Untuk warga yang akan pindah domisili",
  "file_template": "pindah.html",
  "aktif": true,
  "fields": [
    { "name": "alamatTujuan", "label": "Alamat Tujuan", "type": "textarea", "required": true },
    { "name": "alasanPindah", "label": "Alasan Pindah", "type": "text", "required": true }
  ]
}
```

> **Catatan:** `file_template` harus sudah ada di `backend/src/templates/`.
> Field `name` di-uppercase saat replace placeholder di HTML
> (contoh: `alamatTujuan` → `{{ALAMATTUJUAN}}`).

### PATCH `/admin/permohonan/:id/approve`
Tidak butuh body. Response:
```json
{
  "success": true,
  "data": {
    "nomorSurat": "001/DOM-RT003/V/2025",
    "filePdf": "/uploads/surat/surat-1-...pdf",
    "tanggalTerbit": "2025-05-06T10:15:00.000Z",
    "diapproveOleh": { "id": 1, "nama": "...", "jabatan": "Ketua RT" }
  }
}
```

### PATCH `/admin/permohonan/:id/tolak`
```json
{ "catatan": "Data NIK tidak sesuai dengan KK" }
```

---

## File PDF

PDF surat di-serve sebagai static file:
```
GET http://localhost:3002/uploads/surat/surat-{id}-{timestamp}.pdf
```

---

## Format Error

Semua error mengikuti format:
```json
{ "success": false, "message": "Pesan error", "errors": [...optional] }
```

| HTTP | Arti |
|---|---|
| 400 | Validasi gagal |
| 401 | Token invalid/expired |
| 403 | Role tidak sesuai |
| 404 | Resource tidak ditemukan |
| 409 | Konflik (mis. email sudah ada) |
| 500 | Server error |
