/**
 * Badge status permohonan.
 */
const STATUS_CONFIG = {
  menunggu: { label: 'Menunggu', className: 'bg-amber-100 text-amber-800 border-amber-300' },
  diproses: { label: 'Diproses', className: 'bg-blue-100 text-blue-800 border-blue-300' },
  selesai:  { label: 'Selesai',  className: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  ditolak:  { label: 'Ditolak',  className: 'bg-red-100 text-red-800 border-red-300' },
};

export default function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, className: 'bg-slate-100 text-slate-700 border-slate-300' };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}
