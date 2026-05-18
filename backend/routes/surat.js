/**
 * Routes warga.
 * Query database utama dipisah ke folder models agar struktur lebih sesuai MVC sederhana.
 *
 * Catatan desain database:
 * - Data pengajuan disimpan langsung di tabel permohonan_surat.
 * - File KTP dan KK disimpan sebagai path di kolom file_ktp dan file_kk.
 * - Keterangan tambahan surat disimpan di kolom yang memang dibutuhkan saja.
 */
const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authWarga, auth } = require('../middleware/auth');
const { TemplateSurat, PermohonanSurat } = require('../models');

// Folder penyimpanan file persyaratan warga.
const persyaratanDir = path.join(__dirname, '..', 'uploads', 'persyaratan');
fs.mkdirSync(persyaratanDir, { recursive: true });

// Konfigurasi upload file persyaratan.
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

// Data template dibuat statis di kode karena jenis suratnya sedikit.
// Tujuannya agar tabel database tidak terlalu banyak untuk tugas kampus.
const TEMPLATE_META = {
  DOMISILI: {
    fields: [
      { name: 'tujuanInstansi', label: 'Tujuan Instansi/Pihak', type: 'text', required: true },
      { name: 'nomorKk', label: 'Nomor KK', type: 'text', required: true },
    ],
  },
  TIDAK_MAMPU: {
    fields: [
      { name: 'tujuanPenggunaan', label: 'Tujuan Penggunaan Surat', type: 'text', required: true },
      { name: 'nomorKk', label: 'Nomor KK', type: 'text', required: true },
      { name: 'kondisiEkonomi', label: 'Ringkasan Kondisi Ekonomi', type: 'textarea', required: true },
    ],
  },
  USAHA: {
    fields: [
      { name: 'namaUsaha', label: 'Nama Usaha', type: 'text', required: true },
      { name: 'jenisUsaha', label: 'Jenis Usaha', type: 'text', required: true },
      { name: 'alamatUsaha', label: 'Alamat Usaha', type: 'text', required: true },
      { name: 'nomorKk', label: 'Nomor KK', type: 'text', required: true },
    ],
  },
};

const DEFAULT_PERSYARATAN = [
  { key: 'ktp', label: 'Fotokopi KTP', required: true, note: 'KTP pemohon yang masih berlaku' },
  { key: 'kk', label: 'Fotokopi KK', required: true, note: 'Kartu Keluarga terbaru' },
];

function parseRequestJson(value, fallback) {
  if (typeof value === 'string') {
    try { return JSON.parse(value); } catch { return fallback; }
  }
  return value ?? fallback;
}

function handleValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, message: 'Validasi gagal', errors: errors.array().map(e => ({ field: e.path, message: e.msg })) });
    return false;
  }
  return true;
}

function withTemplateMeta(tpl) {
  const meta = TEMPLATE_META[tpl.kode] || { fields: [] };
  return {
    ...tpl,
    fields: meta.fields,
    persyaratan: DEFAULT_PERSYARATAN,
  };
}

function buildDataTambahan(row) {
  return {
    nomorKk: row.nomor_kk || '',
    tujuanInstansi: row.tujuan_instansi || '',
    tujuanPenggunaan: row.tujuan_penggunaan || '',
    kondisiEkonomi: row.kondisi_ekonomi || '',
    namaUsaha: row.nama_usaha || '',
    jenisUsaha: row.jenis_usaha || '',
    alamatUsaha: row.alamat_usaha || '',
  };
}

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
      verification_status: row.status_ktp || 'pending',
      verification_note: row.catatan_ktp || '',
      verified_by: row.verified_ktp_by,
      verified_at: row.verified_ktp_at,
    },
    {
      key: 'kk',
      label: 'Fotokopi KK',
      required: true,
      note: 'Kartu Keluarga terbaru',
      input_name: 'persyaratan_1',
      file_name: row.file_kk ? path.basename(row.file_kk) : null,
      file_url: row.file_kk,
      verification_status: row.status_kk || 'pending',
      verification_note: row.catatan_kk || '',
      verified_by: row.verified_kk_by,
      verified_at: row.verified_kk_at,
    },
  ];
}

async function serializePermohonanRow(row) {
  let template = null;
  if (row.template_id) {
    const tpl = await TemplateSurat.findById(row.template_id);
    template = tpl ? withTemplateMeta(tpl) : null;
  }

  return {
    ...row,
    template,
    data_tambahan: buildDataTambahan(row),
    lampiran_persyaratan: buildLampiran(row),
  };
}

