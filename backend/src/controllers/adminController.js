/**
 * Controller untuk endpoint admin (review, approve, tolak, arsip, stats).
 */
const { Op } = require('sequelize');
const { sequelize, PermohonanSurat, TemplateSurat, Warga, Admin, NomorSurat } = require('../models');
const { formatNomorSurat } = require('../utils/nomorSurat');
const pdfService = require('../services/pdfGenerator');

// ===== List semua permohonan (filter: status, search) =====
exports.listPermohonan = async (req, res, next) => {
  try {
    const { status, q } = req.query;
    const where = {};
    if (status) where.status = status;

    const include = [
      { model: TemplateSurat, as: 'template', attributes: ['kode', 'nama'] },
      { model: Warga, as: 'warga', attributes: ['id', 'nama_lengkap', 'nik', 'email'] },
      { model: Admin, as: 'admin', attributes: ['id', 'nama_lengkap', 'jabatan'] },
    ];

    if (q) {
      include[1].where = {
        [Op.or]: [
          { nama_lengkap: { [Op.like]: `%${q}%` } },
          { nik: { [Op.like]: `%${q}%` } },
        ],
      };
      include[1].required = true;
    }

    const list = await PermohonanSurat.findAll({
      where, include,
      order: [['created_at', 'DESC']],
    });
    res.json({ success: true, data: list });
  } catch (err) { next(err); }
};

// ===== Detail permohonan (admin lihat full data warga) =====
exports.detailPermohonan = async (req, res, next) => {
  try {
    const p = await PermohonanSurat.findByPk(req.params.id, {
      include: [
        { model: TemplateSurat, as: 'template' },
        { model: Warga, as: 'warga' },
        { model: Admin, as: 'admin', attributes: ['id', 'nama_lengkap', 'jabatan'] },
      ],
    });
    if (!p) return res.status(404).json({ success: false, message: 'Permohonan tidak ditemukan' });
    res.json({ success: true, data: p });
  } catch (err) { next(err); }
};

// ===== Approve =====
exports.approve = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const p = await PermohonanSurat.findByPk(req.params.id, {
      include: [
        { model: TemplateSurat, as: 'template' },
        { model: Warga, as: 'warga' },
      ],
      transaction: t,
    });
    if (!p) {
      await t.rollback();
      return res.status(404).json({ success: false, message: 'Permohonan tidak ditemukan' });
    }
    if (p.status === 'selesai') {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'Permohonan sudah disetujui sebelumnya' });
    }
    if (p.status === 'ditolak') {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'Permohonan ini sudah ditolak' });
    }

    // Generate nomor surat
    const now = new Date();
    const tahun = now.getFullYear();
    const bulan = now.getMonth() + 1;
    const urutan = await NomorSurat.getNextUrutan(tahun, bulan, t);

    const nomorSurat = formatNomorSurat({
      urutan,
      kodeTemplate: p.template.kode,
      rtNomor: process.env.RT_NOMOR || '003',
      bulan,
      tahun,
    });

    // Generate PDF (di luar transaction karena pakai puppeteer & file system)
    p.status = 'selesai';
    p.nomor_surat = nomorSurat;
    p.admin_id = req.user.id;
    p.tanggal_approve = now;
    await p.save({ transaction: t });
    await t.commit();

    // Reload + admin info, lalu render PDF
    const fresh = await PermohonanSurat.findByPk(p.id, {
      include: [
        { model: TemplateSurat, as: 'template' },
        { model: Warga, as: 'warga' },
        { model: Admin, as: 'admin' },
      ],
    });

    let pdfPath = null;
    try {
      pdfPath = await pdfService.generate(fresh);
      fresh.file_pdf = pdfPath;
      await fresh.save();
    } catch (pdfErr) {
      console.error('[approve] PDF generation failed:', pdfErr.message);
      // Tetap return sukses approve, PDF bisa di-regenerate
    }

    res.json({
      success: true,
      message: 'Surat berhasil diterbitkan',
      data: {
        id: fresh.id,
        nomorSurat: fresh.nomor_surat,
        filePdf: fresh.file_pdf,
        tanggalTerbit: fresh.tanggal_approve,
        diapproveOleh: {
          id: req.user.id,
          nama: req.user.nama_lengkap,
          jabatan: req.user.jabatan,
        },
      },
    });
  } catch (err) {
    if (!t.finished) await t.rollback();
    next(err);
  }
};

// ===== Tolak =====
exports.tolak = async (req, res, next) => {
  try {
    const { catatan } = req.body;
    if (!catatan || catatan.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Catatan alasan penolakan wajib diisi (min. 5 karakter)',
      });
    }

    const p = await PermohonanSurat.findByPk(req.params.id);
    if (!p) return res.status(404).json({ success: false, message: 'Permohonan tidak ditemukan' });
    if (p.status === 'selesai') {
      return res.status(400).json({ success: false, message: 'Tidak bisa menolak surat yang sudah disetujui' });
    }

    await p.update({
      status: 'ditolak',
      admin_id: req.user.id,
      catatan_admin: catatan.trim(),
    });

    res.json({
      success: true,
      message: 'Permohonan ditolak',
      data: { id: p.id, status: p.status, catatan_admin: p.catatan_admin },
    });
  } catch (err) { next(err); }
};

