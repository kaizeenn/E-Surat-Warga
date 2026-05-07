/**
 * Middleware autentikasi.
 *
 *   auth         -> wajib login (warga atau admin)
 *   authWarga    -> wajib login sebagai warga
 *   authAdmin    -> wajib login sebagai admin
 */
const { verifyToken } = require('../utils/jwt');
const { Warga, Admin } = require('../models');

/**
 * Ekstrak token dari header `Authorization: Bearer <token>`.
 */
function extractToken(req) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return null;
  return header.slice(7);
}

/**
 * Generic auth: terima warga & admin.
 * Hasil: req.user = instance model, req.userType = 'warga' | 'admin'
 */
async function auth(req, res, next) {
  try {
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({ success: false, message: 'Token tidak ditemukan' });
    }

    const decoded = verifyToken(token);
    let user;
    if (decoded.type === 'warga') {
      user = await Warga.findByPk(decoded.id);
    } else if (decoded.type === 'admin') {
      user = await Admin.findByPk(decoded.id);
    } else {
      return res.status(401).json({ success: false, message: 'Tipe token tidak valid' });
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'User tidak ditemukan' });
    }

    if (decoded.type === 'admin' && user.aktif === false) {
      return res.status(403).json({ success: false, message: 'Akun admin nonaktif' });
    }

    req.user = user;
    req.userType = decoded.type;
    req.tokenPayload = decoded; // simpan payload supaya endpoint /session bisa baca exp/iat
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired, silakan login ulang' });
    }
    return res.status(401).json({ success: false, message: 'Token tidak valid' });
  }
}

function authWarga(req, res, next) {
  auth(req, res, () => {
    if (req.userType !== 'warga') {
      return res.status(403).json({ success: false, message: 'Akses khusus warga' });
    }
    next();
  });
}

function authAdmin(req, res, next) {
  auth(req, res, () => {
    if (req.userType !== 'admin') {
      return res.status(403).json({ success: false, message: 'Akses khusus admin' });
    }
    next();
  });
}

module.exports = { auth, authWarga, authAdmin };
