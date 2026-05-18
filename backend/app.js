/**
 * Express app — definisi middleware & routes.
 * Tidak listen di sini; itu tugas server.js.
 */
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const app = express();

// File ini hanya mengatur konfigurasi Express.
// Proses menjalankan server/listen ada di server.js.

// ===== Global middleware =====
// CORS: terima FRONTEND_URL (csv di .env) + default localhost dev port
const envOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
const allowedOrigins = new Set([
  ...envOrigins,
  'http://localhost:3001',
  'http://127.0.0.1:3001',
]);
app.use(cors({
  origin: (origin, cb) => {
    // izinkan tanpa origin (curl/Postman) & yang ada di whitelist
    if (!origin || allowedOrigins.has(origin)) return cb(null, true);
    return cb(new Error(`CORS: origin ${origin} tidak diizinkan`));
  },
  credentials: true,
}));
// Supaya backend bisa membaca body JSON dari frontend.
app.use(express.json({ limit: '10mb' }));

// Supaya backend juga bisa membaca form-urlencoded bila diperlukan.
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ===== Static: file upload dan PDF =====
// Semua file di folder uploads bisa diakses lewat URL /uploads/...
// Contoh: /uploads/surat/surat-1.pdf
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ===== Health check =====
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'e-Surat Desa API is running',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
  });
});

// ===== Routes =====
// Setiap file route berisi endpoint + logic query SQL langsung.
app.use('/api/auth', require('./routes/auth'));   // login, register, profil
app.use('/api/surat', require('./routes/surat')); // fitur warga: template, ajukan, riwayat
app.use('/api/admin', require('./routes/admin')); // fitur admin: review, approve, arsip, template

// ===== 404 handler =====
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan`,
  });
});

// ===== Global error handler =====
app.use((err, req, res, next) => {
  console.error('🔥 Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

module.exports = app;
