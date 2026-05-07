import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { API_URL } from '../../services/api';
import AdminLayout from './AdminLayout';
import StatusBadge from '../../components/StatusBadge';
import Icon from '../../components/Icon';

export default function AdminPermohonanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [p, setP] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [showTolak, setShowTolak] = useState(false);
  const [catatan, setCatatan] = useState('');

  const fileBase = API_URL.replace(/\/api\/?$/, '');

  const load = () => {
    setLoading(true);
    api.get(`/admin/permohonan/${id}`)
      .then((res) => setP(res.data.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const approve = async () => {
    if (!confirm('Setujui permohonan ini? Surat akan otomatis di-generate.')) return;
    setActing(true);
    try {
      const res = await api.patch(`/admin/permohonan/${id}/approve`);
      toast.success(`Surat diterbitkan: ${res.data.data.nomorSurat}`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal approve');
    } finally {
      setActing(false);
    }
  };

  const tolak = async () => {
    if (catatan.trim().length < 5) {
      toast.error('Catatan alasan minimal 5 karakter');
      return;
    }
    setActing(true);
    try {
      await api.patch(`/admin/permohonan/${id}/tolak`, { catatan });
      toast.success('Permohonan ditolak');
      setShowTolak(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal tolak');
    } finally {
      setActing(false);
    }
  };

  if (loading) {
    return <AdminLayout><p className="text-slate-500">Memuat...</p></AdminLayout>;
  }
  if (!p) {
    return <AdminLayout><p className="text-slate-500">Permohonan tidak ditemukan.</p></AdminLayout>;
  }

  let dataTambahan = p.data_tambahan;
  if (typeof dataTambahan === 'string') {
    try { dataTambahan = JSON.parse(dataTambahan); } catch { dataTambahan = {}; }
  }

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center gap-3">
        <Link to="/admin/permohonan" className="btn-secondary text-sm">
          <Icon name="arrowLeft" className="w-4 h-4 mr-1" /> Kembali
        </Link>
        <h1 className="text-2xl font-bold">Review Permohonan #{p.id}</h1>
        <StatusBadge status={p.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Data Surat */}
          <div className="card">
            <h2 className="font-semibold mb-4">Data Surat</h2>
            <dl className="space-y-3 text-sm">
              <Row label="Jenis Surat">{p.template?.nama}</Row>
              <Row label="Tgl. Ajukan">{new Date(p.createdAt).toLocaleString('id-ID')}</Row>
              <Row label="Keperluan">{p.keperluan}</Row>
              {Object.entries(dataTambahan || {}).map(([k, v]) => (
                <Row key={k} label={k}>{String(v)}</Row>
              ))}
              {p.nomor_surat && (
                <Row label="Nomor Surat">
                  <span className="font-mono">{p.nomor_surat}</span>
                </Row>
              )}
            </dl>
          </div>

          {/* Data Warga */}
          <div className="card">
            <h2 className="font-semibold mb-4">Data Pemohon (Warga)</h2>
            <dl className="space-y-3 text-sm">
              <Row label="Nama">{p.warga?.nama_lengkap}</Row>
              <Row label="NIK"><span className="font-mono">{p.warga?.nik}</span></Row>
              <Row label="Email">{p.warga?.email}</Row>
              <Row label="No. HP">{p.warga?.no_hp || '-'}</Row>
              <Row label="TTL">
                {p.warga?.tempat_lahir || '-'}, {p.warga?.tanggal_lahir
                  ? new Date(p.warga.tanggal_lahir).toLocaleDateString('id-ID') : '-'}
              </Row>
              <Row label="Jenis Kelamin">{p.warga?.jenis_kelamin || '-'}</Row>
              <Row label="Agama">{p.warga?.agama || '-'}</Row>
              <Row label="Pekerjaan">{p.warga?.pekerjaan || '-'}</Row>
              <Row label="Alamat">{p.warga?.alamat || '-'}</Row>
            </dl>
          </div>

          {p.catatan_admin && (
            <div className="card border-red-200 bg-red-50">
              <div className="flex items-start gap-3">
                <Icon name="alert" className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-900">Catatan Penolakan</h3>
                  <p className="text-red-800 text-sm mt-1">{p.catatan_admin}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar action */}
        <div className="space-y-4">
          {p.status === 'menunggu' ? (
            <div className="card">
              <h3 className="font-semibold mb-3">Tindakan</h3>
              {!showTolak ? (
                <div className="space-y-2">
                  <button
                    onClick={approve}
                    disabled={acting}
                    className="btn-primary w-full"
                  >
                    <Icon name="check" className="w-4 h-4 mr-2" />
                    Approve & Terbitkan
                  </button>
                  <button
                    onClick={() => setShowTolak(true)}
                    className="btn-danger w-full"
                  >
                    <Icon name="x" className="w-4 h-4 mr-2" />
                    Tolak
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Alasan Penolakan</label>
                  <textarea
                    className="input"
                    rows="4"
                    placeholder="Jelaskan alasan penolakan..."
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button onClick={() => setShowTolak(false)} className="btn-secondary flex-1">
                      Batal
                    </button>
                    <button onClick={tolak} disabled={acting} className="btn-danger flex-1">
                      Konfirmasi Tolak
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : p.status === 'selesai' && p.file_pdf ? (
            <div className="card bg-emerald-50 border-emerald-200">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-full mb-3">
                  <Icon name="check" className="w-6 h-6 text-emerald-700" />
                </div>
                <h3 className="font-semibold text-emerald-900">Surat Sudah Terbit</h3>
                {p.admin && (
                  <p className="text-xs text-emerald-700 mt-1">
                    Disetujui oleh {p.admin.nama_lengkap}
                  </p>
                )}
                <a
                  href={`${fileBase}${p.file_pdf}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary w-full mt-4"
                >
                  <Icon name="download" className="w-4 h-4 mr-2" />
                  Lihat PDF
                </a>
              </div>
            </div>
          ) : (
            <div className="card bg-red-50 border-red-200 text-center text-red-800 text-sm">
              Permohonan ini sudah ditolak.
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

function Row({ label, children }) {
  return (
    <div className="flex flex-wrap gap-2">
      <dt className="w-32 text-slate-500 capitalize">{label}</dt>
      <dd className="flex-1 min-w-0">{children}</dd>
    </div>
  );
}
