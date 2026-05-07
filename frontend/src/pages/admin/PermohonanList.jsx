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
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Permohonan Masuk</h1>
        <p className="text-slate-500">Daftar semua permohonan dari warga.</p>
      </div>

      <div className="card">
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatus(f.value)}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  status === f.value
                    ? 'bg-white shadow-sm font-medium'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <form
            onSubmit={(e) => { e.preventDefault(); fetchData(); }}
            className="flex flex-1 max-w-md gap-2"
          >
            <div className="relative flex-1">
              <Icon name="search" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama atau NIK warga..."
                className="input pl-9"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-secondary">Cari</button>
          </form>
        </div>

        {loading ? (
          <p className="text-slate-500 text-sm">Memuat...</p>
        ) : list.length === 0 ? (
          <div className="text-center py-12">
            <Icon name="inbox" className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500">Tidak ada permohonan.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200">
                <tr className="text-left text-slate-500">
                  <th className="py-2 pr-2 font-medium">Tanggal</th>
                  <th className="py-2 pr-2 font-medium">Warga</th>
                  <th className="py-2 pr-2 font-medium">Jenis Surat</th>
                  <th className="py-2 pr-2 font-medium">Status</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {list.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="py-3 pr-2">
                      {new Date(p.createdAt).toLocaleDateString('id-ID')}
                    </td>
                    <td className="py-3 pr-2">
                      <div className="font-medium">{p.warga?.nama_lengkap}</div>
                      <div className="text-xs text-slate-500">{p.warga?.nik}</div>
                    </td>
                    <td className="py-3 pr-2">{p.template?.nama}</td>
                    <td className="py-3 pr-2"><StatusBadge status={p.status} /></td>
                    <td className="py-3 text-right">
                      <Link to={`/admin/permohonan/${p.id}`} className="text-admin-600 hover:underline font-medium">
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
