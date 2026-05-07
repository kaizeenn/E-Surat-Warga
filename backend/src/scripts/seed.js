/**
 * Seed script — isi data awal:
 * 1. Akun admin default (atmin@rtrw.local / atmin123)
 * 2. Tiga template surat default: DOMISILI, TIDAK_MAMPU, USAHA
 *
 * Usage: node src/scripts/seed.js
 *
 * Idempotent: aman dipanggil berkali-kali (pakai findOrCreate).
 */
require('dotenv').config();

const { sequelize, Admin, TemplateSurat } = require('../models');

const ADMIN_DEFAULT = {
  nama_lengkap: 'Atmin Sistem',
  email: 'atmin@rtrw.local',
  password: 'atmin123',
  jabatan: 'Ketua RT',
  no_hp: '081234567890',
  aktif: true,
};

const TEMPLATES = [
  {
    kode: 'DOMISILI',
    nama: 'Surat Keterangan Domisili',
    deskripsi: 'Bukti tempat tinggal warga di wilayah RT/RW.',
    file_template: 'domisili.html',
    fields: [
      { name: 'tujuanInstansi', label: 'Tujuan Instansi/Pihak', type: 'text', required: true },
    ],
    aktif: true,
  },
  {
    kode: 'TIDAK_MAMPU',
    nama: 'Surat Keterangan Tidak Mampu',
    deskripsi: 'Untuk keringanan biaya pendidikan, kesehatan, atau bantuan sosial.',
    file_template: 'tidak_mampu.html',
    fields: [
      { name: 'tujuanPenggunaan', label: 'Tujuan Penggunaan Surat', type: 'text', required: true },
      { name: 'penghasilanPerBulan', label: 'Penghasilan per Bulan (Rp)', type: 'number', required: false },
    ],
    aktif: true,
  },
  {
    kode: 'USAHA',
    nama: 'Surat Keterangan Usaha',
    deskripsi: 'Bukti kepemilikan usaha warga di wilayah RT/RW.',
    file_template: 'usaha.html',
    fields: [
      { name: 'namaUsaha', label: 'Nama Usaha', type: 'text', required: true },
      { name: 'jenisUsaha', label: 'Jenis Usaha', type: 'text', required: true },
      { name: 'alamatUsaha', label: 'Alamat Usaha', type: 'text', required: true },
      { name: 'tahunBerdiri', label: 'Tahun Berdiri', type: 'number', required: false },
    ],
    aktif: true,
  },
];

(async () => {
  try {
    console.log('[seed] Connecting...');
    await sequelize.authenticate();

    // ===== Admin =====
    console.log('[seed] Seeding admin...');
    const [admin, adminCreated] = await Admin.findOrCreate({
      where: { email: ADMIN_DEFAULT.email },
      defaults: ADMIN_DEFAULT,
    });
    if (adminCreated) {
      console.log(`  [+] Created admin: ${admin.email}`);
    } else {
      console.log(`  [=] Admin exists:  ${admin.email}`);
    }

    // ===== Template Surat =====
    console.log('[seed] Seeding template surat...');
    for (const tpl of TEMPLATES) {
      const [row, created] = await TemplateSurat.findOrCreate({
        where: { kode: tpl.kode },
        defaults: tpl,
      });
      console.log(`  [${created ? '+' : '='}] ${row.kode.padEnd(15)} ${row.nama}`);
    }

    console.log('');
    console.log('[seed] Done.');
    console.log('');
    console.log('Login credentials:');
    console.log(`  Email    : ${ADMIN_DEFAULT.email}`);
    console.log(`  Password : ${ADMIN_DEFAULT.password}`);
    console.log('');

    process.exit(0);
  } catch (err) {
    console.error('[seed] Failed:', err);
    process.exit(1);
  }
})();
