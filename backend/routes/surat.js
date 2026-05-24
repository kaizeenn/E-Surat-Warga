/**
 * Routes warga.
 * Solusi 3 (Hybrid):
 * - Field dinamis dari template.fields (JSON di database)
 * - Jawaban warga disimpan di data_form (JSON)
 * - File KTP/KK tetap eksplisit dengan status verifikasi
 */

const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authWarga, auth } = require('../middleware/auth');
const { TemplateSurat, PermohonanSurat } = require('../models');

// Folder penyimpanan file persyaratan warga
const persyaratanDir = path.join(__dirname, '..', 'uploads', 'persyaratan');
fs.mkdirSync(persyaratanDir, { recursive: true });

// Konfigurasi upload file persyaratan
const uploadPersyaratan = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, persyaratanDir),
    filename: (req, file, cb) => {
      const safe = (file.originalname || 'berkas').replace(/[^a-zA-Z0-9._-]/g, '_');
      cb(null, `permohonan-${req.user?.id || 'guest'}-${Date.now()}-${safe}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});

function handlePersyaratanUpload(req, res, next) {
  uploadPersyaratan.any()(req, res, (err) => {
    if (err) {
      const message = err.code === 'LIMIT_FILE_SIZE' ? 'Ukuran file persyaratan maksimal 5MB per file' : err.message;
      return res.status(400).json({ success: false, message });
    }
    next();
  });
}

// Default lampiran KTP dan KK (tetap hardcoded karena setiap surat perlu ini)
const DEFAULT_PERSYARATAN = [
  { key: 'ktp', label: 'Fotokopi KTP', required: true, note: 'KTP pemohon yang masih berlaku' },
  { key: 'kk', label: 'Fotokopi KK', required: true, note: 'Kartu Keluarga terbaru' },
];

// Parse JSON string jika perlu
function parseJson(value, fallback) {
  if (typeof value === 'string') {
    try { return JSON.parse(value); } catch { return fallback; }
  }
  return value ?? fallback;
}

// Cek validasi form
function handleValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Validasi gagal',
      errors: errors.array().map(e => ({ field: e.path, message: e.msg }))
    });
    return false;
  }
  return true;
}

// Normalisasi field agar punya name (untuk frontend) dan key (untuk backend)
function normalizeFields(fields) {
  if (!Array.isArray(fields)) return [];
  return fields
    .filter(Boolean)
    .map((f) => ({
      ...f,
      name: f.name || f.key,
      key: f.key || f.name,
    }))
    .filter((f) => f.name);
}

// Tambahkan metadata template (fields dari database + persyaratan default)
function withTemplateMeta(tpl) {
  const fields = normalizeFields(parseJson(tpl.fields, []));
  return {
    ...tpl,
    fields,
    persyaratan: DEFAULT_PERSYARATAN,
  };
}

// Build data_tambahan dari data_form JSON untuk API response compatibility
function buildDataTambahanFromDataForm(dataFormJson) {
  const dataForm = parseJson(dataFormJson, {});
  return dataForm;
}

// Build lampiran array dari file_ktp, file_kk, status verifikasi
function buildLampiran(row) {
  return [
    {
      key: 'ktp',
      label: 'Fotokopi KTP',
      required: true,
      note: 'KTP pemohon yang masih berlaku',
      input_name: 'persyaratan_0',
      file_name: row.file_ktp ? path.basename(row.file_ktp) : null,
      file_url: row.file_ktp,
    },
    {
      key: 'kk',
      label: 'Fotokopi KK',
      required: true,
      note: 'Kartu Keluarga terbaru',
      input_name: 'persyaratan_1',
      file_name: row.file_kk ? path.basename(row.file_kk) : null,
      file_url: row.file_kk,
    },
  ];
}

// Serialize permohonan row dengan template metadata dan lampiran
async function serializePermohonanRow(row) {
  let template = null;
  if (row.template_id) {
    const tpl = await TemplateSurat.findById(row.template_id);
    template = tpl ? withTemplateMeta(tpl) : null;
  }

  return {
    ...row,
    template,
    data_tambahan: buildDataTambahanFromDataForm(row.data_form),
    lampiran_persyaratan: buildLampiran(row),
  };
}

// GET /api/surat/template
// Menampilkan jenis surat aktif untuk form pengajuan warga
router.get('/template', auth, async (_req, res, next) => {
  try {
    const templates = await TemplateSurat.findAll({ activeOnly: true });
    res.json({ success: true, data: templates.map(withTemplateMeta) });
  } catch (err) { next(err); }
});

// GET /api/surat/template/:kode
// Detail jenis surat berdasarkan kode
router.get('/template/:kode', auth, async (req, res, next) => {
  try {
    const template = await TemplateSurat.findByKode(req.params.kode, { activeOnly: true });
    if (!template) return res.status(404).json({ success: false, message: 'Template tidak ditemukan' });
    res.json({ success: true, data: withTemplateMeta(template) });
  } catch (err) { next(err); }
});

// POST /api/surat/ajukan
// Warga mengajukan surat dengan data_form (JSON) dan upload KTP + KK
router.post('/ajukan', authWarga, handlePersyaratanUpload, [
  body('templateKode').notEmpty().withMessage('templateKode wajib diisi'),
  body('keperluan').trim().notEmpty().withMessage('Keperluan wajib diisi'),
], async (req, res, next) => {
  if (!handleValidation(req, res)) return;

  try {
    let { templateKode, keperluan, dataTambahan } = req.body;

    // Parse data_tambahan (sebenarnya isi data_form)
    dataTambahan = parseJson(dataTambahan, {});
    if (!dataTambahan || typeof dataTambahan !== 'object') dataTambahan = {};

    // Cari template
    const tpl = await TemplateSurat.findByKode(templateKode, { activeOnly: true });
    if (!tpl) {
      return res.status(404).json({ success: false, message: 'Jenis surat tidak tersedia' });
    }

    // Validasi field wajib dari template
    const fields = normalizeFields(parseJson(tpl.fields, []));
    const missing = fields
      .filter(f => f.required && !String(dataTambahan[f.key || f.name] || '').trim())
      .map(f => f.label || f.name || f.key);

    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Field wajib belum diisi: ${missing.join(', ')}`
      });
    }

    // Cek file upload KTP dan KK
    const filesByField = Object.fromEntries((req.files || []).map(file => [file.fieldname, file]));
    const ktp = filesByField.persyaratan_0;
    const kk = filesByField.persyaratan_1;

    if (!ktp || !kk) {
      return res.status(400).json({ success: false, message: 'File KTP dan KK wajib diupload' });
    }

    // Buat permohonan
    const permohonan = await PermohonanSurat.create({
      warga_id: req.user.id,
      template_id: tpl.id,
      keperluan,
      data_form: dataTambahan, // simpan sebagai JSON
      file_ktp: `/uploads/persyaratan/${ktp.filename}`,
      file_kk: `/uploads/persyaratan/${kk.filename}`,
    });

    res.status(201).json({
      success: true,
      message: 'Permohonan berhasil diajukan',
      data: {
        id: permohonan.id,
        status: 'menunggu',
        jenisSurat: tpl.nama,
        jumlahLampiran: 2,
        createdAt: new Date()
      }
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/surat/saya
// Riwayat pengajuan warga yang sedang login
router.get('/saya', authWarga, async (req, res, next) => {
  try {
    const rows = await PermohonanSurat.findByWarga(req.user.id);
    res.json({
      success: true,
      data: rows.map(r => ({
        ...r,
        template: { id: r.template_id, kode: r.template_kode, nama: r.template_nama }
      }))
    });
  } catch (err) { next(err); }
});

// GET /api/surat/saya/:id
// Detail pengajuan warga, termasuk status KTP dan KK
router.get('/saya/:id', authWarga, async (req, res, next) => {
  try {
    const row = await PermohonanSurat.findByIdAndWarga(req.params.id, req.user.id);
    if (!row) {
      return res.status(404).json({ success: false, message: 'Permohonan tidak ditemukan' });
    }
    res.json({ success: true, data: await serializePermohonanRow(row) });
  } catch (err) { next(err); }
});

// GET /api/surat/saya/:id/download
// Download PDF surat selesai dengan autentikasi
router.get('/saya/:id/download', authWarga, async (req, res, next) => {
  try {
    const row = await PermohonanSurat.findByIdAndWarga(req.params.id, req.user.id);
    if (!row) {
      return res.status(404).json({ success: false, message: 'Permohonan tidak ditemukan' });
    }

    if (row.status !== 'selesai') {
      return res.status(400).json({ success: false, message: 'Surat belum selesai, belum bisa diunduh' });
    }

    if (!row.file_pdf) {
      return res.status(404).json({ success: false, message: 'File PDF surat belum tersedia' });
    }

    const relativePath = row.file_pdf.replace(/^\/uploads\//, 'uploads/');
    const filePath = path.join(__dirname, '..', relativePath);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'File PDF tidak ditemukan di server' });
    }

    const fileName = `surat-${row.nomor_surat || row.id}.pdf`.replace(/[\\/]/g, '-');
    res.download(filePath, fileName);
  } catch (err) { next(err); }
});

module.exports = router;
