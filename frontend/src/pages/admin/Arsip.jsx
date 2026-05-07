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
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Arsip Surat</h1>
        <p className="text-slate-500">Semua surat yang sudah diterbitkan.</p>
      </div>

      <div className="card">
        {loading ? (
          <p className="text-slate-500 text-sm">Memuat...</p>
        ) : list.length === 0 ? (
          <div className="text-center py-12">
            <Icon name="archive" className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500">Belum ada surat yang diterbitkan.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200">
                <tr className="text-left text-slate-500">
                  <th className="py-2 pr-2 font-medium">Nomor Surat</th>
                  <th className="py-2 pr-2 font-medium">Jenis</th>
                  <th className="py-2 pr-2 font-medium">Pemohon</th>
                  <th className="py-2 pr-2 font-medium">Tgl. Terbit</th>
                  <th className="py-2 pr-2 font-medium">Diterbitkan oleh</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {list.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="py-3 pr-2 font-mono text-xs">{p.nomor_surat}</td>
                    <td className="py-3 pr-2">{p.template?.nama}</td>
                    <td className="py-3 pr-2">
                      <div className="font-medium">{p.warga?.nama_lengkap}</div>
                      <div className="text-xs text-slate-500">{p.warga?.nik}</div>
                    </td>
                    <td className="py-3 pr-2">
                      {p.tanggal_approve ? new Date(p.tanggal_approve).toLocaleDateString('id-ID') : '-'}
                    </td>
                    <td className="py-3 pr-2 text-xs">
                      {p.admin?.nama_lengkap || '-'}
                      <div className="text-slate-400">{p.admin?.jabatan}</div>
                    </td>
                    <td className="py-3 text-right">
                      {p.file_pdf && (
                        <a
                          href={`${fileBase}${p.file_pdf}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-admin-600 hover:underline font-medium inline-flex items-center gap-1"
                        >
                          <Icon name="download" className="w-4 h-4" />
                          PDF
                        </a>
                      )}
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
