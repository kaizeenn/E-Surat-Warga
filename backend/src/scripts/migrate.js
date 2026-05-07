/**
 * Migration script — sync semua model ke tabel MySQL.
 *
 * Usage:
 *   node src/scripts/migrate.js          # alter (non-destructive)
 *   node src/scripts/migrate.js --force  # drop + recreate (HATI-HATI: hapus data)
 */
require('dotenv').config();

const { sequelize } = require('../models');

const force = process.argv.includes('--force');

(async () => {
  try {
    console.log('[migrate] Connecting to database...');
    await sequelize.authenticate();
    console.log('[migrate] Connected.');

    if (force) {
      console.log('[migrate] Mode: FORCE (drop + recreate all tables)');
    } else {
      console.log('[migrate] Mode: ALTER (preserve existing data)');
    }

    await sequelize.sync({ force, alter: !force });

    console.log('[migrate] Done. Tables:');
    const [results] = await sequelize.query('SHOW TABLES');
    results.forEach((r) => console.log('  -', Object.values(r)[0]));

    process.exit(0);
  } catch (err) {
    console.error('[migrate] Failed:', err.message);
    process.exit(1);
  }
})();
