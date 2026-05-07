/**
 * Konfigurasi koneksi database via Sequelize.
 * Otomatis membaca dari .env (sudah di-load di server.js).
 */
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    define: {
      timestamps: true,
      underscored: true, // created_at bukan createdAt
      freezeTableName: true, // nama tabel sesuai model (tidak diplural-kan otomatis)
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

/**
 * Test koneksi DB.
 */
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected:', process.env.DB_NAME);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

module.exports = { sequelize, testConnection };
