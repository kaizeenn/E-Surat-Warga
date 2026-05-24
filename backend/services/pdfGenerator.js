/**
 * PDF Generator service.
 * Render template HTML -> PDF pakai Puppeteer.
 */
const fs = require('fs').promises;
const path = require('path');
const puppeteer = require('puppeteer');

// Folder asal template HTML surat.
const TEMPLATE_DIR = path.join(__dirname, '..', 'templates');

// Folder output PDF yang berhasil dibuat.
const OUTPUT_DIR = path.join(__dirname, '..', 'uploads', 'surat');

/**
 * Format tanggal Indonesia: "17 Agustus 2025"
 */
const BULAN_ID = ['Januari','Februari','Maret','April','Mei','Juni',
                  'Juli','Agustus','September','Oktober','November','Desember'];

function formatTanggalID(date) {
  if (!date) return '';
  const d = new Date(date);
  return `${d.getDate()} ${BULAN_ID[d.getMonth()]} ${d.getFullYear()}`;
}

// Menghitung umur warga dari tanggal lahir.
function hitungUmur(tanggalLahir) {
  if (!tanggalLahir) return '';
  const tl = new Date(tanggalLahir);
  const now = new Date();
  let umur = now.getFullYear() - tl.getFullYear();
  const m = now.getMonth() - tl.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < tl.getDate())) umur--;
  return umur;
}

/**
 * Replace placeholder {{KEY}} di template HTML.
 */
function fillTemplate(html, vars) {
  return html.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    return vars[key] !== undefined && vars[key] !== null ? String(vars[key]) : '';
  });
}

