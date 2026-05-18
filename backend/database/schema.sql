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

  -- Kolom keterangan yang memang dipakai oleh jenis surat.
  nomor_kk VARCHAR(30) NULL,
  tujuan_instansi VARCHAR(150) NULL,
  tujuan_penggunaan VARCHAR(150) NULL,
  kondisi_ekonomi TEXT NULL,
  nama_usaha VARCHAR(120) NULL,
  jenis_usaha VARCHAR(120) NULL,
  alamat_usaha TEXT NULL,
  tahun_berdiri VARCHAR(4) NULL,

  -- File persyaratan utama dari warga.
  file_ktp VARCHAR(255) NULL,
  status_ktp ENUM('pending','valid','tidak_valid') NOT NULL DEFAULT 'pending',
  catatan_ktp TEXT NULL,
  verified_ktp_by INT NULL,
  verified_ktp_at DATETIME NULL,

  file_kk VARCHAR(255) NULL,
  status_kk ENUM('pending','valid','tidak_valid') NOT NULL DEFAULT 'pending',
  catatan_kk TEXT NULL,
  verified_kk_by INT NULL,
  verified_kk_at DATETIME NULL,

  status ENUM('menunggu','diproses','selesai','ditolak') NOT NULL DEFAULT 'menunggu',
  catatan_admin TEXT NULL,
  file_pdf VARCHAR(255) NULL,
  tanggal_approve DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_permohonan_warga FOREIGN KEY (warga_id) REFERENCES warga(id) ON DELETE CASCADE,
  CONSTRAINT fk_permohonan_template FOREIGN KEY (template_id) REFERENCES template_surat(id) ON DELETE CASCADE,
  CONSTRAINT fk_permohonan_admin FOREIGN KEY (admin_id) REFERENCES admin(id) ON DELETE SET NULL,
  CONSTRAINT fk_permohonan_verified_ktp FOREIGN KEY (verified_ktp_by) REFERENCES admin(id) ON DELETE SET NULL,
  CONSTRAINT fk_permohonan_verified_kk FOREIGN KEY (verified_kk_by) REFERENCES admin(id) ON DELETE SET NULL,
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

-- Bersihkan tabel tambahan lama jika pernah dibuat.
DROP TABLE IF EXISTS permohonan_lampiran;
DROP TABLE IF EXISTS permohonan_data;
DROP TABLE IF EXISTS template_persyaratan;
DROP TABLE IF EXISTS template_field;

-- Bersihkan kolom JSON lama jika pernah ada.
ALTER TABLE template_surat
  DROP COLUMN IF EXISTS fields,
  DROP COLUMN IF EXISTS persyaratan;

ALTER TABLE permohonan_surat
  DROP COLUMN IF EXISTS data_tambahan,
  DROP COLUMN IF EXISTS lampiran_persyaratan,
  DROP COLUMN IF EXISTS file_ktp_name,
  DROP COLUMN IF EXISTS file_ktp_mime,
  DROP COLUMN IF EXISTS file_ktp_size,
  DROP COLUMN IF EXISTS file_kk_name,
  DROP COLUMN IF EXISTS file_kk_mime,
  DROP COLUMN IF EXISTS file_kk_size;

-- Tambahkan kolom baru jika database sudah terlanjur dibuat sebelumnya.
ALTER TABLE permohonan_surat
  ADD COLUMN IF NOT EXISTS nomor_kk VARCHAR(30) NULL AFTER keperluan,
  ADD COLUMN IF NOT EXISTS tujuan_instansi VARCHAR(150) NULL AFTER nomor_kk,
  ADD COLUMN IF NOT EXISTS tujuan_penggunaan VARCHAR(150) NULL AFTER tujuan_instansi,
  ADD COLUMN IF NOT EXISTS kondisi_ekonomi TEXT NULL AFTER tujuan_penggunaan,
  ADD COLUMN IF NOT EXISTS nama_usaha VARCHAR(120) NULL AFTER kondisi_ekonomi,
  ADD COLUMN IF NOT EXISTS jenis_usaha VARCHAR(120) NULL AFTER nama_usaha,
  ADD COLUMN IF NOT EXISTS alamat_usaha TEXT NULL AFTER jenis_usaha,
  ADD COLUMN IF NOT EXISTS tahun_berdiri VARCHAR(4) NULL AFTER alamat_usaha,
  ADD COLUMN IF NOT EXISTS file_ktp VARCHAR(255) NULL AFTER tahun_berdiri,
  ADD COLUMN IF NOT EXISTS status_ktp ENUM('pending','valid','tidak_valid') NOT NULL DEFAULT 'pending' AFTER file_ktp,
  ADD COLUMN IF NOT EXISTS catatan_ktp TEXT NULL AFTER status_ktp,
  ADD COLUMN IF NOT EXISTS verified_ktp_by INT NULL AFTER catatan_ktp,
  ADD COLUMN IF NOT EXISTS verified_ktp_at DATETIME NULL AFTER verified_ktp_by,
  ADD COLUMN IF NOT EXISTS file_kk VARCHAR(255) NULL AFTER verified_ktp_at,
  ADD COLUMN IF NOT EXISTS status_kk ENUM('pending','valid','tidak_valid') NOT NULL DEFAULT 'pending' AFTER file_kk,
  ADD COLUMN IF NOT EXISTS catatan_kk TEXT NULL AFTER status_kk,
  ADD COLUMN IF NOT EXISTS verified_kk_by INT NULL AFTER catatan_kk,
  ADD COLUMN IF NOT EXISTS verified_kk_at DATETIME NULL AFTER verified_kk_by;

INSERT INTO admin (nama_lengkap, email, password, jabatan, no_hp, aktif, created_at, updated_at)
VALUES ('Atmin Sistem', 'atmin@rtrw.local', '$2a$10$/MLULYSMGodJ2p/MmJM/e.Vlz4UijNDK1/JXnvWs4IPu7Odfnkqg2', 'Ketua RT', '081234567890', true, NOW(), NOW())
ON DUPLICATE KEY UPDATE nama_lengkap = VALUES(nama_lengkap), jabatan = VALUES(jabatan), no_hp = VALUES(no_hp), aktif = VALUES(aktif);

INSERT INTO template_surat (id, kode, nama, deskripsi, file_template, aktif, created_at, updated_at) VALUES
(1, 'DOMISILI', 'Surat Keterangan Domisili', 'Bukti tempat tinggal warga di wilayah desa/RT/RW.', 'domisili.html', true, NOW(), NOW()),
(2, 'TIDAK_MAMPU', 'Surat Keterangan Tidak Mampu', 'Untuk keringanan biaya pendidikan, kesehatan, atau bantuan sosial.', 'tidak_mampu.html', true, NOW(), NOW()),
(3, 'USAHA', 'Surat Keterangan Usaha', 'Bukti kepemilikan usaha warga di wilayah desa/RT/RW.', 'usaha.html', true, NOW(), NOW())
ON DUPLICATE KEY UPDATE nama = VALUES(nama), deskripsi = VALUES(deskripsi), file_template = VALUES(file_template), aktif = VALUES(aktif);
