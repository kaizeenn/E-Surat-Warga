// Model TemplateSurat
// Berisi query untuk tabel template_surat.
const db = require('../config/db');

async function findAll({ activeOnly = false } = {}) {
  const sql = activeOnly
    ? 'SELECT * FROM template_surat WHERE aktif = true ORDER BY nama ASC'
    : 'SELECT * FROM template_surat ORDER BY id ASC';
  const [rows] = await db.query(sql);
  return rows;
}

async function findById(id) {
  const [rows] = await db.query('SELECT * FROM template_surat WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
}

async function findByKode(kode, { activeOnly = false } = {}) {
  const sql = activeOnly
    ? 'SELECT * FROM template_surat WHERE kode = ? AND aktif = true LIMIT 1'
    : 'SELECT * FROM template_surat WHERE kode = ? LIMIT 1';
  const [rows] = await db.query(sql, [kode]);
  return rows[0] || null;
}

async function create(data) {
  const fields = data.fields ? JSON.stringify(data.fields) : '[]';
  const kalimatPenutup = data.kalimat_penutup || null;
  const [result] = await db.query(
    'INSERT INTO template_surat (kode, nama, deskripsi, file_template, fields, kalimat_penutup, aktif, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
    [data.kode.toUpperCase(), data.nama, data.deskripsi || null, data.file_template, fields, kalimatPenutup, data.aktif !== undefined ? data.aktif : true]
  );
  return findById(result.insertId);
}

async function update(id, data) {
  const keys = Object.keys(data);
  if (!keys.length) return findById(id);
  await db.query(
    `UPDATE template_surat SET ${keys.map(k => `${k} = ?`).join(', ')}, updated_at = NOW() WHERE id = ?`,
    [...keys.map(k => data[k]), id]
  );
  return findById(id);
}

async function remove(id) {
  await db.query('DELETE FROM template_surat WHERE id = ?', [id]);
}

module.exports = { findAll, findById, findByKode, create, update, remove };
