import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import WargaLayout from './WargaLayout';
import StatusBadge from '../../components/StatusBadge';
import Icon from '../../components/Icon';

export default function PermohonanList() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/surat/saya')
      .then((res) => setList(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <WargaLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Permohonan Saya</h1>
          <p className="text-slate-500">Daftar semua permohonan surat yang pernah diajukan.</p>
        </div>
        <Link to="/warga/ajukan" className="btn-primary">
          <Icon name="plus" className="w-4 h-4 mr-1" />
          Ajukan Baru
        </Link>
      </div>

      <div className="card">
        {loading ? (
          <p className="text-slate-500 text-sm">Memuat...</p>
        ) : list.length === 0 ? (
          <div className="text-center py-12">
            <Icon name="inbox" className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500">Belum ada permohonan.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200">
                <tr className="text-left text-slate-500">
                  <th className="py-2 pr-2 font-medium">Tgl. Ajukan</th>
                  <th className="py-2 pr-2 font-medium">Jenis Surat</th>
                  <th className="py-2 pr-2 font-medium">Keperluan</th>
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
                    <td className="py-3 pr-2 font-medium">{p.template?.nama}</td>
                    <td className="py-3 pr-2 text-slate-600 max-w-xs truncate">
                      {p.keperluan}
                    </td>
                    <td className="py-3 pr-2">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="py-3 text-right">
                      <Link to={`/warga/permohonan/${p.id}`} className="text-warga-600 hover:underline font-medium">
                        Detail
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </WargaLayout>
  );
}
