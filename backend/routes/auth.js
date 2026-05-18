/**
 * Routes autentikasi.
 * Logic endpoint tetap di route, sedangkan query database dipindah ke folder models.
 */
const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const { signToken } = require('../utils/jwt');
const { auth } = require('../middleware/auth');
const { Warga, Admin } = require('../models');

// Validasi input registrasi warga.
// Kalau input tidak sesuai, request ditolak sebelum masuk query database.
const vRegister = [
  body('nama_lengkap').trim().notEmpty().withMessage('Nama lengkap wajib diisi'),
  body('nik').trim().isLength({ min: 16, max: 16 }).withMessage('NIK harus 16 digit').isNumeric().withMessage('NIK harus angka'),
  body('email').trim().isEmail().withMessage('Email tidak valid'),
  body('password').isLength({ min: 6 }).withMessage('Password minimal 6 karakter'),
];

// Validasi input login.
const vLogin = [
  body('email').trim().isEmail().withMessage('Email tidak valid'),
  body('password').notEmpty().withMessage('Password wajib diisi'),
];

// Helper untuk mengambil hasil validasi express-validator.
// Return false berarti proses route harus dihentikan.
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

// Data warga yang dikirim balik ke frontend.
// Password sengaja tidak dimasukkan demi keamanan.
function wargaPayload(warga) {
  return { id: warga.id, type: 'warga', nama_lengkap: warga.nama_lengkap, email: warga.email, nik: warga.nik };
}

// Data admin yang dikirim balik ke frontend.
function adminPayload(admin) {
  return { id: admin.id, type: 'admin', nama_lengkap: admin.nama_lengkap, email: admin.email, jabatan: admin.jabatan };
}

// Cek login warga: cari email, lalu cocokkan password hash dengan bcrypt.
async function loginWargaByEmail(email, password) {
  const warga = await Warga.findByEmail(email);
  if (!warga || !(await bcrypt.compare(password, warga.password))) return null;
  return warga;
}

// Cek login admin: admin berada di tabel berbeda dari warga.
async function loginAdminByEmail(email, password) {
  const admin = await Admin.findByEmail(email);
  if (!admin || !(await bcrypt.compare(password, admin.password))) return null;
  return admin;
}

// Login terpadu.
// Sistem cek tabel admin dulu, lalu cek tabel warga.
router.post('/login', vLogin, async (req, res, next) => {
  if (!handleValidation(req, res)) return;
  try {
    const { email, password } = req.body;

    const admin = await loginAdminByEmail(email, password);
    if (admin) {
      if (!admin.aktif) return res.status(403).json({ success: false, message: 'Akun admin nonaktif' });
      const token = signToken({ id: admin.id, type: 'admin', email: admin.email });
      return res.json({ success: true, message: 'Login berhasil', data: { token, user: adminPayload(admin) } });
    }

    const warga = await loginWargaByEmail(email, password);
    if (warga) {
      const token = signToken({ id: warga.id, type: 'warga', email: warga.email });
      return res.json({ success: true, message: 'Login berhasil', data: { token, user: wargaPayload(warga) } });
    }

    return res.status(401).json({ success: false, message: 'Email atau password salah' });
  } catch (err) {
    next(err);
  }
});

// Registrasi warga baru.
// Admin tidak punya register publik; admin dibuat dari database/dashboard.
router.post('/warga/register', vRegister, async (req, res, next) => {
  if (!handleValidation(req, res)) return;
  try {
    const {
      nama_lengkap, nik, email, password,
      tempat_lahir, tanggal_lahir, jenis_kelamin,
      alamat, agama, pekerjaan, no_hp,
    } = req.body;

    const emailRows = await Warga.findByEmail(email);
    if (emailRows) return res.status(409).json({ success: false, message: 'Email sudah terdaftar' });

    const nikRows = await Warga.findByNik(nik);
    if (nikRows) return res.status(409).json({ success: false, message: 'NIK sudah terdaftar' });

    // Password tidak disimpan mentah.
    // bcrypt.hash mengubah password menjadi hash yang aman.
    const hashed = await bcrypt.hash(password, 10);
    const warga = await Warga.create({ nama_lengkap, nik, email, password: hashed, tempat_lahir, tanggal_lahir, jenis_kelamin, alamat, agama, pekerjaan, no_hp });
    const token = signToken({ id: warga.id, type: 'warga', email });
    res.status(201).json({ success: true, message: 'Registrasi berhasil', data: { token, user: wargaPayload(warga) } });
  } catch (err) {
    next(err);
  }
});

// Endpoint login lama khusus warga.
// Tetap disediakan agar frontend/API lama masih kompatibel.
router.post('/warga/login', vLogin, async (req, res, next) => {
  if (!handleValidation(req, res)) return;
  try {
    const warga = await loginWargaByEmail(req.body.email, req.body.password);
    if (!warga) return res.status(401).json({ success: false, message: 'Email atau password salah' });
    const token = signToken({ id: warga.id, type: 'warga', email: warga.email });
    res.json({ success: true, message: 'Login berhasil', data: { token, user: wargaPayload(warga) } });
  } catch (err) {
    next(err);
  }
});

// Endpoint login lama khusus admin.
router.post('/admin/login', vLogin, async (req, res, next) => {
  if (!handleValidation(req, res)) return;
  try {
    const admin = await loginAdminByEmail(req.body.email, req.body.password);
    if (!admin) return res.status(401).json({ success: false, message: 'Email atau password salah' });
    if (!admin.aktif) return res.status(403).json({ success: false, message: 'Akun admin nonaktif' });
    const token = signToken({ id: admin.id, type: 'admin', email: admin.email });
    res.json({ success: true, message: 'Login berhasil', data: { token, user: adminPayload(admin) } });
  } catch (err) {
    next(err);
  }
});

// Mengambil profil user yang sedang login berdasarkan token.
router.get('/me', auth, async (req, res) => {
  res.json({ success: true, data: { type: req.userType, user: req.user } });
});

// Mengecek masa berlaku token/session.
// Berguna untuk frontend mengetahui token masih aktif berapa lama.
router.get('/session', auth, async (req, res) => {
  const payload = req.tokenPayload || {};
  const nowSec = Math.floor(Date.now() / 1000);
  const exp = payload.exp || null;
  const remainingSec = exp ? Math.max(0, exp - nowSec) : null;
  res.json({
    success: true,
    data: {
      type: req.userType,
      user_id: req.user?.id,
      iat: payload.iat || null,
      exp,
      now: nowSec,
      remaining_sec: remainingSec,
      remaining_ms: remainingSec !== null ? remainingSec * 1000 : null,
    },
  });
});

// Update profil sendiri.
// Field yang boleh diubah dibedakan antara warga dan admin.
router.put('/profil', auth, async (req, res, next) => {
  try {
    const allowedWarga = ['nama_lengkap', 'tempat_lahir', 'tanggal_lahir', 'jenis_kelamin', 'alamat', 'agama', 'pekerjaan', 'no_hp', 'password'];
    const allowedAdmin = ['nama_lengkap', 'jabatan', 'no_hp', 'password'];
    const allowed = req.userType === 'warga' ? allowedWarga : allowedAdmin;
    const update = {};

    for (const key of allowed) {
      if (req.body[key] !== undefined && req.body[key] !== '') {
        update[key] = key === 'password' ? await bcrypt.hash(req.body[key], 10) : req.body[key];
      }
    }

    const updated = req.userType === 'warga'
      ? await Warga.updateProfil(req.user.id, update)
      : await Admin.updateProfil(req.user.id, update);
    res.json({ success: true, message: 'Profil berhasil diupdate', data: updated });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
