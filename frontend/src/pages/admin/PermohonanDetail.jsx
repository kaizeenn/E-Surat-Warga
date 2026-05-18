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
  const [catatanLampiran, setCatatanLampiran] = useState({});
  const [previewFile, setPreviewFile] = useState(null);

  const fileBase = API_URL.replace(/\/api\/?$/, '');

  const load = () => {
    setLoading(true);
    api.get(`/admin/permohonan/${id}`)
      .then((res) => setP(res.data.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  useEffect(() => {
    if (!previewFile) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setPreviewFile(null);
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [previewFile]);

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

  const verifikasiLampiran = async (idx, status) => {
    setActing(true);
    try {
      await api.patch(`/admin/permohonan/${id}/lampiran/${idx}/verifikasi`, {
        status,
        catatan: catatanLampiran[idx] || '',
      });
      toast.success('Status lampiran diperbarui');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal verifikasi lampiran');
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
        verificationStatusView: item.verification_status || item.verifikasi_status || 'pending',
        verificationNoteView: item.verification_note || item.verifikasi_catatan || '',
      }))
    : [];

  const isImageFile = (item) => {
    const name = String(item.fileNameView || item.file_url || '').toLowerCase();
    return /\.(png|jpe?g|webp|gif|bmp|svg)$/i.test(name);
  };

  const getFileUrl = (item) => `${fileBase}${item.file_url}`;

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
              <Row label="Tgl. Ajukan">{formatTanggal(tanggalAjukan)}</Row>
              <Row label="Keperluan">{p.keperluan}</Row>
              {dataTambahanRows.map(([k, v]) => (
                <Row key={k} label={fieldLabels[k] || fallbackLabels[k] || k}>{String(v)}</Row>
              ))}
              {p.nomor_surat && (
                <Row label="Nomor Surat">
                  <span className="font-mono">{p.nomor_surat}</span>
                </Row>
              )}
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
                          isImageFile(item) ? (
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                              <button
                                type="button"
                                onClick={() => setPreviewFile({
                                  url: getFileUrl(item),
                                  name: item.fileNameView || item.labelView || 'Lampiran warga',
                                  label: item.labelView,
                                })}
                                className="group relative h-28 w-40 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm transition hover:-translate-y-0.5 hover:border-admin-300 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-admin-100"
                                title="Klik untuk preview gambar"
                              >
                                <img
                                  src={getFileUrl(item)}
                                  alt={item.fileNameView || item.labelView}
                                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                  loading="lazy"
                                />
                                <span className="absolute inset-0 flex items-center justify-center bg-slate-950/0 text-xs font-semibold text-white opacity-0 transition group-hover:bg-slate-950/45 group-hover:opacity-100">
                                  Preview
                                </span>
                              </button>
                              <div className="min-w-0">
                                <button
                                  type="button"
                                  onClick={() => setPreviewFile({
                                    url: getFileUrl(item),
                                    name: item.fileNameView || item.labelView || 'Lampiran warga',
                                    label: item.labelView,
                                  })}
                                  className="block max-w-full truncate text-left font-medium text-admin-700 hover:underline"
                                >
                                  {item.fileNameView || 'Preview gambar'}
                                </button>
                                <a
                                  href={getFileUrl(item)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="mt-1 inline-flex text-xs font-medium text-slate-500 hover:text-admin-700 hover:underline"
                                >
                                  Buka di tab baru
                                </a>
                              </div>
                            </div>
                          ) : (
                            <a
                              href={getFileUrl(item)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-admin-700 hover:underline font-medium"
                            >
                              {item.fileNameView || 'Lihat berkas'}
                            </a>
                          )
                        ) : (
                          <span className="text-slate-400">Belum ada file</span>
                        )}
                        {item.noteView && <p className="text-xs text-slate-500 mt-1">{item.noteView}</p>}
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${item.verificationStatusView === 'valid' ? 'bg-emerald-100 text-emerald-700' : item.verificationStatusView === 'tidak_valid' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                            {item.verificationStatusView === 'valid' ? 'Valid' : item.verificationStatusView === 'tidak_valid' ? 'Tidak Valid' : 'Pending'}
                          </span>
                          {p.status === 'menunggu' && item.file_url && (
                            <>
                              <button onClick={() => verifikasiLampiran(idx, 'valid')} disabled={acting} className="btn-primary text-xs px-3 py-1">
                                Valid
                              </button>
                              <button onClick={() => verifikasiLampiran(idx, 'tidak_valid')} disabled={acting} className="btn-danger text-xs px-3 py-1">
                                Tidak Valid
                              </button>
                              <button onClick={() => verifikasiLampiran(idx, 'pending')} disabled={acting} className="btn-secondary text-xs px-3 py-1">
                                Reset
                              </button>
                            </>
                          )}
                        </div>
                        {p.status === 'menunggu' && item.file_url && (
                          <textarea
                            className="input mt-2"
                            rows="2"
                            placeholder="Catatan verifikasi lampiran (opsional)"
                            value={catatanLampiran[idx] ?? item.verificationNoteView ?? ''}
                            onChange={(e) => setCatatanLampiran((s) => ({ ...s, [idx]: e.target.value }))}
                          />
                        )}
                        {item.verificationNoteView && (
                          <p className="text-xs text-slate-600 mt-2">Catatan admin: {item.verificationNoteView}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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

      {previewFile && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Preview lampiran warga"
          onClick={() => setPreviewFile(null)}
        >
          <div
            className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-[2rem] border border-white/15 bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50/90 px-5 py-4">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-admin-600">Preview Lampiran</p>
                <h3 className="truncate text-base font-bold text-slate-950">{previewFile.label}</h3>
                <p className="truncate text-xs text-slate-500">{previewFile.name}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <a
                  href={previewFile.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary text-xs px-3 py-2"
                >
                  Buka Tab
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewFile(null)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white transition hover:bg-slate-700 focus:outline-none focus:ring-4 focus:ring-slate-300"
                  aria-label="Tutup preview"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto bg-[radial-gradient(circle_at_top,_#f8fafc,_#e2e8f0)] p-4 sm:p-6">
              <img
                src={previewFile.url}
                alt={previewFile.name}
                className="max-h-[72vh] max-w-full rounded-2xl object-contain shadow-xl ring-1 ring-slate-900/10"
              />
            </div>
          </div>
        </div>
      )}
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
