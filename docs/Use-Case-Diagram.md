# Use Case Diagram — e-Surat Desa

![Use Case Diagram](./Use-Case-Diagram.png)

## Aktor

- **Warga** — pemohon surat (warga desa yang membutuhkan surat keterangan).
- **Admin** — pengurus desa/RT/RW yang memproses permohonan.

## Use Case

### Warga
- Login
- Ajukan Permohonan Surat
- Lacak Status Permohonan
- Unduh PDF Surat
- Kelola Profil

### Admin
- Login
- Kelola Permohonan Warga
- Approve / Tolak Permohonan
- Kelola Template Surat
- Upload TTD Digital
- Kelola Profil

### Sistem (otomatis, dipanggil lewat `«include»`)
- Generate Nomor Surat
- Generate PDF Surat

## Relasi

| Use Case Pemicu | Tipe | Use Case Tujuan |
|---|---|---|
| Approve / Tolak Permohonan | `«include»` | Generate Nomor Surat |
| Approve / Tolak Permohonan | `«include»` | Generate PDF Surat |

> Saat admin meng-approve permohonan, sistem otomatis membangkitkan nomor surat
> berurutan dan men-generate PDF resmi (lengkap dengan TTD digital admin bila sudah
> diupload).

## Catatan Skema

- **Login** dipisah per aktor di diagram, namun secara teknis menggunakan endpoint
  terpadu `POST /api/auth/login` yang otomatis mendeteksi role berdasarkan email
  yang terdaftar (cek tabel `admin` lalu `warga`).
- **Kelola Profil** tersedia untuk kedua aktor (ubah data diri & ganti password);
  khusus admin terdapat fitur tambahan **Upload TTD Digital**.
- **Lacak Status Permohonan** mencakup melihat daftar dan detail permohonan milik
  warga itu sendiri.
- **Kelola Permohonan Warga** dari sisi admin mencakup melihat daftar permohonan
  masuk, melihat detail, sampai melihat arsip surat yang sudah terbit.
