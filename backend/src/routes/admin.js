/**
 * Routes admin: review, approve, tolak, arsip, statistik.
 */
const router = require('express').Router();
const ctrl = require('../controllers/adminController');
const { authAdmin } = require('../middleware/auth');

router.use(authAdmin); // semua route di bawah wajib admin

router.get('/permohonan', ctrl.listPermohonan);
router.get('/permohonan/:id', ctrl.detailPermohonan);
router.patch('/permohonan/:id/approve', ctrl.approve);
router.patch('/permohonan/:id/tolak', ctrl.tolak);
router.get('/arsip', ctrl.arsip);
router.get('/stats', ctrl.stats);

module.exports = router;
