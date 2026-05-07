/**
 * Model NomorSurat — counter helper untuk generate nomor surat sequential.
 * Format akhir: 001/DS-RT003/V/2025
 *               ^^^ urutan
 *                   ^^ kode template
 *                       ^^^^^ nomor RT
 *                              ^ bulan romawi
 *                                ^^^^ tahun
 */
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const NomorSurat = sequelize.define('NomorSurat', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  tahun: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  bulan: {
    type: DataTypes.TINYINT,
    allowNull: false,
    validate: { min: 1, max: 12 },
  },
  urutan: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
}, {
  tableName: 'nomor_surat',
  indexes: [
    { fields: ['tahun', 'bulan'], unique: true },
  ],
});

/**
 * Ambil nomor urut berikutnya untuk bulan & tahun tertentu.
 * Aman dari race condition karena pakai transaction + row lock.
 */
NomorSurat.getNextUrutan = async function (tahun, bulan, transaction = null) {
  const [row] = await NomorSurat.findOrCreate({
    where: { tahun, bulan },
    defaults: { tahun, bulan, urutan: 0 },
    transaction,
    lock: transaction ? transaction.LOCK.UPDATE : undefined,
  });
  row.urutan += 1;
  await row.save({ transaction });
  return row.urutan;
};

module.exports = NomorSurat;
