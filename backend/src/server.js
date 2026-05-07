/**
 * Entry point server.
 * Load env, test DB, lalu listen.
 */
require('dotenv').config();

const app = require('./app');
const { testConnection } = require('./config/database');

const PORT = process.env.PORT || 3000;

(async () => {
  // Test koneksi DB sebelum listen
  const dbOk = await testConnection();
  if (!dbOk) {
    console.error('❌ Server tidak bisa start tanpa database.');
    console.error('   Pastikan MySQL jalan & .env sudah benar.');
    process.exit(1);
  }

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

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Server shutting down...');
  process.exit(0);
});
