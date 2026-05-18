/**
 * Middleware autentikasi memakai model raw SQL.
 * Model tetap sederhana dan tidak memakai Sequelize/ORM.
 */
const { verifyToken } = require('../utils/jwt');
const { Warga, Admin } = require('../models');

// Mengambil token dari header Authorization.
// Format yang benar: Authorization: Bearer TOKEN_JWT
function extractToken(req) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return null;
  return header.slice(7);
}

// Setelah token dibaca, payload JWT berisi id dan type.
// type menentukan apakah user dicari di tabel warga atau admin.
async function findUserByToken(decoded) {
  if (decoded.type === 'warga') return Warga.findById(decoded.id);
  if (decoded.type === 'admin') return Admin.findById(decoded.id);
  return null;
}

// Middleware umum: hanya mengecek apakah user sudah login.
// Bisa dipakai untuk admin maupun warga.
async function auth(req, res, next) {
  try {
    const token = extractToken(req);
    if (!token) return res.status(401).json({ success: false, message: 'Token tidak ditemukan' });

    const decoded = verifyToken(token);
    const user = await findUserByToken(decoded);

    if (!user) return res.status(401).json({ success: false, message: 'User tidak ditemukan' });
    if (decoded.type === 'admin' && user.aktif === 0) {
      return res.status(403).json({ success: false, message: 'Akun admin nonaktif' });
    }

    // Simpan data user ke req supaya route berikutnya bisa memakai req.user.
    req.user = user;
    req.userType = decoded.type;
    req.tokenPayload = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired, silakan login ulang' });
    }
    return res.status(401).json({ success: false, message: 'Token tidak valid' });
  }
}

// Middleware khusus warga.
// Kalau token valid tapi typenya admin, akses tetap ditolak.
function authWarga(req, res, next) {
  auth(req, res, () => {
    if (req.userType !== 'warga') return res.status(403).json({ success: false, message: 'Akses khusus warga' });
    next();
  });
}

// Middleware khusus admin.
// Dipakai untuk endpoint review/approve/arsip/template.
function authAdmin(req, res, next) {
  auth(req, res, () => {
    if (req.userType !== 'admin') return res.status(403).json({ success: false, message: 'Akses khusus admin' });
    next();
  });
}

module.exports = { auth, authWarga, authAdmin };
