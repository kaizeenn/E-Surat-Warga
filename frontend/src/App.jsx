import { Routes, Route, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="card max-w-2xl w-full text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-warga-100 rounded-full mb-6">
          <svg className="w-10 h-10 text-warga-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold mb-2">Surat Warga RT/RW</h1>
        <p className="text-slate-600 mb-8">
          Generator surat keterangan otomatis. Ajukan dari rumah, terima PDF siap cetak.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link to="/login" className="btn-primary">
            🧑 Masuk sebagai Warga
          </Link>
          <Link to="/admin/login" className="btn-danger">
            👨‍💼 Masuk sebagai Admin
          </Link>
        </div>

        <p className="mt-6 text-sm text-slate-500">
          Belum punya akun?{' '}
          <Link to="/register" className="text-warga-600 hover:underline font-medium">
            Daftar di sini
          </Link>
        </p>
      </div>
    </div>
  );
}

function Placeholder({ title }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="card max-w-md w-full text-center">
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        <p className="text-slate-500 mb-4">Halaman ini akan dibuat di step berikutnya.</p>
        <Link to="/" className="btn-secondary">← Kembali</Link>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Placeholder title="Login Warga" />} />
        <Route path="/register" element={<Placeholder title="Register Warga" />} />
        <Route path="/admin/login" element={<Placeholder title="Login Admin" />} />
        <Route path="*" element={<Placeholder title="404 — Tidak Ditemukan" />} />
      </Routes>
    </>
  );
}
