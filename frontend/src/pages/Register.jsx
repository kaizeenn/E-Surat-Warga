import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Icon from '../components/Icon';

const initial = {
  nama_lengkap: '', nik: '', email: '', password: '',
  tempat_lahir: '', tanggal_lahir: '', jenis_kelamin: '',
  alamat: '', agama: '', pekerjaan: '', no_hp: '',
};

export default function Register() {
  const { registerWarga } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);

  const update = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await registerWarga(form);
      toast.success('Pendaftaran berhasil');
      navigate('/warga');
    } catch (err) {
      const msg = err.response?.data?.message || 'Pendaftaran gagal';
      const errs = err.response?.data?.errors;
      if (errs?.length) {
        toast.error(`${msg}: ${errs.map(e => e.message).join(', ')}`);
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 bg-gradient-to-br from-slate-50 to-warga-50">
      <div className="max-w-2xl mx-auto">
        <div className="card">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-warga-100 rounded-full mb-3">
              <Icon name="user" className="w-7 h-7 text-warga-600" />
            </div>
            <h1 className="text-2xl font-bold">Daftar Akun Warga</h1>
            <p className="text-sm text-slate-500 mt-1">
              Lengkapi data untuk dapat mengajukan surat
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nama Lengkap *</label>
              <input className="input" required value={form.nama_lengkap}
                onChange={(e) => update('nama_lengkap', e.target.value)} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">NIK (16 digit) *</label>
                <input className="input" required maxLength={16} pattern="\d{16}"
                  value={form.nik}
                  onChange={(e) => update('nik', e.target.value.replace(/\D/g, ''))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">No. HP</label>
                <input className="input" value={form.no_hp}
                  onChange={(e) => update('no_hp', e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <input type="email" className="input" required value={form.email}
                  onChange={(e) => update('email', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password (min 6) *</label>
                <input type="password" className="input" required minLength={6}
                  value={form.password}
                  onChange={(e) => update('password', e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tempat Lahir</label>
                <input className="input" value={form.tempat_lahir}
                  onChange={(e) => update('tempat_lahir', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tanggal Lahir</label>
                <input type="date" className="input" value={form.tanggal_lahir}
                  onChange={(e) => update('tanggal_lahir', e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Jenis Kelamin</label>
                <select className="input" value={form.jenis_kelamin}
                  onChange={(e) => update('jenis_kelamin', e.target.value)}>
                  <option value="">— pilih —</option>
                  <option value="laki-laki">Laki-laki</option>
                  <option value="perempuan">Perempuan</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Agama</label>
                <input className="input" value={form.agama}
                  onChange={(e) => update('agama', e.target.value)} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Pekerjaan</label>
              <input className="input" value={form.pekerjaan}
                onChange={(e) => update('pekerjaan', e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Alamat Lengkap</label>
              <textarea className="input" rows="2" value={form.alamat}
                onChange={(e) => update('alamat', e.target.value)} />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Mendaftarkan...' : 'Daftar'}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-slate-500">
            Sudah punya akun?{' '}
            <Link to="/login" className="text-warga-600 hover:underline font-medium">
              Masuk
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
