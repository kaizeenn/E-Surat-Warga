/**
 * Routes admin.
 * Sebagian query dibantu folder models agar memenuhi struktur MVC sederhana.
 *
 * Data pengajuan disimpan langsung di tabel permohonan_surat:
 * - keterangan/isian surat: nomor_kk, tujuan_instansi, tujuan_penggunaan, dll.
 * - file persyaratan: file_ktp dan file_kk.
 * - status verifikasi: status_ktp dan status_kk.
 */
const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../config/db');
const { authAdmin } = require('../middleware/auth');
const { formatNomorSurat } = require('../utils/nomorSurat');
const pdfService = require('../services/pdfGenerator');
const { TemplateSurat, PermohonanSurat, NomorSurat, Admin } = require('../models');

// Folder untuk menyimpan file tanda tangan digital admin.
const ttdDir = path.join(__dirname, '..', 'uploads', 'ttd');
fs.mkdirSync(ttdDir, { recursive: true });

// Konfigurasi upload TTD digital admin.
const uploadTtd = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, ttdDir),
    filename: (req, file, cb) => cb(null, `ttd-admin-${req.user.id}-${Date.now()}${path.extname(file.originalname).toLowerCase() || '.png'}`),
  }),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowed.includes(file.mimetype)) return cb(new Error('File TTD harus berupa PNG, JPG, JPEG, atau WEBP'));
    cb(null, true);
  },
});

function handleTtdUpload(req, res, next) {
  uploadTtd.single('ttd')(req, res, (err) => {
    if (err) return res.status(400).json({ success: false, message: err.code === 'LIMIT_FILE_SIZE' ? 'Ukuran file TTD maksimal 2MB' : err.message });
    next();
  });
}

// Metadata template dibuat statis agar database tidak terlalu banyak tabel.
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

