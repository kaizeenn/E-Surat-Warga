/**
 * Entry point server.
 * Load env, test DB, lalu listen.
 */
// Membaca isi file .env agar process.env bisa digunakan.
require('dotenv').config();

// Import konfigurasi Express dari app.js.
const app = require('./app');
const { testConnection } = require('./config/db');

// PORT default backend adalah 3000.
const PORT = process.env.PORT || 3000;

// Dibungkus async function karena sebelum listen kita cek database dulu.
(async () => {
  // Test koneksi DB sebelum listen
  const dbOk = await testConnection();
  if (!dbOk) {
    console.error('❌ Server tidak bisa start tanpa database.');
    console.error('   Pastikan MySQL jalan & .env sudah benar.');
    process.exit(1);
  }

  // Jika database aman, baru server menerima request.
  app.listen(PORT, () => {
    console.log('');
    console.log('═══════════════════════════════════════════════════');
    console.log(`  🚀 e-Surat Desa API`);
    console.log(`  📍 http://localhost:${PORT}`);
    console.log(`  🔧 Environment: ${process.env.NODE_ENV}`);
    console.log(`  ❤️  Health: http://localhost:${PORT}/api/health`);
    console.log('═══════════════════════════════════════════════════');
    console.log('');
  });
})();

// Graceful shutdown: ketika terminal dihentikan dengan Ctrl+C,
// tampilkan pesan lalu matikan proses Node.js.
process.on('SIGINT', () => {
  console.log('\n👋 Server shutting down...');
  process.exit(0);
});
