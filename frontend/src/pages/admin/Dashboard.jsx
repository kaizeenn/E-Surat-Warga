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
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Dashboard Admin</h1>
        <p className="text-slate-500">Ringkasan permohonan & aktivitas warga.</p>
      </div>

      {loading ? (
        <p className="text-slate-500 text-sm">Memuat...</p>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <StatCard label="Total Permohonan" value={stats?.total} icon="document" color="slate" />
            <StatCard label="Menunggu" value={stats?.menunggu} icon="clock" color="amber" />
            <StatCard label="Selesai" value={stats?.selesai} icon="check" color="emerald" />
            <StatCard label="Ditolak" value={stats?.ditolak} icon="x" color="red" />
            <StatCard label="Total Warga" value={stats?.totalWarga} icon="user" color="blue" />
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Permohonan Menunggu</h2>
              <Link to="/admin/permohonan" className="text-admin-600 hover:underline text-sm">
                Lihat semua →
              </Link>
            </div>

            {recent.length === 0 ? (
              <div className="text-center py-12">
                <Icon name="inbox" className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500">Tidak ada permohonan yang menunggu.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recent.map((p) => (
                  <Link
                    key={p.id}
                    to={`/admin/permohonan/${p.id}`}
                    className="flex items-center justify-between py-3 hover:bg-slate-50 px-2 -mx-2 rounded"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">{p.template?.nama}</div>
                      <div className="text-sm text-slate-500 truncate">
                        oleh {p.warga?.nama_lengkap}
                      </div>
                    </div>
                    <div className="ml-4 text-right shrink-0">
                      <StatusBadge status={p.status} />
                      <div className="text-xs text-slate-400 mt-1">
                        {new Date(p.createdAt).toLocaleDateString('id-ID')}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </AdminLayout>
  );
}

function StatCard({ label, value, icon, color }) {
  const colorMap = {
    slate: 'bg-slate-100 text-slate-700',
    amber: 'bg-amber-100 text-amber-700',
    emerald: 'bg-emerald-100 text-emerald-700',
    red: 'bg-red-100 text-red-700',
    blue: 'bg-blue-100 text-blue-700',
  };
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500">{label}</p>
          <p className="text-2xl font-bold mt-1">{value ?? 0}</p>
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorMap[color]}`}>
          <Icon name={icon} className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
