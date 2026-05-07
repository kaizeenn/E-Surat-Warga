import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { formatRemaining, formatDateTime } from '../utils/session';
import Icon from './Icon';

/**
 * Badge kecil yang menampilkan sisa waktu sesi login.
 * Klik untuk membuka popover detail (login at, expired at, sisa waktu).
 *
 * Pakai variant 'sidebar' untuk dipasang di sidebar gelap (warga/admin),
 * 'plain' untuk header terang.
 */
export default function SessionBadge({ variant = 'sidebar' }) {
  const { tokenExp, tokenIat, loginAt, remainingMs, checkSession } = useAuth();
  const [open, setOpen] = useState(false);

  if (!tokenExp) return null;

  // tentukan warna berdasarkan sisa waktu
  let dot = 'bg-emerald-400';
  let label = 'Sesi aktif';
  if (remainingMs !== null) {
    if (remainingMs <= 0) {
      dot = 'bg-rose-500';
      label = 'Sesi berakhir';
    } else if (remainingMs <= 5 * 60 * 1000) {
      dot = 'bg-amber-400';
      label = 'Sesi hampir habis';
    }
  }

  const baseBtn = variant === 'sidebar'
    ? 'flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs hover:bg-white/10 transition-colors text-white/90'
    : 'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs hover:bg-slate-100 transition-colors text-slate-700 border border-slate-200';

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          checkSession?.();
        }}
        className={baseBtn}
        title="Klik untuk lihat detail sesi"
      >
        <span className={`w-2 h-2 rounded-full ${dot} shrink-0`} />
        <span className="truncate">
          {label}: <span className="font-semibold">{formatRemaining(remainingMs)}</span>
        </span>
      </button>

      {open && (
        <div
          className={`absolute z-30 ${
            variant === 'sidebar' ? 'bottom-full left-0 mb-2 w-64' : 'top-full right-0 mt-2 w-72'
          } bg-white text-slate-800 rounded-lg shadow-xl border border-slate-200 p-4`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Icon name="shield" className="w-4 h-4 text-slate-500" />
              Detail Sesi
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-slate-400 hover:text-slate-600"
              aria-label="Tutup"
            >
              <Icon name="x" className="w-4 h-4" />
            </button>
          </div>
          <dl className="text-xs space-y-2">
            <div className="flex justify-between gap-2">
              <dt className="text-slate-500">Login pada</dt>
              <dd className="font-medium text-right">
                {loginAt ? new Date(loginAt).toLocaleString('id-ID', {
                  day: '2-digit', month: 'short', year: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                }) : (tokenIat ? formatDateTime(tokenIat) : '-')}
              </dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-slate-500">Berakhir pada</dt>
              <dd className="font-medium text-right">{formatDateTime(tokenExp)}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-slate-500">Sisa waktu</dt>
              <dd className="font-semibold text-right">{formatRemaining(remainingMs)}</dd>
            </div>
          </dl>
          <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500 leading-relaxed">
            Anda akan otomatis keluar saat sesi berakhir.
            Lakukan login ulang untuk memperpanjang.
          </div>
        </div>
      )}
    </div>
  );
}
