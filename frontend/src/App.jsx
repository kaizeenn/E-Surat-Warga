import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

import WargaDashboard from './pages/warga/Dashboard';
import AjukanSurat from './pages/warga/AjukanSurat';
import WargaPermohonanList from './pages/warga/PermohonanList';
import WargaPermohonanDetail from './pages/warga/PermohonanDetail';

import AdminDashboard from './pages/admin/Dashboard';
import AdminPermohonanList from './pages/admin/PermohonanList';
import AdminPermohonanDetail from './pages/admin/PermohonanDetail';
import Arsip from './pages/admin/Arsip';
import TemplateList from './pages/admin/TemplateList';
import TemplateForm from './pages/admin/TemplateForm';

import Profil from './pages/Profil';

/**
 * Redirect cerdas dari "/" jika sudah login.
 */
function Root() {
  const { user, loading } = useAuth();
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Memuat...</div>;
  }
  if (user?.type === 'admin') return <Navigate to="/admin" replace />;
  if (user?.type === 'warga') return <Navigate to="/warga" replace />;
  return <Home />;
}

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Root />} />
        <Route path="/login" element={<Login variant="warga" />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/login" element={<Login variant="admin" />} />

        {/* Warga (protected) */}
        <Route path="/warga" element={<ProtectedRoute role="warga"><WargaDashboard /></ProtectedRoute>} />
        <Route path="/warga/ajukan" element={<ProtectedRoute role="warga"><AjukanSurat /></ProtectedRoute>} />
        <Route path="/warga/permohonan" element={<ProtectedRoute role="warga"><WargaPermohonanList /></ProtectedRoute>} />
        <Route path="/warga/permohonan/:id" element={<ProtectedRoute role="warga"><WargaPermohonanDetail /></ProtectedRoute>} />
        <Route path="/warga/profil" element={<ProtectedRoute role="warga"><Profil /></ProtectedRoute>} />

        {/* Admin (protected) */}
        <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/permohonan" element={<ProtectedRoute role="admin"><AdminPermohonanList /></ProtectedRoute>} />
        <Route path="/admin/permohonan/:id" element={<ProtectedRoute role="admin"><AdminPermohonanDetail /></ProtectedRoute>} />
        <Route path="/admin/arsip" element={<ProtectedRoute role="admin"><Arsip /></ProtectedRoute>} />
        <Route path="/admin/template" element={<ProtectedRoute role="admin"><TemplateList /></ProtectedRoute>} />
        <Route path="/admin/template/baru" element={<ProtectedRoute role="admin"><TemplateForm /></ProtectedRoute>} />
        <Route path="/admin/template/:id/edit" element={<ProtectedRoute role="admin"><TemplateForm /></ProtectedRoute>} />
        <Route path="/admin/profil" element={<ProtectedRoute role="admin"><Profil /></ProtectedRoute>} />

        {/* 404 */}
        <Route path="*" element={
          <div className="min-h-screen flex items-center justify-center text-slate-500">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-2">404</h1>
              <p>Halaman tidak ditemukan</p>
            </div>
          </div>
        } />
      </Routes>
    </AuthProvider>
  );
}
