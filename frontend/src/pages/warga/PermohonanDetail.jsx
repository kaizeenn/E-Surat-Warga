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
  let lampiranPersyaratan = p.lampiran_persyaratan;
  if (typeof lampiranPersyaratan === 'string') {
    try { lampiranPersyaratan = JSON.parse(lampiranPersyaratan); } catch { lampiranPersyaratan = []; }
  }

  let templateFields = p.template?.fields || [];
  if (typeof templateFields === 'string') {
    try { templateFields = JSON.parse(templateFields); } catch { templateFields = []; }
  }
  const fieldLabels = Object.fromEntries((Array.isArray(templateFields) ? templateFields : []).map((f) => [f.name, f.label || f.name]));
  const fallbackLabels = {
    tujuanInstansi: 'Tujuan Instansi/Pihak',
    tujuanPenggunaan: 'Tujuan Penggunaan Surat',
    nomorKk: 'Nomor KK',
    kondisiEkonomi: 'Ringkasan Kondisi Ekonomi',
    namaUsaha: 'Nama Usaha',
    jenisUsaha: 'Jenis Usaha',
    alamatUsaha: 'Alamat Usaha',
    tahunBerdiri: 'Tahun Berdiri',
    tujuan_instansi: 'Tujuan Instansi/Pihak',
    tujuan_penggunaan: 'Tujuan Penggunaan Surat',
    nomor_kk: 'Nomor KK',
    kondisi_ekonomi: 'Ringkasan Kondisi Ekonomi',
    nama_usaha: 'Nama Usaha',
    jenis_usaha: 'Jenis Usaha',
    alamat_usaha: 'Alamat Usaha',
    tahun_berdiri: 'Tahun Berdiri',
  };
  const hiddenDataKeys = new Set(['formulirPermohonan', 'suratPengantarRtRw']);
  const templateFieldNames = Array.isArray(templateFields) ? templateFields.map((f) => f.name) : [];
  const dataTambahanRows = templateFieldNames.length
    ? templateFieldNames
        .map((key) => [key, dataTambahan?.[key]])
        .filter(([key, value]) => !hiddenDataKeys.has(key) && value !== undefined && value !== null && String(value).trim() !== '')
    : Object.entries(dataTambahan || {}).filter(([key, value]) => !hiddenDataKeys.has(key) && value !== undefined && value !== null && String(value).trim() !== '');
  const tanggalAjukan = p.created_at || p.createdAt;
  const formatTanggal = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '-' : date.toLocaleString('id-ID');
  };
  lampiranPersyaratan = Array.isArray(lampiranPersyaratan)
    ? lampiranPersyaratan.map((item, idx) => ({
        ...item,
        labelView: item.label || item.nama || `Persyaratan ${idx + 1}`,
        fileNameView: item.file_name || item.original_name || null,
        noteView: item.note || item.catatan || '',
        requiredView: item.required ?? item.wajib ?? false,
      }))
    : [];

  const adaLampiran = Array.isArray(lampiranPersyaratan) && lampiranPersyaratan.length > 0;
  const ringkasanLampiran = adaLampiran
    ? {
        text: 'Lampiran KTP dan KK sudah terunggah. Admin akan memeriksa kelengkapan berkas.',
        className: 'bg-slate-50 border-slate-200 text-slate-700',
      }
    : null;

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
          {ringkasanLampiran && (
            <div className={`card border ${ringkasanLampiran.className}`}>
              <div className="flex items-start gap-3">
                <Icon name={adaDitolak ? 'alert' : semuaValid ? 'check' : 'clock'} className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold">
                    {adaDitolak ? 'Status Lampiran Perlu Perbaikan' : semuaValid ? 'Status Lampiran Lengkap' : 'Status Lampiran Diproses'}
                  </h3>
                  <p className="text-sm mt-1">{ringkasanLampiran.text}</p>
                </div>
              </div>
            </div>
          )}

          <div className="card">
            <h2 className="font-semibold mb-4">{p.template?.nama}</h2>
            <dl className="space-y-3 text-sm">
              <Row label="Status">
                <StatusBadge status={p.status} />
              </Row>
              <Row label="Tgl. Ajukan">
                {formatTanggal(tanggalAjukan)}
              </Row>
              {p.tanggal_approve && (
                <Row label="Tgl. Diproses">
                  {formatTanggal(p.tanggal_approve)}
                </Row>
              )}
              {p.nomor_surat && (
                <Row label="Nomor Surat">
                  <span className="font-mono">{p.nomor_surat}</span>
                </Row>
              )}
              <Row label="Keperluan">{p.keperluan}</Row>
              {dataTambahanRows.map(([k, v]) => (
                <Row key={k} label={fieldLabels[k] || fallbackLabels[k] || k}>{String(v)}</Row>
              ))}
            </dl>
          </div>

          {Array.isArray(lampiranPersyaratan) && lampiranPersyaratan.length > 0 && (
            <div className="card">
              <h2 className="font-semibold mb-4">Lampiran Persyaratan</h2>
              <div className="space-y-3 text-sm">
                {lampiranPersyaratan.map((item, idx) => (
                  <div key={idx} className="border-b border-slate-100 pb-3 last:border-b-0">
                    <div className="flex flex-wrap gap-2">
                      <div className="w-40 text-slate-500">{item.labelView}</div>
                      <div className="flex-1 min-w-0">
                        {item.file_url ? (
                          <a
                            href={`${fileBase}${item.file_url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-warga-700 hover:underline font-medium"
                          >
                            {item.fileNameView || 'Lihat berkas'}
                          </a>
                        ) : (
                          <span className="text-slate-400">Belum ada file</span>
                        )}

                        <div className="mt-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${item.verificationStatusView === 'valid' ? 'bg-emerald-100 text-emerald-700' : item.verificationStatusView === 'tidak_valid' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                            {item.verificationStatusView === 'valid' ? 'Valid' : item.verificationStatusView === 'tidak_valid' ? 'Tidak Valid' : 'Menunggu Verifikasi'}
                          </span>
                        </div>

                        {item.noteView && <p className="text-xs text-slate-500 mt-2">Persyaratan: {item.noteView}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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
