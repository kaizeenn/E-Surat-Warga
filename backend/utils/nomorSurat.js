/**
 * Helper format nomor surat: 001/DS-RT003/V/2025
 */
// Daftar angka romawi untuk bulan.
// Index 1 = Januari, index 12 = Desember.
const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

// Mengubah angka bulan menjadi romawi.
function toRoman(month) {
  return ROMAN[month] || '';
}

/**
 * Bangun string nomor surat dari komponen.
 *
 * @param {object} opts
 * @param {number} opts.urutan       - nomor urut (1, 2, ...)
 * @param {string} opts.kodeTemplate - kode template (DOMISILI, USAHA, dst)
 * @param {string} opts.rtNomor      - nomor RT (003)
 * @param {number} opts.bulan        - 1-12
 * @param {number} opts.tahun        - 2025
 */
function formatNomorSurat({ urutan, kodeTemplate, rtNomor, bulan, tahun }) {
  // Nomor urut dibuat 3 digit, contoh 1 menjadi 001.
  const urutanStr = String(urutan).padStart(3, '0');
  // Ambil 3 huruf pertama dari kode template.
  // DOMISILI -> DOM, TIDAK_MAMPU -> TID, USAHA -> USA.
  const kodeShort = kodeTemplate.split('_')[0].slice(0, 3);
  return `${urutanStr}/${kodeShort}-RT${rtNomor}/${toRoman(bulan)}/${tahun}`;
}

module.exports = { formatNomorSurat, toRoman };