function withTemplateMeta(tpl) {
  return {
    ...tpl,
    fields: TEMPLATE_META[tpl.kode]?.fields || [],
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

async function serializePermohonan(row) {
  const [tplRows] = await db.query('SELECT * FROM template_surat WHERE id = ? LIMIT 1', [row.template_id]);
  return {
    ...row,
    template: tplRows[0] ? withTemplateMeta(tplRows[0]) : null,
    data_tambahan: buildDataTambahan(row),
    lampiran_persyaratan: buildLampiran(row),
  };
}

// Mengambil nomor urut surat berikutnya untuk bulan dan tahun tertentu.
async function getNextUrutan(conn, tahun, bulan) {
  const [rows] = await conn.query('SELECT * FROM nomor_surat WHERE tahun = ? AND bulan = ? FOR UPDATE', [tahun, bulan]);
  if (!rows[0]) {
    await conn.query('INSERT INTO nomor_surat (tahun, bulan, urutan, created_at, updated_at) VALUES (?, ?, 1, NOW(), NOW())', [tahun, bulan]);
    return 1;
  }
  const next = Number(rows[0].urutan) + 1;
  await conn.query('UPDATE nomor_surat SET urutan = ?, updated_at = NOW() WHERE id = ?', [next, rows[0].id]);
  return next;
}

// Semua endpoint admin wajib login sebagai admin.
router.use(authAdmin);

// GET /api/admin/permohonan
// Menampilkan semua permohonan dari warga.
router.get('/permohonan', async (req, res, next) => {
  try {
    const params = [];
    let where = 'WHERE 1=1';
    if (req.query.status) { where += ' AND p.status = ?'; params.push(req.query.status); }
    if (req.query.q) { where += ' AND (w.nama_lengkap LIKE ? OR w.nik LIKE ?)'; params.push(`%${req.query.q}%`, `%${req.query.q}%`); }

    const [rows] = await db.query(
      `SELECT p.*, 
              t.kode AS template_kode, t.nama AS template_nama,
              w.nama_lengkap AS warga_nama, w.nik AS warga_nik, w.email AS warga_email,
              a.nama_lengkap AS admin_nama, a.jabatan AS admin_jabatan
       FROM permohonan_surat p
       LEFT JOIN template_surat t ON t.id = p.template_id
       LEFT JOIN warga w ON w.id = p.warga_id
       LEFT JOIN admin a ON a.id = p.admin_id
       ${where}
       ORDER BY p.created_at DESC`, params);

    res.json({ success: true, data: rows.map(r => ({
      ...r,
      template: { id: r.template_id, kode: r.template_kode, nama: r.template_nama },
      warga: { id: r.warga_id, nama_lengkap: r.warga_nama, nik: r.warga_nik, email: r.warga_email },
      admin: r.admin_id ? { id: r.admin_id, nama_lengkap: r.admin_nama, jabatan: r.admin_jabatan } : null,
    })) });
  } catch (err) { next(err); }
});

// GET /api/admin/permohonan/:id
// Detail permohonan untuk halaman review admin.
router.get('/permohonan/:id', async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT p.*, 
              w.nama_lengkap AS warga_nama_lengkap, w.nik AS warga_nik, w.email AS warga_email,
              w.tempat_lahir AS warga_tempat_lahir, w.tanggal_lahir AS warga_tanggal_lahir,
              w.jenis_kelamin AS warga_jenis_kelamin, w.alamat AS warga_alamat,
              w.agama AS warga_agama, w.pekerjaan AS warga_pekerjaan, w.no_hp AS warga_no_hp,
              a.nama_lengkap AS admin_nama_lengkap, a.jabatan AS admin_jabatan
       FROM permohonan_surat p
       LEFT JOIN warga w ON w.id = p.warga_id
       LEFT JOIN admin a ON a.id = p.admin_id
       WHERE p.id = ? LIMIT 1`, [req.params.id]);
    if (!rows[0]) return res.status(404).json({ success: false, message: 'Permohonan tidak ditemukan' });

    const data = await serializePermohonan(rows[0]);
    data.warga = {
      id: data.warga_id,
      nama_lengkap: data.warga_nama_lengkap,
      nik: data.warga_nik,
      email: data.warga_email,
      tempat_lahir: data.warga_tempat_lahir,
      tanggal_lahir: data.warga_tanggal_lahir,
      jenis_kelamin: data.warga_jenis_kelamin,
      alamat: data.warga_alamat,
      agama: data.warga_agama,
      pekerjaan: data.warga_pekerjaan,
      no_hp: data.warga_no_hp,
    };
    data.admin = data.admin_id ? { id: data.admin_id, nama_lengkap: data.admin_nama_lengkap, jabatan: data.admin_jabatan } : null;
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

// PATCH /api/admin/permohonan/:id/lampiran/:index/verifikasi
// index 0 = KTP, index 1 = KK.
router.patch('/permohonan/:id/lampiran/:index/verifikasi', async (req, res, next) => {
  try {
    const { status, catatan } = req.body;
    if (!['valid', 'tidak_valid', 'pending'].includes(status)) return res.status(400).json({ success: false, message: 'Status verifikasi tidak valid' });

    const index = Number(req.params.index);
    if (![0, 1].includes(index)) return res.status(404).json({ success: false, message: 'Lampiran tidak ditemukan' });

    const [rows] = await db.query('SELECT * FROM permohonan_surat WHERE id = ? LIMIT 1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ success: false, message: 'Permohonan tidak ditemukan' });

    const prefix = index === 0 ? 'ktp' : 'kk';
    await db.query(
      `UPDATE permohonan_surat
       SET status_${prefix} = ?, catatan_${prefix} = ?, verified_${prefix}_by = ?, verified_${prefix}_at = NOW(), admin_id = ?, updated_at = NOW()
       WHERE id = ?`,
      [status, catatan || '', req.user.id, req.user.id, req.params.id]
    );

    const [updated] = await db.query('SELECT * FROM permohonan_surat WHERE id = ? LIMIT 1', [req.params.id]);
    res.json({ success: true, message: 'Verifikasi lampiran berhasil disimpan', data: buildLampiran(updated[0])[index] });
  } catch (err) { next(err); }
});

// PATCH /api/admin/permohonan/:id/approve
// Admin menyetujui permohonan, lalu sistem membuat nomor surat dan PDF.
router.patch('/permohonan/:id/approve', async (req, res, next) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [rows] = await conn.query(
      `SELECT p.*, t.kode AS template_kode, t.nama AS template_nama, t.file_template,
              w.nama_lengkap AS warga_nama_lengkap, w.nik AS warga_nik, w.tempat_lahir AS warga_tempat_lahir,
              w.tanggal_lahir AS warga_tanggal_lahir, w.jenis_kelamin AS warga_jenis_kelamin, w.alamat AS warga_alamat,
              w.agama AS warga_agama, w.pekerjaan AS warga_pekerjaan, w.no_hp AS warga_no_hp,
              a.ttd_image AS admin_ttd_image
       FROM permohonan_surat p
       JOIN template_surat t ON t.id = p.template_id
       JOIN warga w ON w.id = p.warga_id
       LEFT JOIN admin a ON a.id = ?
       WHERE p.id = ? LIMIT 1 FOR UPDATE`, [req.user.id, req.params.id]);
    const p = rows[0];
    if (!p) { await conn.rollback(); return res.status(404).json({ success: false, message: 'Permohonan tidak ditemukan' }); }
    if (p.status === 'selesai') { await conn.rollback(); return res.status(400).json({ success: false, message: 'Permohonan sudah disetujui sebelumnya' }); }
    if (p.status === 'ditolak') { await conn.rollback(); return res.status(400).json({ success: false, message: 'Permohonan ini sudah ditolak' }); }

    if (!p.file_ktp || !p.file_kk) { await conn.rollback(); return res.status(400).json({ success: false, message: 'File KTP dan KK wajib ada sebelum approve' }); }
    if (p.status_ktp !== 'valid' || p.status_kk !== 'valid') { await conn.rollback(); return res.status(400).json({ success: false, message: 'KTP dan KK wajib divalidasi sebelum approve' }); }

    const now = new Date();
    const tahun = now.getFullYear();
    const bulan = now.getMonth() + 1;
    const urutan = await getNextUrutan(conn, tahun, bulan);
    const nomorSurat = formatNomorSurat({ urutan, kodeTemplate: p.template_kode, rtNomor: process.env.RT_NOMOR || '003', bulan, tahun });

    await conn.query('UPDATE permohonan_surat SET status = ?, nomor_surat = ?, admin_id = ?, tanggal_approve = NOW(), updated_at = NOW() WHERE id = ?', ['selesai', nomorSurat, req.user.id, p.id]);
    await conn.commit();

    const permohonanPdf = {
      id: p.id,
      nomor_surat: nomorSurat,
      tanggal_approve: now,
      keperluan: p.keperluan,
      data_tambahan: buildDataTambahan(p),
      template: { kode: p.template_kode, nama: p.template_nama, file_template: p.file_template },
      warga: {
        nama_lengkap: p.warga_nama_lengkap,
        nik: p.warga_nik,
        tempat_lahir: p.warga_tempat_lahir,
        tanggal_lahir: p.warga_tanggal_lahir,
        jenis_kelamin: p.warga_jenis_kelamin,
        alamat: p.warga_alamat,
        agama: p.warga_agama,
        pekerjaan: p.warga_pekerjaan,
        no_hp: p.warga_no_hp,
      },
      admin: { nama_lengkap: req.user.nama_lengkap, jabatan: req.user.jabatan, ttd_image: req.user.ttd_image || p.admin_ttd_image },
    };

    let pdfPath = null;
    try {
      pdfPath = await pdfService.generate(permohonanPdf);
      await db.query('UPDATE permohonan_surat SET file_pdf = ?, updated_at = NOW() WHERE id = ?', [pdfPath, p.id]);
    } catch (pdfErr) {
      console.error('[approve] PDF generation failed:', pdfErr.message);
    }

    res.json({ success: true, message: 'Surat berhasil diterbitkan', data: { id: p.id, nomorSurat, filePdf: pdfPath, tanggalTerbit: now, diapproveOleh: { id: req.user.id, nama: req.user.nama_lengkap, jabatan: req.user.jabatan } } });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally { conn.release(); }
});

// PATCH /api/admin/permohonan/:id/tolak
router.patch('/permohonan/:id/tolak', async (req, res, next) => {
  try {
    const { catatan } = req.body;
    if (!catatan || catatan.trim().length < 5) return res.status(400).json({ success: false, message: 'Catatan alasan penolakan wajib diisi (min. 5 karakter)' });
    const [rows] = await db.query('SELECT * FROM permohonan_surat WHERE id = ? LIMIT 1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ success: false, message: 'Permohonan tidak ditemukan' });
    if (rows[0].status === 'selesai') return res.status(400).json({ success: false, message: 'Tidak bisa menolak surat yang sudah disetujui' });
    await db.query('UPDATE permohonan_surat SET status = ?, admin_id = ?, catatan_admin = ?, updated_at = NOW() WHERE id = ?', ['ditolak', req.user.id, catatan.trim(), req.params.id]);
    res.json({ success: true, message: 'Permohonan ditolak', data: { id: Number(req.params.id), status: 'ditolak', catatan_admin: catatan.trim() } });
  } catch (err) { next(err); }
});

// GET /api/admin/arsip
router.get('/arsip', async (_req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT p.*, t.kode AS template_kode, t.nama AS template_nama, w.nama_lengkap AS warga_nama, w.nik AS warga_nik, a.nama_lengkap AS admin_nama, a.jabatan AS admin_jabatan
       FROM permohonan_surat p
       LEFT JOIN template_surat t ON t.id = p.template_id
       LEFT JOIN warga w ON w.id = p.warga_id
       LEFT JOIN admin a ON a.id = p.admin_id
       WHERE p.status = 'selesai'
       ORDER BY p.tanggal_approve DESC`
    );
    res.json({ success: true, data: rows.map(r => ({ ...r, template: { kode: r.template_kode, nama: r.template_nama }, warga: { nama_lengkap: r.warga_nama, nik: r.warga_nik }, admin: { nama_lengkap: r.admin_nama, jabatan: r.admin_jabatan } })) });
  } catch (err) { next(err); }
});

