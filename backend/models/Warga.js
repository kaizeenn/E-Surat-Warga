// Model Warga
// Berisi fungsi query ke tabel warga. Tidak memakai Sequelize/ORM.
const db = require('../config/db');

async function findById(id) {
  const [rows] = await db.query(
    `SELECT id, nama_lengkap, nik, email, tempat_lahir, tanggal_lahir, jenis_kelamin,
            alamat, agama, pekerjaan, no_hp, created_at AS createdAt, updated_at AS updatedAt
     FROM warga WHERE id = ? LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

async function findByEmail(email) {
  const [rows] = await db.query('SELECT * FROM warga WHERE email = ? LIMIT 1', [email]);
  return rows[0] || null;
}

async function findByNik(nik) {
  const [rows] = await db.query('SELECT * FROM warga WHERE nik = ? LIMIT 1', [nik]);
  return rows[0] || null;
}

async function create(data) {
  const [result] = await db.query(
    `INSERT INTO warga
     (nama_lengkap, nik, email, password, tempat_lahir, tanggal_lahir, jenis_kelamin, alamat, agama, pekerjaan, no_hp, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
    [
      data.nama_lengkap,
      data.nik,
      data.email,
      data.password,
      data.tempat_lahir || null,
      data.tanggal_lahir || null,
      data.jenis_kelamin || null,
      data.alamat || null,
      data.agama || null,
      data.pekerjaan || null,
      data.no_hp || null,
    ]
  );
  return { id: result.insertId, ...data };
}

async function updateProfil(id, update) {
  const keys = Object.keys(update);
  if (!keys.length) return findById(id);
  await db.query(
    `UPDATE warga SET ${keys.map(k => `${k} = ?`).join(', ')}, updated_at = NOW() WHERE id = ?`,
    [...keys.map(k => update[k]), id]
  );
  return findById(id);
}

module.exports = { findById, findByEmail, findByNik, create, updateProfil };
