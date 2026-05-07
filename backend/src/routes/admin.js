/**
 * Routes admin: review, approve, tolak, arsip, statistik.
 */
const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ctrl = require('../controllers/adminController');
const { authAdmin } = require('../middleware/auth');

const ttdDir = path.join(__dirname, '..', '..', 'uploads', 'ttd');
fs.mkdirSync(ttdDir, { recursive: true });

const uploadTtd = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, ttdDir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase() || '.png';
      cb(null, `ttd-admin-${req.user.id}-${Date.now()}${ext}`);
    },
  }),
  limits: { fileSize: 2 * 1024 * 1024 }, // max 2MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('File TTD harus berupa PNG, JPG, JPEG, atau WEBP'));
    }
    cb(null, true);
  },
});

function handleTtdUpload(req, res, next) {
  uploadTtd.single('ttd')(req, res, (err) => {
    if (err) {
      const message = err.code === 'LIMIT_FILE_SIZE'
        ? 'Ukuran file TTD maksimal 2MB'
        : err.message;
      return res.status(400).json({ success: false, message });
    }
    next();
  });
}

router.use(authAdmin); // semua route di bawah wajib admin

router.get('/permohonan', ctrl.listPermohonan);
router.get('/permohonan/:id', ctrl.detailPermohonan);
router.patch('/permohonan/:id/approve', ctrl.approve);
router.patch('/permohonan/:id/tolak', ctrl.tolak);
router.get('/arsip', ctrl.arsip);
router.get('/stats', ctrl.stats);

// TTD Digital Admin
router.post('/profil/ttd', handleTtdUpload, ctrl.uploadTtd);
router.delete('/profil/ttd', ctrl.deleteTtd);

// Kelola Template Surat
router.get('/template', ctrl.listTemplate);
router.get('/template/files', ctrl.listFileTemplate);
router.get('/template/:id', ctrl.detailTemplate);
router.post('/template', ctrl.createTemplate);
router.put('/template/:id', ctrl.updateTemplate);
router.patch('/template/:id/toggle', ctrl.toggleTemplate);
router.delete('/template/:id', ctrl.deleteTemplate);

module.exports = router;
