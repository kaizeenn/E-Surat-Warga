import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api, { API_URL } from '../services/api';
import { useAuth } from '../context/AuthContext';
import WargaLayout from './warga/WargaLayout';
import AdminLayout from './admin/AdminLayout';
import Icon from '../components/Icon';

export default function Profil() {
  const { user, isAdmin, isWarga, refreshUser } = useAuth();

  const [tab, setTab] = useState('data');
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [ttdLoading, setTtdLoading] = useState(false);
  const [ttdImage, setTtdImage] = useState('');
  const [pw, setPw] = useState({ password: '', confirm: '' });
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    api.get('/auth/me').then((res) => {
      const u = res.data.data.user;
      setForm({
        nama_lengkap: u.nama_lengkap || '',
        email: u.email || '',
        no_hp: u.no_hp || '',
        tempat_lahir: u.tempat_lahir || '',
        tanggal_lahir: u.tanggal_lahir ? String(u.tanggal_lahir).slice(0, 10) : '',
        jenis_kelamin: u.jenis_kelamin || '',
        alamat: u.alamat || '',
        agama: u.agama || '',
        pekerjaan: u.pekerjaan || '',
        nik: u.nik || '',
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
  const accentText = isAdmin ? 'text-admin-700' : 'text-warga-700';
  const accentBg = isAdmin ? 'bg-admin-50' : 'bg-warga-50';
  const accentSolid = isAdmin ? 'bg-admin-600' : 'bg-warga-600';
  const primaryBtn = isAdmin ? 'btn-admin-primary' : 'btn-primary';
  const fileBase = API_URL.replace(/\/api\/?$/, '');

  const tabs = [
    { key: 'data', label: 'Data Diri', icon: 'user' },
    { key: 'password', label: 'Password', icon: 'shield' },
    ...(isAdmin ? [{ key: 'ttd', label: 'TTD Digital', icon: 'signature' }] : []),
  ];

  const content = (
    <>
      <section className="page-hero relative overflow-hidden">
        <div className={`absolute right-0 top-0 h-40 w-40 rounded-full blur-3xl ${isAdmin ? 'bg-admin-100' : 'bg-warga-100'}`} />
        <div className="relative grid grid-cols-1 gap-5 lg:grid-cols-3 lg:items-center">
          <div className="lg:col-span-2">
            <p className="page-kicker">Pengaturan Akun</p>
            <h1 className="page-title">Kelola Profil</h1>
            <p className="page-subtitle">Perbarui data diri, keamanan akun, dan informasi yang digunakan dalam layanan e-Surat Desa.</p>
          </div>
          <div className="rounded-3xl border border-white/70 bg-white/75 p-4 shadow-sm backdrop-blur">
            <div className="flex items-center gap-3">
              <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${accentSolid} text-xl font-black text-white shadow-lg`}>
                {(user?.nama_lengkap || user?.email || '?').slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate font-black text-slate-900">{user?.nama_lengkap || 'Pengguna'}</p>
                <p className="truncate text-sm text-slate-500">{user?.email}</p>
                <span className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-bold ${accentBg} ${accentText}`}>
                  {isAdmin ? 'Admin Desa' : 'Warga'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <aside className="lg:col-span-1">
          <div className="card p-3">
            <div className="space-y-2">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold transition-all ${
                    tab === t.key
                      ? `${accentBg} ${accentText} shadow-sm`
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon name={t.icon} className="h-5 w-5" />
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 card bg-slate-950 text-white">
            <Icon name="info" className="h-6 w-6 text-white/70" />
            <h3 className="mt-3 font-black">Info Profil</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              Email dan NIK digunakan sebagai identitas akun, sehingga tidak bisa diubah dari halaman ini.
            </p>
          </div>
        </aside>

        <main className="lg:col-span-3">
          {tab === 'data' && (
            <form onSubmit={submitProfil} className="card">
              <SectionHeader
                icon="user"
                title="Data Diri"
                subtitle="Lengkapi profil agar data pemohon pada surat otomatis lebih akurat."
                accentBg={accentBg}
                accentText={accentText}
              />

              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Email" readOnly value={form.email || ''} hint="Email tidak dapat diubah" />
                {isWarga && <Field label="NIK" readOnly value={form.nik || ''} hint="NIK tidak dapat diubah" />}

                <Field label="Nama Lengkap" name="nama_lengkap" value={form.nama_lengkap} onChange={onChange} required />
                <Field label="No. HP" name="no_hp" value={form.no_hp} onChange={onChange} placeholder="Contoh: 081234567890" />

                {isAdmin && <Field label="Jabatan" name="jabatan" value={form.jabatan} onChange={onChange} placeholder="Contoh: Kepala Desa / Admin Desa" />}

                {isWarga && (
                  <>
                    <Field label="Tempat Lahir" name="tempat_lahir" value={form.tempat_lahir} onChange={onChange} />
                    <Field label="Tanggal Lahir" name="tanggal_lahir" type="date" value={form.tanggal_lahir} onChange={onChange} />

                    <div>
                      <label className="mb-1.5 block text-sm font-bold text-slate-700">Jenis Kelamin</label>
                      <select name="jenis_kelamin" value={form.jenis_kelamin} onChange={onChange} className="input">
                        <option value="">— Pilih —</option>
                        <option value="laki-laki">Laki-laki</option>
                        <option value="perempuan">Perempuan</option>
                      </select>
                    </div>
                    <Field label="Agama" name="agama" value={form.agama} onChange={onChange} />
                    <Field label="Pekerjaan" name="pekerjaan" value={form.pekerjaan} onChange={onChange} />
                    <div className="md:col-span-2">
                      <label className="mb-1.5 block text-sm font-bold text-slate-700">Alamat</label>
                      <textarea name="alamat" value={form.alamat} onChange={onChange} rows="3" className="input resize-y" placeholder="Masukkan alamat lengkap" />
                    </div>
                  </>
                )}
              </div>

              <div className="mt-6 flex justify-end border-t border-slate-100 pt-5">
                <button type="submit" disabled={loading} className={primaryBtn}>
                  <Icon name="check" className="mr-2 h-4 w-4" />
                  {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          )}

          {tab === 'password' && (
            <form onSubmit={submitPassword} className="card max-w-xl">
              <SectionHeader
                icon="shield"
                title="Keamanan Akun"
                subtitle="Gunakan password yang kuat untuk menjaga akses akun e-Surat Desa."
                accentBg={accentBg}
                accentText={accentText}
              />

              <div className="mt-6 space-y-4">
                <Field
                  label="Password Baru"
                  type="password"
                  value={pw.password}
                  onChange={(e) => setPw({ ...pw, password: e.target.value })}
                  placeholder="Minimal 6 karakter"
                  required
                />
                <Field
                  label="Konfirmasi Password"
                  type="password"
                  value={pw.confirm}
                  onChange={(e) => setPw({ ...pw, confirm: e.target.value })}
                  placeholder="Ulangi password baru"
                  required
                />
                <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                  <Icon name="info" className="mt-0.5 h-5 w-5 shrink-0" />
                  <span>Setelah ubah password, Anda tetap login. Gunakan password baru saat login berikutnya.</span>
                </div>
                <button type="submit" disabled={pwLoading} className={`${primaryBtn} w-full`}>
                  {pwLoading ? 'Menyimpan...' : 'Ubah Password'}
                </button>
              </div>
            </form>
          )}

          {isAdmin && tab === 'ttd' && (
            <div className="card">
              <SectionHeader
                icon="signature"
                title="TTD Digital Admin"
                subtitle="Upload gambar tanda tangan agar otomatis tampil pada PDF surat yang Anda approve."
                accentBg={accentBg}
                accentText={accentText}
              />

              <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-5">
                  <p className="mb-3 text-sm font-bold text-slate-700">Preview TTD Saat Ini</p>
                  <div className="flex h-56 items-center justify-center overflow-hidden rounded-3xl bg-white shadow-inner">
                    {ttdImage ? (
                      <img src={`${fileBase}${ttdImage}`} alt="TTD Digital" className="max-h-44 max-w-full object-contain" />
                    ) : (
                      <div className="px-6 text-center text-sm text-slate-400">
                        <Icon name="signature" className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                        Belum ada TTD digital.
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="group flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-admin-200 bg-admin-50/70 p-8 text-center transition-all hover:-translate-y-0.5 hover:bg-admin-50 hover:shadow-lg">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-admin-700 shadow-sm">
                      <Icon name="plus" className="h-6 w-6" />
                    </div>
                    <p className="mt-4 font-black text-admin-900">Upload Gambar TTD</p>
                    <p className="mt-1 text-sm text-admin-800">PNG, JPG, JPEG, atau WEBP. Maksimal 2MB.</p>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      onChange={uploadTtd}
                      disabled={ttdLoading}
                      className="hidden"
                    />
                  </label>

                  {ttdImage && (
                    <button type="button" onClick={deleteTtd} disabled={ttdLoading} className="btn-danger w-full">
                      {ttdLoading ? 'Memproses...' : 'Hapus TTD'}
                    </button>
                  )}

                  <div className="flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
                    <Icon name="info" className="mt-0.5 h-5 w-5 shrink-0" />
                    <span>TTD akan dipakai untuk surat baru setelah proses approve. PDF lama tidak berubah otomatis.</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );

  return <Wrapper>{content}</Wrapper>;
}

function SectionHeader({ icon, title, subtitle, accentBg, accentText }) {
  return (
    <div className="flex items-start gap-3 border-b border-slate-100 pb-5">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${accentBg} ${accentText}`}>
        <Icon name={icon} className="h-6 w-6" />
      </div>
      <div>
        <h2 className="text-xl font-black text-slate-900">{title}</h2>
        <p className="mt-1 text-sm leading-relaxed text-slate-500">{subtitle}</p>
      </div>
    </div>
  );
}

function Field({ label, hint, readOnly, type = 'text', ...rest }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-bold text-slate-700">{label}</label>
      <input
        type={type}
        readOnly={readOnly}
        className={`input ${readOnly ? 'cursor-not-allowed bg-slate-50 text-slate-500' : ''}`}
        {...rest}
      />
      {hint && <p className="mt-1.5 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}
