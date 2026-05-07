/**
 * Model PermohonanSurat — entitas utama transaksi.
 * FK: warga_id, template_id, admin_id (admin yang approve/tolak).
 */
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PermohonanSurat = sequelize.define('PermohonanSurat', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  warga_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  template_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  admin_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Admin yang approve/tolak. NULL saat masih MENUNGGU.',
  },
  nomor_surat: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Format: 001/DS-RT003/V/2025. Diisi saat approve.',
  },
  keperluan: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  data_tambahan: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {},
  },
  status: {
    type: DataTypes.ENUM('menunggu', 'diproses', 'selesai', 'ditolak'),
    allowNull: false,
    defaultValue: 'menunggu',
  },
  catatan_admin: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  file_pdf: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  tanggal_approve: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'permohonan_surat',
  indexes: [
    { fields: ['warga_id'] },
    { fields: ['template_id'] },
    { fields: ['admin_id'] },
    { fields: ['status'] },
  ],
});

module.exports = PermohonanSurat;
