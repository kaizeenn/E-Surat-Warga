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

// Warga
router.post('/warga/register', vRegister, ctrl.registerWarga);
router.post('/warga/login', vLogin, ctrl.loginWarga);

// Admin
router.post('/admin/login', vLogin, ctrl.loginAdmin);

// Shared (butuh JWT)
router.get('/me', auth, ctrl.me);
router.put('/profil', auth, ctrl.updateProfil);

module.exports = router;
