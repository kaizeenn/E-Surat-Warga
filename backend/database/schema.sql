CREATE DATABASE IF NOT EXISTS surat_warga CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE surat_warga;

CREATE TABLE IF NOT EXISTS warga (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama_lengkap VARCHAR(100) NOT NULL,
  nik VARCHAR(16) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  tempat_lahir VARCHAR(50) NULL,
  tanggal_lahir DATE NULL,
  jenis_kelamin ENUM('laki-laki','perempuan') NULL,
  alamat TEXT NULL,
  agama VARCHAR(20) NULL,
  pekerjaan VARCHAR(50) NULL,
  no_hp VARCHAR(15) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS admin (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama_lengkap VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  jabatan VARCHAR(50) NOT NULL DEFAULT 'Ketua RT',
  no_hp VARCHAR(15) NULL,
  ttd_image VARCHAR(255) NULL,
  aktif BOOLEAN NOT NULL DEFAULT true,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS template_surat (
  id INT AUTO_INCREMENT PRIMARY KEY,
  kode VARCHAR(30) NOT NULL UNIQUE,
  nama VARCHAR(100) NOT NULL,
  deskripsi TEXT NULL,
  file_template VARCHAR(100) NOT NULL,
  fields JSON NOT NULL DEFAULT '[]',
  kalimat_penutup TEXT NULL,
  aktif BOOLEAN NOT NULL DEFAULT true,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS permohonan_surat (
  id INT AUTO_INCREMENT PRIMARY KEY,
  warga_id INT NOT NULL,
  template_id INT NOT NULL,
  admin_id INT NULL,
  nomor_surat VARCHAR(50) NULL,
  keperluan TEXT NOT NULL,

  -- Solusi 3 (Hybrid): jawaban form isian dalam JSON
  -- Key-value pair sesuai field.key dari template
  -- Contoh: { "tujuan_instansi": "PT. Maju", "nomor_kk": "3578..." }
  data_form JSON NOT NULL DEFAULT '{}',

  -- File persyaratan utama - tetap eksplisit karena butuh verifikasi per file
  file_ktp VARCHAR(255) NULL,
  file_kk VARCHAR(255) NULL,

  status ENUM('menunggu','diproses','selesai','ditolak') NOT NULL DEFAULT 'menunggu',
  catatan_admin TEXT NULL,
  file_pdf VARCHAR(255) NULL,
  tanggal_approve DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_permohonan_warga FOREIGN KEY (warga_id) REFERENCES warga(id) ON DELETE CASCADE,
  CONSTRAINT fk_permohonan_template FOREIGN KEY (template_id) REFERENCES template_surat(id) ON DELETE CASCADE,
  CONSTRAINT fk_permohonan_admin FOREIGN KEY (admin_id) REFERENCES admin(id) ON DELETE SET NULL,
  KEY idx_permohonan_warga (warga_id),
  KEY idx_permohonan_template (template_id),
  KEY idx_permohonan_admin (admin_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS nomor_surat (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tahun INT NOT NULL,
  bulan TINYINT NOT NULL,
  urutan INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_nomor_surat_periode (tahun, bulan)
) ENGINE=InnoDB;

-- Bersihkan tabel tambahan lama jika pernah dibuat
DROP TABLE IF EXISTS permohonan_lampiran;
DROP TABLE IF EXISTS permohonan_data;
DROP TABLE IF EXISTS template_persyaratan;
DROP TABLE IF EXISTS template_field;

-- Bersihkan kolom lama jika ada
ALTER TABLE template_surat
  DROP COLUMN IF EXISTS persyaratan;

ALTER TABLE template_surat
  ADD COLUMN IF NOT EXISTS kalimat_penutup TEXT NULL;

ALTER TABLE permohonan_surat
  DROP COLUMN IF EXISTS nomor_kk,
  DROP COLUMN IF EXISTS tujuan_instansi,
  DROP COLUMN IF EXISTS tujuan_penggunaan,
  DROP COLUMN IF EXISTS kondisi_ekonomi,
  DROP COLUMN IF EXISTS nama_usaha,
  DROP COLUMN IF EXISTS jenis_usaha,
  DROP COLUMN IF EXISTS alamat_usaha,
  DROP COLUMN IF EXISTS tahun_berdiri,
  DROP COLUMN IF EXISTS data_tambahan,
  DROP COLUMN IF EXISTS lampiran_persyaratan,
  DROP COLUMN IF EXISTS file_ktp_name,
  DROP COLUMN IF EXISTS file_ktp_mime,
  DROP COLUMN IF EXISTS file_ktp_size,
  DROP COLUMN IF EXISTS file_kk_name,
  DROP COLUMN IF EXISTS file_kk_mime,
  DROP COLUMN IF EXISTS file_kk_size,
  DROP COLUMN IF EXISTS status_ktp,
  DROP COLUMN IF EXISTS status_kk,
  DROP COLUMN IF EXISTS catatan_ktp,
  DROP COLUMN IF EXISTS verified_ktp_by,
  DROP COLUMN IF EXISTS verified_ktp_at,
  DROP COLUMN IF EXISTS catatan_kk,
  DROP COLUMN IF EXISTS verified_kk_by,
  DROP COLUMN IF EXISTS verified_kk_at;

-- Tambahkan kolom baru jika belum ada (untuk update database existing)
ALTER TABLE template_surat
  ADD COLUMN IF NOT EXISTS fields JSON NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS kalimat_penutup TEXT NULL;

ALTER TABLE permohonan_surat
  ADD COLUMN IF NOT EXISTS data_form JSON NOT NULL DEFAULT '{}' AFTER keperluan;

-- Insert admin default
INSERT INTO admin (nama_lengkap, email, password, jabatan, no_hp, aktif, created_at, updated_at)
VALUES ('Atmin Sistem', 'atmin@rtrw.local', '$2a$10$/MLULYSMGodJ2p/MmJM/e.Vlz4UijNDK1/JXnvWs4IPu7Odfnkqg2', 'Ketua RT', '081234567890', true, NOW(), NOW())
ON DUPLICATE KEY UPDATE nama_lengkap = VALUES(nama_lengkap), jabatan = VALUES(jabatan), no_hp = VALUES(no_hp), aktif = VALUES(aktif);

-- Insert template surat dengan field definitions
INSERT INTO template_surat (id, kode, nama, deskripsi, file_template, fields, kalimat_penutup, aktif, created_at, updated_at) VALUES
(1, 'DOMISILI', 'Surat Keterangan Domisili', 'Bukti tempat tinggal warga di wilayah desa/RT/RW.', 'universal.html', 
  JSON_ARRAY(
    JSON_OBJECT('name', 'nomor_kk', 'label', 'Nomor Kartu Keluarga', 'type', 'text', 'required', true, 'placeholder', 'contoh: 3275XXXXXXXXXXXX', 'maxLength', 16),
    JSON_OBJECT('name', 'tujuan_instansi', 'label', 'Tujuan Instansi/Pihak', 'type', 'text', 'required', true, 'placeholder', 'contoh: PT. Maju Bersama')
  ),
  'Adalah benar warga RT {{RT_NOMOR}} RW {{RW_NOMOR}} Desa {{KELURAHAN}}, Kecamatan {{KECAMATAN}}, Kabupaten {{KOTA}}, yang berdomisili di alamat tersebut di atas. Surat ini dibuat untuk keperluan <b>{{KEPERLUAN}}</b>.',
  true, NOW(), NOW()),
(2, 'TIDAK_MAMPU', 'Surat Keterangan Tidak Mampu', 'Untuk keringanan biaya pendidikan, kesehatan, atau bantuan sosial.', 'universal.html',
  JSON_ARRAY(
    JSON_OBJECT('name', 'nomor_kk', 'label', 'Nomor Kartu Keluarga', 'type', 'text', 'required', true, 'maxLength', 16),
    JSON_OBJECT('name', 'tujuan_penggunaan', 'label', 'Tujuan Penggunaan Surat', 'type', 'text', 'required', true, 'placeholder', 'contoh: Beasiswa pendidikan'),
    JSON_OBJECT('name', 'kondisi_ekonomi', 'label', 'Ringkasan Kondisi Ekonomi', 'type', 'textarea', 'required', true, 'placeholder', 'Jelaskan kondisi ekonomi singkat')
  ),
  'Adalah benar warga RT {{RT_NOMOR}} RW {{RW_NOMOR}} Desa {{KELURAHAN}}, Kecamatan {{KECAMATAN}}, Kabupaten {{KOTA}}, dan berdasarkan pengamatan kami yang bersangkutan tergolong keluarga <b>kurang mampu</b> secara ekonomi. Surat ini dibuat untuk keperluan <b>{{KEPERLUAN}}</b>.',
  true, NOW(), NOW()),
(3, 'USAHA', 'Surat Keterangan Usaha', 'Bukti kepemilikan usaha warga di wilayah desa/RT/RW.', 'universal.html',
  JSON_ARRAY(
    JSON_OBJECT('name', 'nomor_kk', 'label', 'Nomor Kartu Keluarga', 'type', 'text', 'required', true, 'maxLength', 16),
    JSON_OBJECT('name', 'nama_usaha', 'label', 'Nama Usaha', 'type', 'text', 'required', true, 'placeholder', 'contoh: Toko Elektronik Jaya'),
    JSON_OBJECT('name', 'jenis_usaha', 'label', 'Jenis Usaha', 'type', 'text', 'required', true, 'placeholder', 'contoh: Ritel Elektronik'),
    JSON_OBJECT('name', 'alamat_usaha', 'label', 'Alamat Usaha', 'type', 'textarea', 'required', true, 'placeholder', 'Alamat lengkap usaha'),
    JSON_OBJECT('name', 'tahun_berdiri', 'label', 'Tahun Berdiri', 'type', 'number', 'required', true, 'placeholder', 'contoh: 2020')
  ),
  'Adalah benar yang bersangkutan memiliki dan menjalankan usaha sebagaimana data di atas di wilayah RT {{RT_NOMOR}} RW {{RW_NOMOR}} Desa {{KELURAHAN}}, Kecamatan {{KECAMATAN}}, Kabupaten {{KOTA}}. Surat ini dibuat untuk keperluan <b>{{KEPERLUAN}}</b>.',
  true, NOW(), NOW())
ON DUPLICATE KEY UPDATE nama = VALUES(nama), deskripsi = VALUES(deskripsi), file_template = VALUES(file_template), fields = VALUES(fields), kalimat_penutup = VALUES(kalimat_penutup), aktif = VALUES(aktif);
