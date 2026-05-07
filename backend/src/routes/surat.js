/**
 * Routes warga: ajukan, lacak permohonan.
 */
const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/suratController');
const { authWarga, auth } = require('../middleware/auth');

// Daftar template (boleh diakses warga dan admin)
router.get('/template', auth, ctrl.listTemplate);
router.get('/template/:kode', auth, ctrl.detailTemplate);

// Khusus warga
router.post('/ajukan',
  authWarga,
  [
    body('templateKode').notEmpty().withMessage('templateKode wajib diisi'),
    body('keperluan').trim().notEmpty().withMessage('Keperluan wajib diisi'),
  ],
  ctrl.ajukan
);
router.get('/saya', authWarga, ctrl.permohonanSaya);
router.get('/saya/:id', authWarga, ctrl.detailPermohonan);

module.exports = router;
