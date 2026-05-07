/**
 * Controller untuk endpoint warga (mengajukan, lacak, download).
 */
const { validationResult } = require('express-validator');
const { TemplateSurat, PermohonanSurat, Warga } = require('../models');

function handleValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Validasi gagal',
      errors: errors.array().map(e => ({ field: e.path, message: e.msg })),
    });
    return false;
  }
  return true;
}

// ===== List template surat aktif =====
exports.listTemplate = async (req, res, next) => {
  try {
    const templates = await TemplateSurat.findAll({
      where: { aktif: true },
      order: [['nama', 'ASC']],
    });
    res.json({ success: true, data: templates });
  } catch (err) { next(err); }
};

// ===== Detail template (untuk render form) =====
exports.detailTemplate = async (req, res, next) => {
  try {
    const tpl = await TemplateSurat.findOne({
      where: { kode: req.params.kode, aktif: true },
    });
    if (!tpl) return res.status(404).json({ success: false, message: 'Template tidak ditemukan' });
    res.json({ success: true, data: tpl });
  } catch (err) { next(err); }
};

// ===== Ajukan permohonan surat =====
exports.ajukan = async (req, res, next) => {
  if (!handleValidation(req, res)) return;
  try {
    const { templateKode, keperluan, dataTambahan } = req.body;

    const tpl = await TemplateSurat.findOne({ where: { kode: templateKode, aktif: true } });
    if (!tpl) {
      return res.status(404).json({ success: false, message: 'Jenis surat tidak tersedia' });
    }

    // Validasi field required di template
    const missing = [];
    for (const f of (tpl.fields || [])) {
      if (f.required && (!dataTambahan || !dataTambahan[f.name])) {
        missing.push(f.label || f.name);
      }
    }
    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Field wajib belum diisi: ${missing.join(', ')}`,
      });
    }

    const permohonan = await PermohonanSurat.create({
      warga_id: req.user.id,
      template_id: tpl.id,
      keperluan,
      data_tambahan: dataTambahan || {},
      status: 'menunggu',
    });

    res.status(201).json({
      success: true,
      message: 'Permohonan berhasil diajukan',
      data: {
        id: permohonan.id,
        status: permohonan.status,
        jenisSurat: tpl.nama,
        createdAt: permohonan.createdAt,
      },
    });
  } catch (err) { next(err); }
};

// ===== List permohonan milik warga yg login =====
exports.permohonanSaya = async (req, res, next) => {
  try {
    const list = await PermohonanSurat.findAll({
      where: { warga_id: req.user.id },
      include: [
        { model: TemplateSurat, as: 'template', attributes: ['kode', 'nama'] },
      ],
      order: [['created_at', 'DESC']],
    });
    res.json({ success: true, data: list });
  } catch (err) { next(err); }
};

// ===== Detail permohonan milik warga =====
exports.detailPermohonan = async (req, res, next) => {
  try {
    const p = await PermohonanSurat.findOne({
      where: { id: req.params.id, warga_id: req.user.id },
      include: [
        { model: TemplateSurat, as: 'template' },
      ],
    });
    if (!p) return res.status(404).json({ success: false, message: 'Permohonan tidak ditemukan' });
    res.json({ success: true, data: p });
  } catch (err) { next(err); }
};
