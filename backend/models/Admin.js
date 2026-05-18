// Model Admin
// Berisi fungsi query ke tabel admin. Tidak memakai Sequelize/ORM.
const db = require('../config/db');

async function findById(id) {
  const [rows] = await db.query(
    `SELECT id, nama_lengkap, email, jabatan, no_hp, ttd_image, aktif,
            created_at AS createdAt, updated_at AS updatedAt
     FROM admin WHERE id = ? LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

async function findByEmail(email) {
  const [rows] = await db.query('SELECT * FROM admin WHERE email = ? LIMIT 1', [email]);
  return rows[0] || null;
}

async function updateProfil(id, update) {
  const keys = Object.keys(update);
  if (!keys.length) return findById(id);
  await db.query(
    `UPDATE admin SET ${keys.map(k => `${k} = ?`).join(', ')}, updated_at = NOW() WHERE id = ?`,
    [...keys.map(k => update[k]), id]
  );
  return findById(id);
}

async function updateTtd(id, ttdImage) {
  await db.query('UPDATE admin SET ttd_image = ?, updated_at = NOW() WHERE id = ?', [ttdImage, id]);
  return findById(id);
}

module.exports = { findById, findByEmail, updateProfil, updateTtd };
