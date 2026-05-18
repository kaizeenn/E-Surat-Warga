// Model PermohonanSurat
// Berisi query utama untuk tabel permohonan_surat.
const db = require('../config/db');

async function create(data) {
  const [result] = await db.query(
    `INSERT INTO permohonan_surat
     (warga_id, template_id, keperluan, nomor_kk, tujuan_instansi, tujuan_penggunaan, kondisi_ekonomi,
      nama_usaha, jenis_usaha, alamat_usaha, file_ktp, file_kk, status_ktp, status_kk, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'pending', 'menunggu', NOW(), NOW())`,
    [
      data.warga_id,
      data.template_id,
      data.keperluan,
      data.nomor_kk || null,
      data.tujuan_instansi || null,
      data.tujuan_penggunaan || null,
      data.kondisi_ekonomi || null,
      data.nama_usaha || null,
      data.jenis_usaha || null,
      data.alamat_usaha || null,
      data.file_ktp || null,
      data.file_kk || null,
    ]
  );
  return findById(result.insertId);
}

async function findById(id) {
  const [rows] = await db.query('SELECT * FROM permohonan_surat WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
}

async function findByIdAndWarga(id, wargaId) {
  const [rows] = await db.query('SELECT * FROM permohonan_surat WHERE id = ? AND warga_id = ? LIMIT 1', [id, wargaId]);
  return rows[0] || null;
}

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

async function findAllForAdmin({ status, q } = {}) {
  const params = [];
  let where = 'WHERE 1=1';
  if (status) { where += ' AND p.status = ?'; params.push(status); }
  if (q) { where += ' AND (w.nama_lengkap LIKE ? OR w.nik LIKE ?)'; params.push(`%${q}%`, `%${q}%`); }

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

async function findDetailForAdmin(id) {
  const [rows] = await db.query(
    `SELECT p.*, 
            w.nama_lengkap AS warga_nama_lengkap, w.nik AS warga_nik, w.email AS warga_email,
            w.tempat_lahir AS warga_tempat_lahir, w.tanggal_lahir AS warga_tanggal_lahir,
            w.jenis_kelamin AS warga_jenis_kelamin, w.alamat AS warga_alamat,
            w.agama AS warga_agama, w.pekerjaan AS warga_pekerjaan, w.no_hp AS warga_no_hp,
            a.nama_lengkap AS admin_nama_lengkap, a.jabatan AS admin_jabatan
     FROM permohonan_surat p
     LEFT JOIN warga w ON w.id = p.warga_id
     LEFT JOIN admin a ON a.id = p.admin_id
     WHERE p.id = ? LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

async function updateLampiranStatus(id, field, status, catatan, adminId) {
  await db.query(
    `UPDATE permohonan_surat
     SET status_${field} = ?, catatan_${field} = ?, verified_${field}_by = ?, verified_${field}_at = NOW(), admin_id = ?, updated_at = NOW()
     WHERE id = ?`,
    [status, catatan || '', adminId, adminId, id]
  );
  return findById(id);
}

async function reject(id, adminId, catatan) {
  await db.query('UPDATE permohonan_surat SET status = ?, admin_id = ?, catatan_admin = ?, updated_at = NOW() WHERE id = ?', ['ditolak', adminId, catatan, id]);
  return findById(id);
}

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

async function countAll() {
  const [rows] = await db.query('SELECT COUNT(*) AS total FROM permohonan_surat');
  return rows[0].total;
}

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
  updateLampiranStatus,
  reject,
  findArsip,
  countAll,
  countByStatus,
};
