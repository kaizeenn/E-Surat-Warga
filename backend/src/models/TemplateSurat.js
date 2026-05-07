/**
 * Model TemplateSurat — definisi jenis surat yang tersedia.
 * field "fields" berisi daftar field tambahan yang harus diisi warga.
 */
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TemplateSurat = sequelize.define('TemplateSurat', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  kode: {
    type: DataTypes.STRING(30),
    allowNull: false,
    unique: true,
  },
  nama: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  deskripsi: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  /**
   * fields berbentuk array of object:
   * [{ name: "tujuanInstansi", label: "Tujuan Instansi", type: "text", required: true }]
   */
  fields: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
  },
  file_template: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Nama file HTML di src/templates/',
  },
  aktif: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
}, {
  tableName: 'template_surat',
});

module.exports = TemplateSurat;
