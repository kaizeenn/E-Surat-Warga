import { useEffect, useState } from 'react';
import api, { API_URL } from '../../services/api';
import AdminLayout from './AdminLayout';
import Icon from '../../components/Icon';

export default function Arsip() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const fileBase = API_URL.replace(/\/api\/?$/, '');

  useEffect(() => {
    api.get('/admin/arsip')
      .then((res) => setList(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout>
      <section className="page-hero">
        <div>
          <p className="page-kicker">Dokumen Terbit</p>
          <h1 className="page-title">Arsip Surat</h1>
          <p className="page-subtitle">Kumpulan surat yang sudah disetujui dan diterbitkan otomatis dalam bentuk PDF.</p>
        </div>
      </section>

      <div className="table-shell p-4 md:p-6">
        {loading ? (
          <div className="empty-state text-slate-500">Memuat arsip surat...</div>
        ) : list.length === 0 ? (
          <div className="empty-state">
            <Icon name="archive" className="mx-auto mb-3 h-12 w-12 text-slate-300" />
            <p className="font-semibold text-slate-700">Belum ada arsip</p>
            <p className="mt-1 text-sm text-slate-500">Surat yang sudah disetujui akan otomatis muncul di sini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {list.map((p) => (
              <div key={p.id} className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                      <Icon name="archive" className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-mono text-xs font-bold text-admin-700">{p.nomor_surat}</p>
                      <h3 className="mt-1 font-black text-slate-900">{p.template?.nama}</h3>
                      <p className="mt-1 text-sm text-slate-500">Pemohon: {p.warga?.nama_lengkap}</p>
                      <p className="text-xs text-slate-400 font-mono">{p.warga?.nik}</p>
                    </div>
                  </div>
                  {p.file_pdf && (
                    <a href={`${fileBase}${p.file_pdf}`} target="_blank" rel="noopener noreferrer" className="btn-admin-primary shrink-0 text-xs">
                      <Icon name="download" className="w-4 h-4 mr-1" /> PDF
                    </a>
                  )}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl bg-slate-50 p-3 text-xs">
                  <div>
                    <p className="text-slate-400">Tanggal Terbit</p>
                    <p className="mt-1 font-semibold text-slate-700">{p.tanggal_approve ? new Date(p.tanggal_approve).toLocaleDateString('id-ID') : '-'}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Diterbitkan Oleh</p>
                    <p className="mt-1 font-semibold text-slate-700">{p.admin?.nama_lengkap || '-'}</p>
                    <p className="text-slate-400">{p.admin?.jabatan}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