// GET /api/admin/stats
router.get('/stats', async (_req, res, next) => {
  try {
    const [[totalRows], [menungguRows], [selesaiRows], [ditolakRows], [wargaRows]] = await Promise.all([
      db.query('SELECT COUNT(*) AS total FROM permohonan_surat'),
      db.query("SELECT COUNT(*) AS total FROM permohonan_surat WHERE status = 'menunggu'"),
      db.query("SELECT COUNT(*) AS total FROM permohonan_surat WHERE status = 'selesai'"),
      db.query("SELECT COUNT(*) AS total FROM permohonan_surat WHERE status = 'ditolak'"),
      db.query('SELECT COUNT(*) AS total FROM warga'),
    ]);
    res.json({ success: true, data: { total: totalRows[0].total, menunggu: menungguRows[0].total, selesai: selesaiRows[0].total, ditolak: ditolakRows[0].total, totalWarga: wargaRows[0].total } });
  } catch (err) { next(err); }
});

// POST /api/admin/profil/ttd
router.post('/profil/ttd', handleTtdUpload, async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'File TTD wajib diupload' });
    const oldPath = req.user.ttd_image;
    const newPath = `/uploads/ttd/${req.file.filename}`;
    await db.query('UPDATE admin SET ttd_image = ?, updated_at = NOW() WHERE id = ?', [newPath, req.user.id]);
    if (oldPath && oldPath.startsWith('/uploads/ttd/')) fs.unlink(path.join(__dirname, '..', oldPath.replace(/^\/uploads\//, 'uploads/')), () => {});
    const [rows] = await db.query('SELECT id, nama_lengkap, email, jabatan, no_hp, ttd_image, aktif FROM admin WHERE id = ?', [req.user.id]);
    res.json({ success: true, message: 'TTD digital berhasil diupload', data: rows[0] });
  } catch (err) { next(err); }
});

