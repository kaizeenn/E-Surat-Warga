import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api, { API_URL } from '../services/api';
import { useAuth } from '../context/AuthContext';
import WargaLayout from './warga/WargaLayout';
import AdminLayout from './admin/AdminLayout';
import Icon from '../components/Icon';

/**
 * Halaman kelola profil — dipakai oleh warga & admin.
 * Render layout sesuai role-nya.
 */
export default function Profil() {
  const { user, isAdmin, isWarga, refreshUser } = useAuth();

  const [tab, setTab] = useState('data');
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [ttdLoading, setTtdLoading] = useState(false);
  const [ttdImage, setTtdImage] = useState('');

  // Password form
  const [pw, setPw] = useState({ password: '', confirm: '' });
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    // Ambil data terbaru dari server
    api.get('/auth/me').then((res) => {
      const u = res.data.data.user;
      setForm({
        nama_lengkap: u.nama_lengkap || '',
        email: u.email || '',
        no_hp: u.no_hp || '',
        // warga only
        tempat_lahir: u.tempat_lahir || '',
        tanggal_lahir: u.tanggal_lahir ? String(u.tanggal_lahir).slice(0, 10) : '',
        jenis_kelamin: u.jenis_kelamin || '',
        alamat: u.alamat || '',
        agama: u.agama || '',
        pekerjaan: u.pekerjaan || '',
        nik: u.nik || '',
        // admin only
        jabatan: u.jabatan || '',
      });
      setTtdImage(u.ttd_image || '');
    });
  }, []);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submitProfil = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // jangan kirim email & nik (tidak boleh diubah)
      const payload = { ...form };
      delete payload.email;
      delete payload.nik;
      delete payload.password;

      await api.put('/auth/profil', payload);
      toast.success('Profil berhasil diperbarui');
      refreshUser?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal update profil');
    } finally {
      setLoading(false);
    }
  };

  const submitPassword = async (e) => {
    e.preventDefault();
    if (pw.password.length < 6) {
      toast.error('Password minimal 6 karakter');
      return;
    }
    if (pw.password !== pw.confirm) {
      toast.error('Konfirmasi password tidak cocok');
      return;
    }
    setPwLoading(true);
    try {
      await api.put('/auth/profil', { password: pw.password });
      toast.success('Password berhasil diubah');
      setPw({ password: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal ubah password');
    } finally {
      setPwLoading(false);
    }
  };

  const uploadTtd = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar');
      e.target.value = '';
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 2MB');
      e.target.value = '';
      return;
    }

    setTtdLoading(true);
    try {
      const fd = new FormData();
      fd.append('ttd', file);
      const res = await api.post('/admin/profil/ttd', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setTtdImage(res.data.data.ttd_image || '');
      await refreshUser?.();
      toast.success('TTD digital berhasil diupload');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal upload TTD');
    } finally {
      setTtdLoading(false);
      e.target.value = '';
    }
  };

  const deleteTtd = async () => {
    if (!confirm('Hapus TTD digital saat ini?')) return;
    setTtdLoading(true);
    try {
      await api.delete('/admin/profil/ttd');
      setTtdImage('');
      await refreshUser?.();
      toast.success('TTD digital dihapus');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal hapus TTD');
    } finally {
      setTtdLoading(false);
    }
  };

  const Wrapper = isAdmin ? AdminLayout : WargaLayout;
  const accent = isAdmin ? 'admin' : 'warga';
  const fileBase = API_URL.replace(/\/api\/?$/, '');

  const content = (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Kelola Profil</h1>
        <p className="text-slate-500">Perbarui data diri & password akun.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-lg p-1 mb-6 w-fit">
        <button
          onClick={() => setTab('data')}
          className={`px-4 py-1.5 text-sm rounded-md transition-colors ${
            tab === 'data' ? 'bg-white shadow-sm font-medium' : 'text-slate-600'
          }`}
        >
          <Icon name="user" className="w-4 h-4 inline mr-1.5" />
          Data Diri
        </button>
        <button
          onClick={() => setTab('password')}
          className={`px-4 py-1.5 text-sm rounded-md transition-colors ${
            tab === 'password' ? 'bg-white shadow-sm font-medium' : 'text-slate-600'
          }`}
        >
          <Icon name="shield" className="w-4 h-4 inline mr-1.5" />
          Password
        </button>
        {isAdmin && (
          <button
            onClick={() => setTab('ttd')}
            className={`px-4 py-1.5 text-sm rounded-md transition-colors ${
              tab === 'ttd' ? 'bg-white shadow-sm font-medium' : 'text-slate-600'
            }`}
          >
            <Icon name="document" className="w-4 h-4 inline mr-1.5" />
            TTD Digital
          </button>
        )}
      </div>

      {tab === 'data' && (
        <form onSubmit={submitProfil} className="card max-w-3xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Field readonly */}
            <Field label="Email" readOnly value={form.email || ''} hint="Email tidak dapat diubah" />
            {isWarga && (
              <Field label="NIK" readOnly value={form.nik || ''} hint="NIK tidak dapat diubah" />
            )}

            <Field label="Nama Lengkap" name="nama_lengkap" value={form.nama_lengkap} onChange={onChange} required />
            <Field label="No. HP" name="no_hp" value={form.no_hp} onChange={onChange} />

            {isAdmin && (
              <Field label="Jabatan" name="jabatan" value={form.jabatan} onChange={onChange} />
            )}

            {isWarga && (
              <>
                <Field label="Tempat Lahir" name="tempat_lahir" value={form.tempat_lahir} onChange={onChange} />
                <Field label="Tanggal Lahir" name="tanggal_lahir" type="date" value={form.tanggal_lahir} onChange={onChange} />

                <div>
                  <label className="block text-sm font-medium mb-1">Jenis Kelamin</label>
                  <select name="jenis_kelamin" value={form.jenis_kelamin} onChange={onChange} className="input">
                    <option value="">— Pilih —</option>
                    <option value="laki-laki">Laki-laki</option>
                    <option value="perempuan">Perempuan</option>
                  </select>
                </div>
                <Field label="Agama" name="agama" value={form.agama} onChange={onChange} />
                <Field label="Pekerjaan" name="pekerjaan" value={form.pekerjaan} onChange={onChange} />
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Alamat</label>
                  <textarea name="alamat" value={form.alamat} onChange={onChange} rows="2" className="input" />
                </div>
              </>
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <button type="submit" disabled={loading} className={`btn-${accent === 'warga' ? 'primary' : 'admin-primary'}`}>
              {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      )}

      {tab === 'password' && (
        <form onSubmit={submitPassword} className="card max-w-md">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Password Baru</label>
              <input
                type="password"
                value={pw.password}
                onChange={(e) => setPw({ ...pw, password: e.target.value })}
                className="input"
                placeholder="Min. 6 karakter"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Konfirmasi Password</label>
              <input
                type="password"
                value={pw.confirm}
                onChange={(e) => setPw({ ...pw, confirm: e.target.value })}
                className="input"
                placeholder="Ulangi password"
                required
              />
            </div>
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
              <Icon name="info" className="w-5 h-5 shrink-0 mt-0.5" />
              <span>Setelah ubah password, Anda tetap login. Gunakan password baru saat login berikutnya.</span>
            </div>
            <button type="submit" disabled={pwLoading} className={`btn-${accent === 'warga' ? 'primary' : 'admin-primary'} w-full`}>
              {pwLoading ? 'Menyimpan...' : 'Ubah Password'}
            </button>
          </div>
        </form>
      )}

      {isAdmin && tab === 'ttd' && (
        <div className="card max-w-2xl">
          <div className="mb-5">
            <h2 className="text-lg font-semibold">TTD Digital Admin</h2>
            <p className="text-sm text-slate-500 mt-1">
              Upload gambar tanda tangan agar otomatis tampil pada PDF surat yang Anda approve.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div>
              <label className="block text-sm font-medium mb-2">Preview TTD Saat Ini</label>
              <div className="h-40 border border-dashed border-slate-300 rounded-xl bg-slate-50 flex items-center justify-center overflow-hidden">
                {ttdImage ? (
                  <img
                    src={`${fileBase}${ttdImage}`}
                    alt="TTD Digital"
                    className="max-h-32 max-w-full object-contain"
                  />
                ) : (
                  <div className="text-center text-slate-400 text-sm px-4">
                    Belum ada TTD digital.
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Upload Gambar TTD</label>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={uploadTtd}
                  disabled={ttdLoading}
                  className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-admin-50 file:text-admin-700 hover:file:bg-admin-100"
                />
                <p className="text-xs text-slate-400 mt-2">
                  Format: PNG/JPG/WEBP. Maksimal 2MB. Disarankan gambar transparan dengan background putih/bening.
                </p>
              </div>

              <div className="flex gap-2">
                {ttdImage && (
                  <button
                    type="button"
                    onClick={deleteTtd}
                    disabled={ttdLoading}
                    className="btn-danger"
                  >
                    {ttdLoading ? 'Memproses...' : 'Hapus TTD'}
                  </button>
                )}
              </div>

              <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                <Icon name="info" className="w-5 h-5 shrink-0 mt-0.5" />
                <span>
                  TTD akan dipakai untuk surat baru setelah proses approve. PDF lama tidak berubah otomatis.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );

  return <Wrapper>{content}</Wrapper>;
}

function Field({ label, hint, readOnly, type = 'text', ...rest }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        type={type}
        readOnly={readOnly}
        className={`input ${readOnly ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : ''}`}
        {...rest}
      />
      {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}
