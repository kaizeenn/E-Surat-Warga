/**
 * Model Warga — akun pemohon surat.
 * Data demografisnya dipakai untuk auto-fill isi surat.
 */
const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');

const Warga = sequelize.define('Warga', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nama_lengkap: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  nik: {
    type: DataTypes.STRING(16),
    allowNull: false,
    unique: true,
    validate: {
      len: [16, 16],
      isNumeric: true,
    },
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  tempat_lahir: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  tanggal_lahir: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  jenis_kelamin: {
    type: DataTypes.ENUM('laki-laki', 'perempuan'),
    allowNull: true,
  },
  alamat: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  agama: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  pekerjaan: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  no_hp: {
    type: DataTypes.STRING(15),
    allowNull: true,
  },
}, {
  tableName: 'warga',
  hooks: {
    beforeCreate: async (warga) => {
      if (warga.password) {
        warga.password = await bcrypt.hash(warga.password, 10);
      }
    },
    beforeUpdate: async (warga) => {
      if (warga.changed('password')) {
        warga.password = await bcrypt.hash(warga.password, 10);
      }
    },
  },
  defaultScope: {
    attributes: { exclude: ['password'] },
  },
  scopes: {
    withPassword: {
      attributes: { include: ['password'] },
    },
  },
});

/**
 * Verifikasi password plaintext dengan hash di DB.
 */
Warga.prototype.checkPassword = async function (plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = Warga;
