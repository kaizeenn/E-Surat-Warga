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
      <section className="page-hero">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="page-kicker">Konfigurasi Surat</p>
            <h1 className="page-title">Kelola Template Surat</h1>
            <p className="page-subtitle">Atur jenis surat, field form, dan status aktif layanan surat yang tersedia untuk warga.</p>
          </div>
          <Link to="/admin/template/baru" className="btn-admin-primary self-start md:self-center">
            <Icon name="plus" className="w-4 h-4 mr-2" />
            Template Baru
          </Link>
        </div>
      </section>

      <div className="table-shell p-4 md:p-6">
        {loading ? (
          <div className="empty-state text-slate-500">Memuat template...</div>
        ) : list.length === 0 ? (
          <div className="empty-state">
            <Icon name="document" className="mx-auto mb-3 h-12 w-12 text-slate-300" />
            <p className="font-semibold text-slate-700">Belum ada template</p>
            <p className="mt-1 text-sm text-slate-500">Tambahkan template surat pertama Anda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {list.map((t) => {
              let fields = t.fields;
              if (typeof fields === 'string') {
                try { fields = JSON.parse(fields); } catch { fields = []; }
              }
              let persyaratan = t.persyaratan;
              if (typeof persyaratan === 'string') {
                try { persyaratan = JSON.parse(persyaratan); } catch { persyaratan = []; }
              }
              return (
                <div key={t.id} className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-admin-50 text-admin-700">
                        <Icon name="document" className="w-6 h-6" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-mono text-xs font-bold text-admin-700">{t.kode}</p>
                        <h3 className="mt-1 font-black text-slate-900">{t.nama}</h3>
                        <p className="mt-1 line-clamp-2 text-sm text-slate-500">{t.deskripsi}</p>
                      </div>
                    </div>
                    {t.aktif ? (
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">Aktif</span>
                    ) : (
                      <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-bold text-slate-600">Nonaktif</span>
                    )}
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                    <InfoTile label="Field" value={`${Array.isArray(fields) ? fields.length : 0}`} />
                    <InfoTile label="Berkas" value={`${Array.isArray(persyaratan) ? persyaratan.length : 0}`} />
                    <InfoTile label="HTML" value={t.file_template || '-'} mono />
                  </div>

                  <div className="mt-4 flex flex-wrap justify-end gap-2">
                    <button onClick={() => toggle(t)} className="btn-secondary text-xs">
                      {t.aktif ? 'Nonaktifkan' : 'Aktifkan'}
                    </button>
                    <Link to={`/admin/template/${t.id}/edit`} className="btn-admin-primary text-xs">
                      Edit
                    </Link>
                    <button onClick={() => remove(t)} className="btn-danger text-xs">
                      Hapus
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function InfoTile({ label, value, mono }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <p className="text-slate-400">{label}</p>
      <p className={`mt-1 truncate font-bold text-slate-700 ${mono ? 'font-mono text-[11px]' : ''}`}>{value}</p>
    </div>
  );
}
