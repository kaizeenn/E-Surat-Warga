// Model NomorSurat
// Dipakai untuk mengambil nomor urut surat per bulan/tahun.

async function getNextUrutan(conn, tahun, bulan) {
  const [rows] = await conn.query('SELECT * FROM nomor_surat WHERE tahun = ? AND bulan = ? FOR UPDATE', [tahun, bulan]);
  if (!rows[0]) {
    await conn.query('INSERT INTO nomor_surat (tahun, bulan, urutan, created_at, updated_at) VALUES (?, ?, 1, NOW(), NOW())', [tahun, bulan]);
    return 1;
  }
  const next = Number(rows[0].urutan) + 1;
  await conn.query('UPDATE nomor_surat SET urutan = ?, updated_at = NOW() WHERE id = ?', [next, rows[0].id]);
  return next;
}

module.exports = { getNextUrutan };