// Mengubah file TTD admin menjadi base64 agar bisa ditanam langsung ke HTML/PDF.
// Jika TTD belum ada atau file tidak terbaca, tampilkan ruang kosong.
async function buildTtdImageHtml(ttdPath) {
  if (!ttdPath || !ttdPath.startsWith('/uploads/ttd/')) return '<div class="ttd-space"></div>';
  try {
    const fullPath = path.join(__dirname, '..', ttdPath.replace(/^\/uploads\//, 'uploads/'));
    const buffer = await fs.readFile(fullPath);
    const ext = path.extname(fullPath).slice(1).toLowerCase();
    const mime = ext === 'jpg' ? 'jpeg' : ext;
    return `<img class="ttd-img" src="data:image/${mime};base64,${buffer.toString('base64')}" alt="TTD Digital">`;
  } catch {
    return '<div class="ttd-space"></div>';
  }
}

/**
 * Generate PDF dari permohonan.
 * permohonan = instance PermohonanSurat (sudah include template + warga + admin).
 * Return: relative path PDF (mis. "/uploads/surat/surat-42-2025.pdf").
 */
// Fungsi utama untuk membuat PDF surat.
// Dipanggil saat admin approve permohonan.
async function generate(permohonan) {
  // Data template, warga, dan admin dikirim dari routes/admin.js.
  const { template, warga, admin } = permohonan;

  // data_form berisi jawaban form dinamis (JSON)
  let data_form = permohonan.data_form || permohonan.data_tambahan || {};
  if (typeof data_form === 'string') {
    try { data_form = JSON.parse(data_form); } catch { data_form = {}; }
  }

  // 1. Load template HTML (universal)
  const tplPath = path.join(TEMPLATE_DIR, template.file_template || 'universal.html');
  let html = await fs.readFile(tplPath, 'utf8');
  const ttdImageHtml = await buildTtdImageHtml(admin?.ttd_image);

  // 2. Generate baris tambahan dari fields template
  let fields = template.fields || [];
  if (typeof fields === 'string') {
    try { fields = JSON.parse(fields); } catch { fields = []; }
  }
  const normalizedFields = Array.isArray(fields)
    ? fields.map((f) => ({ ...f, name: f.name || f.key })).filter((f) => f.name)
    : [];

  const extraRows = normalizedFields.map((field) => {
    const value = data_form?.[field.name] ?? '-';
    return `<tr><td class="label">${field.label || field.name}</td><td class="sep">:</td><td>${value}</td></tr>`;
  }).join('');

  // 3. Build variabel (tanpa kalimat penutup dulu)
  const baseVars = {
    // Identitas RT/RW (dari env)
    RT_NOMOR: process.env.RT_NOMOR || '02',
    RW_NOMOR: process.env.RW_NOMOR || '03',
    KELURAHAN: process.env.KELURAHAN || 'Saronggi',
    KECAMATAN: process.env.KECAMATAN || 'Saronggi',
    KOTA: process.env.KOTA || 'Sumenep',
    PROVINSI: process.env.PROVINSI || 'Jawa Timur',

    // Data surat
    NAMA_SURAT: (template.nama || 'Surat Keterangan').toUpperCase(),
    NOMOR_SURAT: permohonan.nomor_surat || '-',
    TANGGAL_TERBIT: formatTanggalID(permohonan.tanggal_approve || new Date()),
    KEPERLUAN: permohonan.keperluan || '-',
    EXTRA_ROWS: extraRows,

    // Data warga
    NAMA: warga.nama_lengkap || '-',
    NIK: warga.nik || '-',
    TEMPAT_LAHIR: warga.tempat_lahir || '-',
    TANGGAL_LAHIR: formatTanggalID(warga.tanggal_lahir),
    TTL: `${warga.tempat_lahir || '-'}, ${formatTanggalID(warga.tanggal_lahir)}`,
    UMUR: hitungUmur(warga.tanggal_lahir),
    JENIS_KELAMIN: warga.jenis_kelamin === 'laki-laki' ? 'Laki-laki' : (warga.jenis_kelamin === 'perempuan' ? 'Perempuan' : '-'),
    AGAMA: warga.agama || '-',
    PEKERJAAN: warga.pekerjaan || '-',
    ALAMAT: warga.alamat || '-',
    NO_HP: warga.no_hp || '-',

    // Data admin (penandatangan)
    ADMIN_NAMA: admin?.nama_lengkap || '-',
    ADMIN_JABATAN: admin?.jabatan || '-',
    ADMIN_TTD_IMG: ttdImageHtml,

    // Data tambahan dari template (data_form)
    ...Object.fromEntries(
      Object.entries(data_form).map(([k, v]) => [String(k).toUpperCase(), v])
    ),
  };

  const defaultPenutup = `Adalah benar warga RT ${process.env.RT_NOMOR || ''} RW ${process.env.RW_NOMOR || ''} Desa ${process.env.KELURAHAN || ''}, Kecamatan ${process.env.KECAMATAN || ''}, Kabupaten ${process.env.KOTA || ''} yang berdomisili di alamat tersebut di atas. Surat ini dibuat untuk keperluan ${permohonan.keperluan || '-'} .`;
  const penutupTemplate = template.kalimat_penutup || defaultPenutup;
  const penutupFinal = fillTemplate(penutupTemplate, baseVars);

  const vars = {
    ...baseVars,
    KALIMAT_PENUTUP: penutupFinal,
  };

  // 3. Replace placeholder
  html = fillTemplate(html, vars);

  // 4. Generate PDF
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  const filename = `surat-${permohonan.id}-${Date.now()}.pdf`;
  const outPath = path.join(OUTPUT_DIR, filename);

  // Puppeteer menjalankan browser headless untuk render HTML menjadi PDF.
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  try {
    // Masukkan HTML hasil replace ke halaman browser virtual.
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    // Cetak halaman browser virtual menjadi file PDF.
    await page.pdf({
      path: outPath,
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' },
    });
  } finally {
    await browser.close();
  }

  // Return relative path (dipakai untuk akses publik via /uploads/...)
  return `/uploads/surat/${filename}`;
}

module.exports = { generate, formatTanggalID, hitungUmur };
