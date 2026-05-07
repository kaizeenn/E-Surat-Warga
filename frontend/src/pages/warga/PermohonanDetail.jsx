import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api, { API_URL } from '../../services/api';
import WargaLayout from './WargaLayout';
import StatusBadge from '../../components/StatusBadge';
import Icon from '../../components/Icon';

export default function PermohonanDetail() {
  const { id } = useParams();
  const [p, setP] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/surat/saya/${id}`)
      .then((res) => setP(res.data.data))
      .finally(() => setLoading(false));
  }, [id]);

  // baseURL untuk file static (hilangkan /api dari API_URL)
  const fileBase = API_URL.replace(/\/api\/?$/, '');

  if (loading) {
    return <WargaLayout><p className="text-slate-500">Memuat...</p></WargaLayout>;
  }
  if (!p) {
    return <WargaLayout><p className="text-slate-500">Permohonan tidak ditemukan.</p></WargaLayout>;
  }

  let dataTambahan = p.data_tambahan;
  if (typeof dataTambahan === 'string') {
    try { dataTambahan = JSON.parse(dataTambahan); } catch { dataTambahan = {}; }
  }

  return (
    <WargaLayout>
      <div className="mb-6 flex items-center gap-3">
        <Link to="/warga/permohonan" className="btn-secondary text-sm">
          <Icon name="arrowLeft" className="w-4 h-4 mr-1" /> Kembali
        </Link>
        <h1 className="text-2xl font-bold">Detail Permohonan #{p.id}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h2 className="font-semibold mb-4">{p.template?.nama}</h2>
            <dl className="space-y-3 text-sm">
              <Row label="Status">
                <StatusBadge status={p.status} />
              </Row>
              <Row label="Tgl. Ajukan">
                {new Date(p.createdAt).toLocaleString('id-ID')}
              </Row>
              {p.tanggal_approve && (
                <Row label="Tgl. Diproses">
                  {new Date(p.tanggal_approve).toLocaleString('id-ID')}
                </Row>
              )}
              {p.nomor_surat && (
                <Row label="Nomor Surat">
                  <span className="font-mono">{p.nomor_surat}</span>
                </Row>
              )}
              <Row label="Keperluan">{p.keperluan}</Row>
              {Object.entries(dataTambahan || {}).map(([k, v]) => (
                <Row key={k} label={k}>{String(v)}</Row>
              ))}
            </dl>
          </div>

          {p.catatan_admin && (
            <div className="card border-red-200 bg-red-50">
              <div className="flex items-start gap-3">
                <Icon name="alert" className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-900">Catatan dari Admin</h3>
                  <p className="text-red-800 text-sm mt-1">{p.catatan_admin}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {p.status === 'selesai' && p.file_pdf ? (
            <div className="card bg-emerald-50 border-emerald-200">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-full mb-3">
                  <Icon name="check" className="w-6 h-6 text-emerald-700" />
                </div>
                <h3 className="font-semibold text-emerald-900">Surat Siap</h3>
                <p className="text-sm text-emerald-700 mt-1">
                  Surat Anda sudah disetujui dan siap diunduh.
                </p>
                <a
                  href={`${fileBase}${p.file_pdf}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary w-full mt-4"
                >
                  <Icon name="download" className="w-4 h-4 mr-2" />
                  Download PDF
                </a>
              </div>
            </div>
          ) : p.status === 'menunggu' ? (
            <div className="card bg-amber-50 border-amber-200">
              <div className="flex items-start gap-3">
                <Icon name="clock" className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-amber-900">Menunggu Review</h3>
                  <p className="text-sm text-amber-800 mt-1">
                    Permohonan Anda sedang dalam antrian admin.
                  </p>
                </div>
              </div>
            </div>
          ) : p.status === 'ditolak' ? (
            <div className="card bg-red-50 border-red-200">
              <div className="flex items-start gap-3">
                <Icon name="x" className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-900">Permohonan Ditolak</h3>
                  <p className="text-sm text-red-800 mt-1">
                    Lihat catatan admin untuk alasan penolakan.
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </WargaLayout>
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
