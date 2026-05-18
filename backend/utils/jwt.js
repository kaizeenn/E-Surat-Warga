/**
 * Helper sign & verify JWT.
 * Token payload: { id, type, email }
 * type = 'warga' | 'admin'
 */
const jwt = require('jsonwebtoken');

// SECRET adalah kunci rahasia untuk membuat dan memverifikasi token.
// Nilainya wajib ada di file .env.
const SECRET = process.env.JWT_SECRET;

// Durasi token berlaku. Default 7 hari jika tidak diatur di .env.
const EXPIRES = process.env.JWT_EXPIRES_IN || '7d';

if (!SECRET) {
  throw new Error('JWT_SECRET tidak diset di .env');
}

// Membuat token baru saat user berhasil login/register.
function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES });
}

// Mengecek apakah token valid dan belum expired.
function verifyToken(token) {
  return jwt.verify(token, SECRET);
}

module.exports = { signToken, verifyToken };
