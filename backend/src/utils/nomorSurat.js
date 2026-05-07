/**
 * Helper format nomor surat: 001/DS-RT003/V/2025
 */
const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

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
  const urutanStr = String(urutan).padStart(3, '0');
  const kodeShort = kodeTemplate.split('_')[0].slice(0, 3); // DOMISILI -> DOM, TIDAK_MAMPU -> TID
  return `${urutanStr}/${kodeShort}-RT${rtNomor}/${toRoman(bulan)}/${tahun}`;
}

module.exports = { formatNomorSurat, toRoman };
