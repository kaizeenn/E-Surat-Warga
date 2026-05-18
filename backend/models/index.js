// Export semua model agar mudah di-import dari route/middleware.
module.exports = {
  Warga: require('./Warga'),
  Admin: require('./Admin'),
  TemplateSurat: require('./TemplateSurat'),
  PermohonanSurat: require('./PermohonanSurat'),
  NomorSurat: require('./NomorSurat'),
};