// GET /api/surat/template
// Menampilkan jenis surat aktif untuk form pengajuan warga.
router.get('/template', auth, async (_req, res, next) => {
  try {
    const templates = await TemplateSurat.findAll({ activeOnly: true });
    res.json({ success: true, data: templates.map(withTemplateMeta) });
  } catch (err) { next(err); }
});

// GET /api/surat/template/:kode
// Detail jenis surat berdasarkan kode.
router.get('/template/:kode', auth, async (req, res, next) => {
  try {
    const template = await TemplateSurat.findByKode(req.params.kode, { activeOnly: true });
    if (!template) return res.status(404).json({ success: false, message: 'Template tidak ditemukan' });
    res.json({ success: true, data: withTemplateMeta(template) });
  } catch (err) { next(err); }
});

// POST /api/surat/ajukan
// Warga mengajukan surat dan upload KTP + KK.
router.post('/ajukan', authWarga, handlePersyaratanUpload, [
  body('templateKode').notEmpty().withMessage('templateKode wajib diisi'),
  body('keperluan').trim().notEmpty().withMessage('Keperluan wajib diisi'),
], async (req, res, next) => {
  if (!handleValidation(req, res)) return;
  try {
    let { templateKode, keperluan, dataTambahan } = req.body;
    dataTambahan = parseRequestJson(dataTambahan, {});
    if (!dataTambahan || typeof dataTambahan !== 'object') dataTambahan = {};

    const tpl = await TemplateSurat.findByKode(templateKode, { activeOnly: true });
    if (!tpl) return res.status(404).json({ success: false, message: 'Jenis surat tidak tersedia' });

    const fields = TEMPLATE_META[tpl.kode]?.fields || [];
    const missing = fields.filter(f => f.required && !String(dataTambahan[f.name] || '').trim()).map(f => f.label || f.name);
    if (missing.length) return res.status(400).json({ success: false, message: `Field wajib belum diisi: ${missing.join(', ')}` });

    const filesByField = Object.fromEntries((req.files || []).map(file => [file.fieldname, file]));
    const ktp = filesByField.persyaratan_0;
    const kk = filesByField.persyaratan_1;
    if (!ktp || !kk) return res.status(400).json({ success: false, message: 'File KTP dan KK wajib diupload' });

    const permohonan = await PermohonanSurat.create({
      warga_id: req.user.id,
      template_id: tpl.id,
      keperluan,
      nomor_kk: dataTambahan.nomorKk || null,
      tujuan_instansi: dataTambahan.tujuanInstansi || null,
      tujuan_penggunaan: dataTambahan.tujuanPenggunaan || null,
      kondisi_ekonomi: dataTambahan.kondisiEkonomi || null,
      nama_usaha: dataTambahan.namaUsaha || null,
      jenis_usaha: dataTambahan.jenisUsaha || null,
      alamat_usaha: dataTambahan.alamatUsaha || null,
      file_ktp: `/uploads/persyaratan/${ktp.filename}`,
      file_kk: `/uploads/persyaratan/${kk.filename}`,
    });

    res.status(201).json({ success: true, message: 'Permohonan berhasil diajukan', data: { id: permohonan.id, status: 'menunggu', jenisSurat: tpl.nama, jumlahLampiran: 2, createdAt: new Date() } });
  } catch (err) {
    next(err);
  }
});

// GET /api/surat/saya
// Riwayat pengajuan warga yang sedang login.
router.get('/saya', authWarga, async (req, res, next) => {
  try {
    const rows = await PermohonanSurat.findByWarga(req.user.id);
    res.json({ success: true, data: rows.map(r => ({ ...r, template: { id: r.template_id, kode: r.template_kode, nama: r.template_nama } })) });
  } catch (err) { next(err); }
});

// GET /api/surat/saya/:id
// Detail pengajuan warga, termasuk status KTP dan KK.
router.get('/saya/:id', authWarga, async (req, res, next) => {
  try {
    const row = await PermohonanSurat.findByIdAndWarga(req.params.id, req.user.id);
    if (!row) return res.status(404).json({ success: false, message: 'Permohonan tidak ditemukan' });
    res.json({ success: true, data: await serializePermohonanRow(row) });
  } catch (err) { next(err); }
});

module.exports = router;
