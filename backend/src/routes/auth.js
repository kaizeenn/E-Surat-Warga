/**
 * Routes autentikasi.
 */
const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/authController');
const { auth } = require('../middleware/auth');

// Validators
const vRegister = [
  body('nama_lengkap').trim().notEmpty().withMessage('Nama lengkap wajib diisi'),
  body('nik').trim().isLength({ min: 16, max: 16 }).withMessage('NIK harus 16 digit')
    .isNumeric().withMessage('NIK harus angka'),
  body('email').trim().isEmail().withMessage('Email tidak valid'),
  body('password').isLength({ min: 6 }).withMessage('Password minimal 6 karakter'),
];
const vLogin = [
  body('email').trim().isEmail().withMessage('Email tidak valid'),
  body('password').notEmpty().withMessage('Password wajib diisi'),
];

// Login unified — sistem auto-detect role (admin atau warga)
router.post('/login', vLogin, ctrl.login);

// Warga
router.post('/warga/register', vRegister, ctrl.registerWarga);
router.post('/warga/login', vLogin, ctrl.loginWarga);  // legacy

// Admin
router.post('/admin/login', vLogin, ctrl.loginAdmin);  // legacy

// Shared (butuh JWT)
router.get('/me', auth, ctrl.me);
router.put('/profil', auth, ctrl.updateProfil);

module.exports = router;
