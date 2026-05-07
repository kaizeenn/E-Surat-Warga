/**
 * Registry model + asosiasi.
 * Import file ini di mana saja butuh akses model agar relasi sudah terdefinisi.
 */
const { sequelize } = require('../config/database');

const Warga = require('./Warga');
const Admin = require('./Admin');
const TemplateSurat = require('./TemplateSurat');
const PermohonanSurat = require('./PermohonanSurat');
const NomorSurat = require('./NomorSurat');

// ===== Asosiasi =====

// Warga (1) -> (N) PermohonanSurat
Warga.hasMany(PermohonanSurat, {
  foreignKey: 'warga_id',
  as: 'permohonan',
  onDelete: 'CASCADE',
});
PermohonanSurat.belongsTo(Warga, {
  foreignKey: 'warga_id',
  as: 'warga',
});

// TemplateSurat (1) -> (N) PermohonanSurat
TemplateSurat.hasMany(PermohonanSurat, {
  foreignKey: 'template_id',
  as: 'permohonan',
});
PermohonanSurat.belongsTo(TemplateSurat, {
  foreignKey: 'template_id',
  as: 'template',
});

// Admin (1) -> (N) PermohonanSurat (yang di-approve/tolak admin tsb)
Admin.hasMany(PermohonanSurat, {
  foreignKey: 'admin_id',
  as: 'permohonan_diproses',
});
PermohonanSurat.belongsTo(Admin, {
  foreignKey: 'admin_id',
  as: 'admin',
});

module.exports = {
  sequelize,
  Warga,
  Admin,
  TemplateSurat,
  PermohonanSurat,
  NomorSurat,
};
