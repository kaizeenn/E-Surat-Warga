import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import AdminLayout from './AdminLayout';
import StatusBadge from '../../components/StatusBadge';
import Icon from '../../components/Icon';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/admin/stats'),
      api.get('/admin/permohonan?status=menunggu'),
    ])
      .then(([sRes, lRes]) => {
        setStats(sRes.data.data);
        setRecent(lRes.data.data.slice(0, 5));
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout>
      <section className="page-hero relative">
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-admin-100 blur-3xl" />
        <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="page-kicker">Command Center Admin</p>
            <h1 className="page-title">Dashboard Admin Desa</h1>
            <p className="page-subtitle">Review permohonan masuk, verifikasi lampiran, terbitkan surat, dan pantau arsip dalam satu panel.</p>
          </div>
          <Link to="/admin/permohonan" className="btn-admin-primary self-start md:self-center">
            <Icon name="inbox" className="w-4 h-4 mr-2" />
            Review Permohonan
          </Link>
        </div>
      </section>

      {loading ? (
        <div className="empty-state text-slate-500">Memuat dashboard admin...</div>
      ) : (
        <>
          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
            <StatCard label="Total" value={stats?.total} icon="document" tone="slate" />
            <StatCard label="Menunggu" value={stats?.menunggu} icon="clock" tone="amber" />
            <StatCard label="Selesai" value={stats?.selesai} icon="check" tone="emerald" />
            <StatCard label="Ditolak" value={stats?.ditolak} icon="x" tone="red" />
            <StatCard label="Warga" value={stats?.totalWarga} icon="user" tone="blue" />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <section className="lg:col-span-2 table-shell p-6">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Permohonan Menunggu</h2>
                  <p className="text-sm text-slate-500">Pengajuan terbaru yang perlu direview admin.</p>
                </div>
                <Link to="/admin/permohonan" className="btn-secondary text-xs">Lihat Semua</Link>
              </div>

              {recent.length === 0 ? (
                <div className="empty-state">
                  <Icon name="inbox" className="mx-auto mb-3 h-12 w-12 text-slate-300" />
                  <p className="font-semibold text-slate-700">Tidak ada antrian</p>
                  <p className="mt-1 text-sm text-slate-500">Semua permohonan sudah diproses.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recent.map((p) => (
                    <Link
                      key={p.id}
                      to={`/admin/permohonan/${p.id}`}
                      className="group flex items-center justify-between gap-4 rounded-3xl border border-slate-100 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-admin-200 hover:shadow-lg"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-admin-50 text-admin-700">
                          <Icon name="document" className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="truncate font-bold text-slate-900">{p.template?.nama}</div>
                          <div className="truncate text-sm text-slate-500">oleh {p.warga?.nama_lengkap}</div>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <StatusBadge status={p.status} />
                        <div className="mt-1 text-xs text-slate-400">{new Date(p.createdAt).toLocaleDateString('id-ID')}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            <aside className="space-y-4">
              <div className="card bg-slate-950 text-white">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                  <Icon name="shield" className="w-6 h-6" />
                </div>
                <h3 className="mt-4 text-lg font-black">Checklist Admin</h3>
                <ul className="mt-4 space-y-3 text-sm text-slate-300">
                  <li>• Cek data warga dan keperluan surat</li>
                  <li>• Verifikasi semua lampiran wajib</li>
                  <li>• Approve hanya jika berkas valid</li>
                  <li>• Surat otomatis masuk arsip setelah terbit</li>
                </ul>
              </div>
              <div className="card border-admin-100 bg-admin-50/70">
                <h3 className="font-black text-admin-900">Tips</h3>
                <p className="mt-2 text-sm leading-relaxed text-admin-800">Gunakan catatan verifikasi jika lampiran kurang jelas agar warga tahu bagian yang perlu diperbaiki.</p>
              </div>
            </aside>
          </div>
        </>
      )}
    </AdminLayout>
  );
}

function StatCard({ label, value, icon, tone }) {
  const toneMap = {
    slate: 'bg-slate-100 text-slate-700',
    amber: 'bg-amber-100 text-amber-700',
    emerald: 'bg-emerald-100 text-emerald-700',
    red: 'bg-red-100 text-red-700',
    blue: 'bg-blue-100 text-blue-700',
  };
  return (
    <div className="stat-card">
      <div className="relative flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p>
          <p className="mt-2 text-3xl font-black text-slate-950">{value ?? 0}</p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${toneMap[tone]}`}>
          <Icon name={icon} className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