// ===== Arsip surat (yang sudah selesai) =====
exports.arsip = async (req, res, next) => {
  try {
    const list = await PermohonanSurat.findAll({
      where: { status: 'selesai' },
      include: [
        { model: TemplateSurat, as: 'template', attributes: ['kode', 'nama'] },
        { model: Warga, as: 'warga', attributes: ['nama_lengkap', 'nik'] },
        { model: Admin, as: 'admin', attributes: ['nama_lengkap', 'jabatan'] },
      ],
      order: [['tanggal_approve', 'DESC']],
    });
    res.json({ success: true, data: list });
  } catch (err) { next(err); }
};

// ===== KELOLA TEMPLATE SURAT =====

exports.listTemplate = async (req, res, next) => {
  try {
    const list = await TemplateSurat.findAll({ order: [['id', 'ASC']] });
    res.json({ success: true, data: list });
  } catch (err) { next(err); }
};

exports.detailTemplate = async (req, res, next) => {
  try {
    const t = await TemplateSurat.findByPk(req.params.id);
    if (!t) return res.status(404).json({ success: false, message: 'Template tidak ditemukan' });
    res.json({ success: true, data: t });
  } catch (err) { next(err); }
};

exports.createTemplate = async (req, res, next) => {
  try {
    const { kode, nama, deskripsi, fields, file_template, aktif } = req.body;

    if (!kode || !nama || !file_template) {
      return res.status(400).json({
        success: false,
        message: 'Kode, nama, dan file_template wajib diisi',
      });
    }

    const exists = await TemplateSurat.findOne({ where: { kode: kode.toUpperCase() } });
    if (exists) {
      return res.status(409).json({ success: false, message: 'Kode template sudah ada' });
    }

    // Validasi file template ada di disk
    const path = require('path');
    const fs = require('fs');
    const fullPath = path.join(__dirname, '../templates', file_template);
    if (!fs.existsSync(fullPath)) {
      return res.status(400).json({
        success: false,
        message: `File template '${file_template}' tidak ditemukan di src/templates/`,
      });
    }

    const created = await TemplateSurat.create({
      kode: kode.toUpperCase(),
      nama,
      deskripsi,
      fields: Array.isArray(fields) ? fields : [],
      file_template,
      aktif: aktif !== undefined ? aktif : true,
    });
    res.status(201).json({ success: true, message: 'Template dibuat', data: created });
  } catch (err) { next(err); }
};

exports.updateTemplate = async (req, res, next) => {
  try {
    const t = await TemplateSurat.findByPk(req.params.id);
    if (!t) return res.status(404).json({ success: false, message: 'Template tidak ditemukan' });

    const allowed = ['nama', 'deskripsi', 'fields', 'aktif', 'file_template'];
    const update = {};
    for (const k of allowed) {
      if (req.body[k] !== undefined) update[k] = req.body[k];
    }

    if (update.file_template) {
      const path = require('path');
      const fs = require('fs');
      const fullPath = path.join(__dirname, '../templates', update.file_template);
      if (!fs.existsSync(fullPath)) {
        return res.status(400).json({
          success: false,
          message: `File template '${update.file_template}' tidak ditemukan`,
        });
      }
    }

    await t.update(update);
    res.json({ success: true, message: 'Template diperbarui', data: t });
  } catch (err) { next(err); }
};

exports.deleteTemplate = async (req, res, next) => {
  try {
    const t = await TemplateSurat.findByPk(req.params.id);
    if (!t) return res.status(404).json({ success: false, message: 'Template tidak ditemukan' });

    // Cek apakah sudah dipakai
    const used = await PermohonanSurat.count({ where: { template_id: t.id } });
    if (used > 0) {
      return res.status(400).json({
        success: false,
        message: `Template ini sudah dipakai oleh ${used} permohonan. Nonaktifkan saja, jangan dihapus.`,
      });
    }

    await t.destroy();
    res.json({ success: true, message: 'Template dihapus' });
  } catch (err) { next(err); }
};

exports.toggleTemplate = async (req, res, next) => {
  try {
    const t = await TemplateSurat.findByPk(req.params.id);
    if (!t) return res.status(404).json({ success: false, message: 'Template tidak ditemukan' });
    await t.update({ aktif: !t.aktif });
    res.json({
      success: true,
      message: t.aktif ? 'Template diaktifkan' : 'Template dinonaktifkan',
      data: t,
    });
  } catch (err) { next(err); }
};

exports.listFileTemplate = async (req, res, next) => {
  try {
    const path = require('path');
    const fs = require('fs');
    const dir = path.join(__dirname, '../templates');
    const files = fs.readdirSync(dir)
      .filter(f => f.endsWith('.html') && !f.startsWith('_'));
    res.json({ success: true, data: files });
  } catch (err) { next(err); }
};

// ===== Statistik dashboard =====
exports.stats = async (req, res, next) => {
  try {
    const [total, menunggu, selesai, ditolak] = await Promise.all([
      PermohonanSurat.count(),
      PermohonanSurat.count({ where: { status: 'menunggu' } }),
      PermohonanSurat.count({ where: { status: 'selesai' } }),
      PermohonanSurat.count({ where: { status: 'ditolak' } }),
    ]);
    const totalWarga = await Warga.count();

    res.json({
      success: true,
      data: { total, menunggu, selesai, ditolak, totalWarga },
    });
  } catch (err) { next(err); }
};
