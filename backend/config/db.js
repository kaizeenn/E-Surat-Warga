// Menggunakan mysql2/promise supaya query database bisa ditulis dengan async/await.
const mysql = require('mysql2/promise');

// Pool = kumpulan koneksi database.
// Tujuannya agar setiap request API tidak perlu membuat koneksi baru dari awal.
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Fungsi ini dipanggil saat server pertama kali dijalankan.
// Kalau database tidak bisa terkoneksi, server tidak akan dilanjutkan.
async function testConnection() {
  try {
    await pool.query('SELECT 1 + 1 AS result');
    console.log('✅ Database connected:', process.env.DB_NAME);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

// Export pool agar file route bisa langsung memakai db.query(...).
module.exports = pool;

// Export tambahan untuk pengecekan koneksi di server.js.
module.exports.testConnection = testConnection;
