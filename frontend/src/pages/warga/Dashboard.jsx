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
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Halo, {user?.nama_lengkap}</h1>
        <p className="text-slate-500">Berikut ringkasan permohonan surat Anda.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total" value={counts.total} icon="document" color="slate" />
        <StatCard label="Menunggu" value={counts.menunggu} icon="clock" color="amber" />
        <StatCard label="Selesai" value={counts.selesai} icon="check" color="emerald" />
        <StatCard label="Ditolak" value={counts.ditolak} icon="x" color="red" />
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Permohonan Terbaru</h2>
          <Link to="/warga/ajukan" className="btn-primary text-sm">
            <Icon name="plus" className="w-4 h-4 mr-1" />
            Ajukan Baru
          </Link>
        </div>

        {loading ? (
          <p className="text-slate-500 text-sm">Memuat...</p>
        ) : list.length === 0 ? (
          <div className="text-center py-12">
            <Icon name="inbox" className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500">Belum ada permohonan. Ajukan surat pertama Anda.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {list.slice(0, 5).map((p) => (
              <Link
                key={p.id}
                to={`/warga/permohonan/${p.id}`}
                className="flex items-center justify-between py-3 hover:bg-slate-50 px-2 -mx-2 rounded"
              >
                <div className="min-w-0 flex-1">
                  <div className="font-medium truncate">{p.template?.nama}</div>
                  <div className="text-sm text-slate-500 truncate">{p.keperluan}</div>
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
    </WargaLayout>
  );
}

function StatCard({ label, value, icon, color }) {
  const colorMap = {
    slate: 'bg-slate-100 text-slate-700',
    amber: 'bg-amber-100 text-amber-700',
    emerald: 'bg-emerald-100 text-emerald-700',
    red: 'bg-red-100 text-red-700',
  };
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorMap[color]}`}>
          <Icon name={icon} className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
