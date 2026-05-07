/**
 * Express app — definisi middleware & routes.
 * Tidak listen di sini; itu tugas server.js.
 */
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const app = express();

// ===== Global middleware =====
// CORS: terima FRONTEND_URL (csv di .env) + default localhost dev port
const envOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
const allowedOrigins = new Set([
  ...envOrigins,
  'http://localhost:3001',
  'http://localhost:3003',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:3003',
]);
app.use(cors({
  origin: (origin, cb) => {
    // izinkan tanpa origin (curl/Postman) & yang ada di whitelist
    if (!origin || allowedOrigins.has(origin)) return cb(null, true);
    return cb(new Error(`CORS: origin ${origin} tidak diizinkan`));
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ===== Static: file PDF surat yang sudah di-generate =====
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ===== Health check =====
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Surat Warga API is running',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
  });
});

// ===== Routes =====
app.use('/api/auth', require('./routes/auth'));
app.use('/api/surat', require('./routes/surat'));
app.use('/api/admin', require('./routes/admin'));

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