// DELETE /api/admin/profil/ttd
router.delete('/profil/ttd', async (req, res, next) => {
  try {
    const oldPath = req.user.ttd_image;
    await db.query('UPDATE admin SET ttd_image = NULL, updated_at = NOW() WHERE id = ?', [req.user.id]);
    if (oldPath && oldPath.startsWith('/uploads/ttd/')) fs.unlink(path.join(__dirname, '..', oldPath.replace(/^\/uploads\//, 'uploads/')), () => {});
    const [rows] = await db.query('SELECT id, nama_lengkap, email, jabatan, no_hp, ttd_image, aktif FROM admin WHERE id = ?', [req.user.id]);
    res.json({ success: true, message: 'TTD digital dihapus', data: rows[0] });
  } catch (err) { next(err); }
});

// GET /api/admin/template
router.get('/template', async (_req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM template_surat ORDER BY id ASC');
    res.json({ success: true, data: rows.map(withTemplateMeta) });
  } catch (err) { next(err); }
});

// GET /api/admin/template/files
router.get('/template/files', async (_req, res, next) => {
  try {
    const dir = path.join(__dirname, '../templates');
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.html') && !f.startsWith('_'));
    res.json({ success: true, data: files });
  } catch (err) { next(err); }
});

// GET /api/admin/template/:id
router.get('/template/:id', async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM template_surat WHERE id = ? LIMIT 1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ success: false, message: 'Template tidak ditemukan' });
    res.json({ success: true, data: withTemplateMeta(rows[0]) });
  } catch (err) { next(err); }
});

