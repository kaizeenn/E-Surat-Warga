import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import WargaLayout from './WargaLayout';
import StatusBadge from '../../components/StatusBadge';
import Icon from '../../components/Icon';

export default function WargaDashboard() {
  const { user } = useAuth();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/surat/saya')
      .then((res) => setList(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  const counts = {
    total: list.length,
    menunggu: list.filter(p => p.status === 'menunggu').length,
    selesai: list.filter(p => p.status === 'selesai').length,
    ditolak: list.filter(p => p.status === 'ditolak').length,
  };

  return (
    <WargaLayout>
      <section className="page-hero relative">
        <div className="absolute right-0 top-0 h-36 w-36 rounded-full bg-warga-100 blur-3xl" />
        <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="page-kicker">Dashboard Warga</p>
            <h1 className="page-title">Halo, {user?.nama_lengkap}</h1>
            <p className="page-subtitle">Pantau status permohonan surat Anda dan ajukan surat baru tanpa perlu datang ke kantor desa.</p>
          </div>
          <Link to="/warga/ajukan" className="btn-primary self-start md:self-center">
            <Icon name="plus" className="w-4 h-4 mr-2" />
            Ajukan Surat Baru
          </Link>
        </div>
      </section>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Permohonan" value={counts.total} icon="document" tone="slate" />
        <StatCard label="Menunggu Review" value={counts.menunggu} icon="clock" tone="amber" />
        <StatCard label="Surat Selesai" value={counts.selesai} icon="check" tone="emerald" />
        <StatCard label="Ditolak" value={counts.ditolak} icon="x" tone="red" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2 table-shell p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-slate-900">Permohonan Terbaru</h2>
              <p className="text-sm text-slate-500">Lima aktivitas terakhir dari pengajuan surat Anda.</p>
            </div>
            <Link to="/warga/permohonan" className="btn-secondary text-xs">Lihat Semua</Link>
          </div>

          {loading ? (
            <LoadingState />
          ) : list.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-3">
              {list.slice(0, 5).map((p) => (
                <Link
                  key={p.id}
                  to={`/warga/permohonan/${p.id}`}
                  className="group flex items-center justify-between gap-4 rounded-3xl border border-slate-100 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-warga-200 hover:shadow-lg"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-warga-50 text-warga-700">
                      <Icon name="document" className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-bold text-slate-900">{p.template?.nama}</div>
                      <div className="truncate text-sm text-slate-500">{p.keperluan}</div>
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
              <Icon name="sparkles" className="w-6 h-6" />
            </div>
            <h3 className="mt-4 text-lg font-black">Alur Cepat</h3>
            <ol className="mt-4 space-y-3 text-sm text-slate-300">
              <li>1. Pilih jenis surat</li>
              <li>2. Isi data dan upload lampiran</li>
              <li>3. Tunggu verifikasi admin</li>
              <li>4. Unduh PDF saat selesai</li>
            </ol>
          </div>
          <div className="card border-warga-100 bg-warga-50/70">
            <h3 className="font-black text-warga-900">Catatan</h3>
            <p className="mt-2 text-sm leading-relaxed text-warga-800">NIK tidak perlu diisi ulang saat pengajuan karena sudah tersimpan di akun warga.</p>
          </div>
        </aside>
      </div>
    </WargaLayout>
  );
}

function StatCard({ label, value, icon, tone }) {
  const toneMap = {
    slate: 'bg-slate-100 text-slate-700',
    amber: 'bg-amber-100 text-amber-700',
    emerald: 'bg-emerald-100 text-emerald-700',
    red: 'bg-red-100 text-red-700',
  };
  return (
    <div className="stat-card">
      <div className="relative flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p>
          <p className="mt-2 text-3xl font-black text-slate-950">{value}</p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${toneMap[tone]}`}>
          <Icon name={icon} className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return <div className="empty-state text-slate-500">Memuat data permohonan...</div>;
}

function EmptyState() {
  return (
    <div className="empty-state">
      <Icon name="inbox" className="mx-auto mb-3 h-12 w-12 text-slate-300" />
      <p className="font-semibold text-slate-700">Belum ada permohonan</p>
      <p className="mt-1 text-sm text-slate-500">Ajukan surat pertama Anda untuk mulai menggunakan layanan.</p>
    </div>
  );
}
