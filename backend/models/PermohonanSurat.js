// Model PermohonanSurat
// Berisi query utama untuk tabel permohonan_surat dengan solusi 3 (Hybrid):
// - data_form menyimpan jawaban form dalam JSON
// - file_ktp, file_kk tetap eksplisit untuk verifikasi per file

const db = require('../config/db');

// Buat permohonan baru
async function create(data) {
  const dataForm = data.data_form || {};
  
  const [result] = await db.query(
    `INSERT INTO permohonan_surat
     (warga_id, template_id, keperluan, data_form, file_ktp, file_kk, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, 'menunggu', NOW(), NOW())`,
    [
      data.warga_id,
      data.template_id,
      data.keperluan,
      JSON.stringify(dataForm),
      data.file_ktp || null,
      data.file_kk || null,
    ]
  );

  return findById(result.insertId);
}

// Cari permohonan berdasarkan id
async function findById(id) {
  const [rows] = await db.query('SELECT * FROM permohonan_surat WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
}

// Cari permohonan berdasarkan id dan warga_id (untuk akses milik warga sendiri)
async function findByIdAndWarga(id, wargaId) {
  const [rows] = await db.query('SELECT * FROM permohonan_surat WHERE id = ? AND warga_id = ? LIMIT 1', [id, wargaId]);
  return rows[0] || null;
}

// Cari semua permohonan warga
async function findByWarga(wargaId) {
  const [rows] = await db.query(
    `SELECT p.*, t.kode AS template_kode, t.nama AS template_nama
     FROM permohonan_surat p
     LEFT JOIN template_surat t ON t.id = p.template_id
     WHERE p.warga_id = ?
     ORDER BY p.created_at DESC`,
    [wargaId]
  );
  return rows;
}

// Cari semua permohonan untuk admin (dengan filter opsional)
async function findAllForAdmin({ status, q } = {}) {
  const params = [];
  let where = 'WHERE 1=1';

  if (status) {
    where += ' AND p.status = ?';
    params.push(status);
  }

  if (q) {
    where += ' AND (w.nama_lengkap LIKE ? OR w.nik LIKE ?)';
    params.push(`%${q}%`, `%${q}%`);
  }

  const [rows] = await db.query(
    `SELECT p.*, 
            t.kode AS template_kode, t.nama AS template_nama,
            w.nama_lengkap AS warga_nama, w.nik AS warga_nik, w.email AS warga_email,
            a.nama_lengkap AS admin_nama, a.jabatan AS admin_jabatan
     FROM permohonan_surat p
     LEFT JOIN template_surat t ON t.id = p.template_id
     LEFT JOIN warga w ON w.id = p.warga_id
     LEFT JOIN admin a ON a.id = p.admin_id
     ${where}
     ORDER BY p.created_at DESC`,
    params
  );

  return rows;
}

// Cari detail permohonan untuk halaman admin review
async function findDetailForAdmin(id) {
  const [rows] = await db.query(
    `SELECT p.*, 
            w.nama_lengkap AS warga_nama_lengkap,
            w.nik AS warga_nik,
            w.email AS warga_email,
            w.tempat_lahir AS warga_tempat_lahir,
            w.tanggal_lahir AS warga_tanggal_lahir,
            w.jenis_kelamin AS warga_jenis_kelamin,
            w.alamat AS warga_alamat,
            w.agama AS warga_agama,
            w.pekerjaan AS warga_pekerjaan,
            w.no_hp AS warga_no_hp,
            a.nama_lengkap AS admin_nama_lengkap,
            a.jabatan AS admin_jabatan
     FROM permohonan_surat p
     LEFT JOIN warga w ON w.id = p.warga_id
     LEFT JOIN admin a ON a.id = p.admin_id
     WHERE p.id = ? LIMIT 1`,
    [id]
  );

  return rows[0] || null;
}


// Tolak permohonan
async function reject(id, adminId, catatan) {
  await db.query(
    'UPDATE permohonan_surat SET status = ?, admin_id = ?, catatan_admin = ?, updated_at = NOW() WHERE id = ?',
    ['ditolak', adminId, catatan, id]
  );

  return findById(id);
}

// Cari arsip surat selesai
async function findArsip() {
  const [rows] = await db.query(
    `SELECT p.*, t.kode AS template_kode, t.nama AS template_nama, w.nama_lengkap AS warga_nama, w.nik AS warga_nik, a.nama_lengkap AS admin_nama, a.jabatan AS admin_jabatan
     FROM permohonan_surat p
     LEFT JOIN template_surat t ON t.id = p.template_id
     LEFT JOIN warga w ON w.id = p.warga_id
     LEFT JOIN admin a ON a.id = p.admin_id
     WHERE p.status = 'selesai'
     ORDER BY p.tanggal_approve DESC`
  );

  return rows;
}

// Hitung total permohonan
async function countAll() {
  const [rows] = await db.query('SELECT COUNT(*) AS total FROM permohonan_surat');
  return rows[0].total;
}

// Hitung permohonan berdasarkan status
async function countByStatus(status) {
  const [rows] = await db.query('SELECT COUNT(*) AS total FROM permohonan_surat WHERE status = ?', [status]);
  return rows[0].total;
}

module.exports = {
  create,
  findById,
  findByIdAndWarga,
  findByWarga,
  findAllForAdmin,
  findDetailForAdmin,
  reject,
  findArsip,
  countAll,
  countByStatus,
};