// POST /api/admin/template
// Admin membuat jenis surat baru. Field form dan persyaratan tetap mengikuti kode surat di backend.
router.post('/template', async (req, res, next) => {
  try {
    const { kode, nama, deskripsi, file_template, aktif } = req.body;
    if (!kode || !nama || !file_template) return res.status(400).json({ success: false, message: 'Kode, nama, dan file_template wajib diisi' });
    const [exists] = await db.query('SELECT id FROM template_surat WHERE kode = ? LIMIT 1', [kode.toUpperCase()]);
    if (exists.length) return res.status(409).json({ success: false, message: 'Kode template sudah ada' });
    if (!fs.existsSync(path.join(__dirname, '../templates', file_template))) return res.status(400).json({ success: false, message: `File template '${file_template}' tidak ditemukan di folder templates/` });

    const [result] = await db.query(
      'INSERT INTO template_surat (kode, nama, deskripsi, file_template, aktif, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
      [kode.toUpperCase(), nama, deskripsi || null, file_template, aktif !== undefined ? aktif : true]
    );
    const [fresh] = await db.query('SELECT * FROM template_surat WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, message: 'Template dibuat', data: withTemplateMeta(fresh[0]) });
  } catch (err) { next(err); }
});

// PUT /api/admin/template/:id
router.put('/template/:id', async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM template_surat WHERE id = ? LIMIT 1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ success: false, message: 'Template tidak ditemukan' });

    const allowed = ['nama', 'deskripsi', 'aktif', 'file_template'];
    const update = {};
    for (const key of allowed) if (req.body[key] !== undefined) update[key] = req.body[key];
    if (update.file_template && !fs.existsSync(path.join(__dirname, '../templates', update.file_template))) return res.status(400).json({ success: false, message: `File template '${update.file_template}' tidak ditemukan` });

    const keys = Object.keys(update);
    if (keys.length) {
      await db.query(
        `UPDATE template_surat SET ${keys.map(k => `${k} = ?`).join(', ')}, updated_at = NOW() WHERE id = ?`,
        [...keys.map(k => update[k]), req.params.id]
      );
    }

    const [fresh] = await db.query('SELECT * FROM template_surat WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Template diperbarui', data: withTemplateMeta(fresh[0]) });
  } catch (err) { next(err); }
});

// PATCH /api/admin/template/:id/toggle
router.patch('/template/:id/toggle', async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM template_surat WHERE id = ? LIMIT 1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ success: false, message: 'Template tidak ditemukan' });
    const aktif = !rows[0].aktif;
    await db.query('UPDATE template_surat SET aktif = ?, updated_at = NOW() WHERE id = ?', [aktif, req.params.id]);
    res.json({ success: true, message: aktif ? 'Template diaktifkan' : 'Template dinonaktifkan', data: { ...rows[0], aktif } });
  } catch (err) { next(err); }
});

// DELETE /api/admin/template/:id
router.delete('/template/:id', async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM template_surat WHERE id = ? LIMIT 1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ success: false, message: 'Template tidak ditemukan' });
    const [used] = await db.query('SELECT COUNT(*) AS total FROM permohonan_surat WHERE template_id = ?', [req.params.id]);
    if (used[0].total > 0) return res.status(400).json({ success: false, message: `Template ini sudah dipakai oleh ${used[0].total} permohonan. Nonaktifkan saja, jangan dihapus.` });
    await db.query('DELETE FROM template_surat WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Template dihapus' });
  } catch (err) { next(err); }
});

module.exports = router;
