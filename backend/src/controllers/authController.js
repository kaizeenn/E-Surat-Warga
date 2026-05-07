/**
 * Auth controller — register & login warga/admin.
 */
const { validationResult } = require('express-validator');
const { Warga, Admin } = require('../models');
const { signToken } = require('../utils/jwt');

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

// ===== REGISTER WARGA =====
exports.registerWarga = async (req, res, next) => {
  if (!handleValidation(req, res)) return;
  try {
    const {
      nama_lengkap, nik, email, password,
      tempat_lahir, tanggal_lahir, jenis_kelamin,
      alamat, agama, pekerjaan, no_hp,
    } = req.body;

    // Cek konflik
    const existsEmail = await Warga.findOne({ where: { email } });
    if (existsEmail) {
      return res.status(409).json({ success: false, message: 'Email sudah terdaftar' });
    }
    const existsNik = await Warga.findOne({ where: { nik } });
    if (existsNik) {
      return res.status(409).json({ success: false, message: 'NIK sudah terdaftar' });
    }

    const warga = await Warga.create({
      nama_lengkap, nik, email, password,
      tempat_lahir, tanggal_lahir, jenis_kelamin,
      alamat, agama, pekerjaan, no_hp,
    });

    const token = signToken({ id: warga.id, type: 'warga', email: warga.email });

    res.status(201).json({
      success: true,
      message: 'Registrasi berhasil',
      data: {
        token,
        user: {
          id: warga.id,
          type: 'warga',
          nama_lengkap: warga.nama_lengkap,
          email: warga.email,
          nik: warga.nik,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// ===== LOGIN WARGA =====
exports.loginWarga = async (req, res, next) => {
  if (!handleValidation(req, res)) return;
  try {
    const { email, password } = req.body;
    const warga = await Warga.scope('withPassword').findOne({ where: { email } });
    if (!warga || !(await warga.checkPassword(password))) {
      return res.status(401).json({ success: false, message: 'Email atau password salah' });
    }

    const token = signToken({ id: warga.id, type: 'warga', email: warga.email });
    res.json({
      success: true,
      message: 'Login berhasil',
      data: {
        token,
        user: {
          id: warga.id,
          type: 'warga',
          nama_lengkap: warga.nama_lengkap,
          email: warga.email,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// ===== LOGIN ADMIN =====
exports.loginAdmin = async (req, res, next) => {
  if (!handleValidation(req, res)) return;
  try {
    const { email, password } = req.body;
    const admin = await Admin.scope('withPassword').findOne({ where: { email } });
    if (!admin || !(await admin.checkPassword(password))) {
      return res.status(401).json({ success: false, message: 'Email atau password salah' });
    }
    if (!admin.aktif) {
      return res.status(403).json({ success: false, message: 'Akun admin nonaktif' });
    }

    const token = signToken({ id: admin.id, type: 'admin', email: admin.email });
    res.json({
      success: true,
      message: 'Login berhasil',
      data: {
        token,
        user: {
          id: admin.id,
          type: 'admin',
          nama_lengkap: admin.nama_lengkap,
          email: admin.email,
          jabatan: admin.jabatan,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// ===== GET CURRENT USER =====
exports.me = async (req, res) => {
  res.json({
    success: true,
    data: {
      type: req.userType,
      user: req.user,
    },
  });
};

// ===== UPDATE PROFIL =====
exports.updateProfil = async (req, res, next) => {
  try {
    const allowedWarga = [
      'nama_lengkap', 'tempat_lahir', 'tanggal_lahir', 'jenis_kelamin',
      'alamat', 'agama', 'pekerjaan', 'no_hp', 'password',
    ];
    const allowedAdmin = ['nama_lengkap', 'jabatan', 'no_hp', 'password'];
    const allowed = req.userType === 'warga' ? allowedWarga : allowedAdmin;

    const update = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined && req.body[key] !== '') {
        update[key] = req.body[key];
      }
    }

    await req.user.update(update);
    const fresh = req.userType === 'warga'
      ? await Warga.findByPk(req.user.id)
      : await Admin.findByPk(req.user.id);

    res.json({ success: true, message: 'Profil berhasil diupdate', data: fresh });
  } catch (err) {
    next(err);
  }
};
