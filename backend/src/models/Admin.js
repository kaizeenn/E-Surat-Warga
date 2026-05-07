/**
 * Model Admin — akun pengurus desa/RT/RW.
 * Tabel terpisah dari Warga karena kolom & hak akses berbeda.
 */
const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');

const Admin = sequelize.define('Admin', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nama_lengkap: {
    type: DataTypes.STRING(100),
    allowNull: false,
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
  jabatan: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'Ketua RT',
  },
  no_hp: {
    type: DataTypes.STRING(15),
    allowNull: true,
  },
  ttd_image: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  aktif: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
}, {
  tableName: 'admin',
  hooks: {
    beforeCreate: async (admin) => {
      if (admin.password) {
        admin.password = await bcrypt.hash(admin.password, 10);
      }
    },
    beforeUpdate: async (admin) => {
      if (admin.changed('password')) {
        admin.password = await bcrypt.hash(admin.password, 10);
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

Admin.prototype.checkPassword = async function (plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = Admin;
