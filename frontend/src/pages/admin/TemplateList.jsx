import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import AdminLayout from './AdminLayout';
import Icon from '../../components/Icon';

export default function TemplateList() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get('/admin/template')
      .then((res) => setList(res.data.data))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const toggle = async (t) => {
    try {
      await api.patch(`/admin/template/${t.id}/toggle`);
      toast.success(t.aktif ? 'Template dinonaktifkan' : 'Template diaktifkan');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal');
    }
  };

  const remove = async (t) => {
    if (!confirm(`Hapus template "${t.nama}"? Aksi ini tidak bisa dibatalkan.`)) return;
    try {
      await api.delete(`/admin/template/${t.id}`);
      toast.success('Template dihapus');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal hapus');
    }
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Kelola Template Surat</h1>
          <p className="text-slate-500">Tambah, edit, atau nonaktifkan jenis surat yang tersedia.</p>
        </div>
        <Link to="/admin/template/baru" className="btn-admin-primary">
          <Icon name="plus" className="w-4 h-4 mr-2" />
          Template Baru
        </Link>
      </div>

      <div className="card">
        {loading ? (
          <p className="text-slate-500 text-sm">Memuat...</p>
        ) : list.length === 0 ? (
          <div className="text-center py-12">
            <Icon name="document" className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500">Belum ada template.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200">
                <tr className="text-left text-slate-500">
                  <th className="py-2 pr-2 font-medium">Kode</th>
                  <th className="py-2 pr-2 font-medium">Nama</th>
                  <th className="py-2 pr-2 font-medium">File HTML</th>
                  <th className="py-2 pr-2 font-medium">Field</th>
                  <th className="py-2 pr-2 font-medium">Status</th>
                  <th className="py-2 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {list.map((t) => {
                  let fields = t.fields;
                  if (typeof fields === 'string') {
                    try { fields = JSON.parse(fields); } catch { fields = []; }
                  }
                  return (
                    <tr key={t.id} className="hover:bg-slate-50">
                      <td className="py-3 pr-2 font-mono text-xs">{t.kode}</td>
                      <td className="py-3 pr-2 font-medium">{t.nama}</td>
                      <td className="py-3 pr-2 text-xs text-slate-500 font-mono">{t.file_template}</td>
                      <td className="py-3 pr-2">{Array.isArray(fields) ? fields.length : 0} field</td>
                      <td className="py-3 pr-2">
                        {t.aktif ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-emerald-100 text-emerald-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-slate-200 text-slate-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            Nonaktif
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-right whitespace-nowrap space-x-3">
                        <button
                          onClick={() => toggle(t)}
                          className="text-slate-600 hover:underline text-xs"
                        >
                          {t.aktif ? 'Nonaktifkan' : 'Aktifkan'}
                        </button>
                        <Link
                          to={`/admin/template/${t.id}/edit`}
                          className="text-admin-600 hover:underline font-medium"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => remove(t)}
                          className="text-red-600 hover:underline font-medium"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
