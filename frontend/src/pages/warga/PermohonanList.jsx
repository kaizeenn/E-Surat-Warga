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
      <section className="page-hero">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="page-kicker">Riwayat Warga</p>
            <h1 className="page-title">Permohonan Saya</h1>
            <p className="page-subtitle">Semua pengajuan surat tersimpan di sini. Buka detail untuk melihat status lampiran dan unduh surat jika sudah selesai.</p>
          </div>
          <Link to="/warga/ajukan" className="btn-primary self-start md:self-center">
            <Icon name="plus" className="w-4 h-4 mr-2" />
            Ajukan Baru
          </Link>
        </div>
      </section>

      <div className="table-shell p-4 md:p-6">
        {loading ? (
          <div className="empty-state text-slate-500">Memuat permohonan...</div>
        ) : list.length === 0 ? (
          <div className="empty-state">
            <Icon name="inbox" className="mx-auto mb-3 h-12 w-12 text-slate-300" />
            <p className="font-semibold text-slate-700">Belum ada permohonan</p>
            <p className="mt-1 text-sm text-slate-500">Ajukan surat pertama Anda untuk mulai menggunakan layanan.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {list.map((p) => (
              <Link
                key={p.id}
                to={`/warga/permohonan/${p.id}`}
                className="group flex flex-col gap-3 rounded-3xl border border-slate-100 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-warga-100 hover:shadow-lg md:flex-row md:items-center md:justify-between"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-warga-50 text-warga-700">
                    <Icon name="document" className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-black text-slate-900">{p.template?.nama}</div>
                    <div className="mt-1 line-clamp-2 text-sm text-slate-500">{p.keperluan}</div>
                    <div className="mt-2 text-xs font-medium text-slate-400">Diajukan {new Date(p.createdAt).toLocaleString('id-ID')}</div>
                  </div>
                </div>
                <div className="flex shrink-0 items-center justify-between gap-3 md:justify-end">
                  <StatusBadge status={p.status} />
                  <span className="inline-flex items-center rounded-2xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 group-hover:bg-warga-50 group-hover:text-warga-700">
                    Detail <Icon name="arrowRight" className="ml-1 h-4 w-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </WargaLayout>
  );
}
