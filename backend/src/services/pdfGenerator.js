/**
 * PDF Generator service.
 * Render template HTML -> PDF pakai Puppeteer.
 */
const fs = require('fs').promises;
const path = require('path');
const puppeteer = require('puppeteer');

const TEMPLATE_DIR = path.join(__dirname, '..', 'templates');
const OUTPUT_DIR = path.join(__dirname, '..', '..', 'uploads', 'surat');

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

/**
 * Generate PDF dari permohonan.
 * permohonan = instance PermohonanSurat (sudah include template + warga + admin).
 * Return: relative path PDF (mis. "/uploads/surat/surat-42-2025.pdf").
 */
async function generate(permohonan) {
  const { template, warga, admin } = permohonan;

  // data_tambahan kadang dikembalikan sebagai string JSON oleh MySQL
  let data_tambahan = permohonan.data_tambahan || {};
  if (typeof data_tambahan === 'string') {
    try { data_tambahan = JSON.parse(data_tambahan); } catch { data_tambahan = {}; }
  }

  // 1. Load template HTML
  const tplPath = path.join(TEMPLATE_DIR, template.file_template);
  let html = await fs.readFile(tplPath, 'utf8');

  // 2. Build variabel
  const vars = {
    // Identitas RT/RW (dari env)
    RT_NOMOR: process.env.RT_NOMOR || '003',
    RW_NOMOR: process.env.RW_NOMOR || '005',
    KELURAHAN: process.env.KELURAHAN || '-',
    KECAMATAN: process.env.KECAMATAN || '-',
    KOTA: process.env.KOTA || '-',
    PROVINSI: process.env.PROVINSI || '-',

    // Data surat
    NOMOR_SURAT: permohonan.nomor_surat || '-',
    TANGGAL_TERBIT: formatTanggalID(permohonan.tanggal_approve || new Date()),
    KEPERLUAN: permohonan.keperluan || '-',

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

    // Data tambahan dari template
    ...Object.fromEntries(
      Object.entries(data_tambahan).map(([k, v]) => [k.toUpperCase(), v])
    ),
  };

  // 3. Replace placeholder
  html = fillTemplate(html, vars);

  // 4. Generate PDF
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  const filename = `surat-${permohonan.id}-${Date.now()}.pdf`;
  const outPath = path.join(OUTPUT_DIR, filename);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
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
