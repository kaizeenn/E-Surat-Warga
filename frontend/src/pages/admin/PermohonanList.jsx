import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import AdminLayout from './AdminLayout';
import StatusBadge from '../../components/StatusBadge';
import Icon from '../../components/Icon';

const FILTERS = [
  { value: '', label: 'Semua' },
  { value: 'menunggu', label: 'Menunggu' },
  { value: 'selesai', label: 'Selesai' },
  { value: 'ditolak', label: 'Ditolak' },
];

export default function AdminPermohonanList() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');

  const fetchData = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (q) params.set('q', q);
    api.get(`/admin/permohonan?${params}`)
      .then((res) => setList(res.data.data))
      .finally(() => setLoading(false));
  };

  useEffect(fetchData, [status]);

  return (
    <AdminLayout>
      <section className="page-hero">
        <div>
          <p className="page-kicker">Antrian Admin</p>
          <h1 className="page-title">Permohonan Masuk</h1>
          <p className="page-subtitle">Review pengajuan warga, cek data, verifikasi lampiran, lalu setujui atau tolak permohonan.</p>
        </div>
      </section>

      <div className="table-shell p-4 md:p-6">
        <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap gap-2 rounded-3xl bg-slate-100 p-1">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatus(f.value)}
                className={`pill-tab ${status === f.value ? 'bg-white text-admin-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); fetchData(); }} className="flex w-full gap-2 xl:max-w-md">
            <div className="relative flex-1">
              <Icon name="search" className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama atau NIK warga..."
                className="input pl-10"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-secondary">Cari</button>
          </form>
        </div>

        {loading ? (
          <div className="empty-state text-slate-500">Memuat permohonan...</div>
        ) : list.length === 0 ? (
          <div className="empty-state">
            <Icon name="inbox" className="mx-auto mb-3 h-12 w-12 text-slate-300" />
            <p className="font-semibold text-slate-700">Tidak ada permohonan</p>
            <p className="mt-1 text-sm text-slate-500">Coba ubah filter atau kata pencarian.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {list.map((p) => (
              <Link
                key={p.id}
                to={`/admin/permohonan/${p.id}`}
                className="group flex flex-col gap-3 rounded-3xl border border-slate-100 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-admin-100 hover:shadow-lg lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-admin-50 text-admin-700">
                    <Icon name="inbox" className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-black text-slate-900">{p.template?.nama}</div>
                    <div className="mt-1 text-sm text-slate-500">{p.warga?.nama_lengkap} · <span className="font-mono">{p.warga?.nik}</span></div>
                    <div className="mt-2 text-xs font-medium text-slate-400">Masuk {new Date(p.createdAt).toLocaleString('id-ID')}</div>
                  </div>
                </div>
                <div className="flex shrink-0 items-center justify-between gap-3 lg:justify-end">
                  <StatusBadge status={p.status} />
                  <span className="inline-flex items-center rounded-2xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 group-hover:bg-admin-50 group-hover:text-admin-700">
                    Review <Icon name="arrowRight" className="ml-1 h-4 w-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
