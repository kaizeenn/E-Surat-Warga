import { Link } from 'react-router-dom';
import Icon from '../components/Icon';

/**
 * Halaman awal (landing) e-Surat Desa.
 * Tombol "Mulai" mengarahkan ke halaman login.
 */
export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-warga-50">
      {/* ===== NAVBAR ===== */}
      <header className="sticky top-0 z-20 bg-white/70 backdrop-blur border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-warga-600 text-white flex items-center justify-center">
              <Icon name="document" className="w-5 h-5" />
            </div>
            <div className="leading-tight">
              <div className="font-bold">e-Surat Desa</div>
              <div className="text-xs text-slate-500">Layanan Surat Digital</div>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-7 text-sm text-slate-600">
            <a href="#fitur" className="hover:text-warga-700">Fitur</a>
            <a href="#cara-kerja" className="hover:text-warga-700">Cara Kerja</a>
            <a href="#jenis-surat" className="hover:text-warga-700">Jenis Surat</a>
          </nav>

          <Link to="/login" className="btn-primary px-4 py-2 text-sm">
            Masuk
            <Icon name="arrowRight" className="w-4 h-4 ml-1.5" />
          </Link>
        </div>
      </header>

      {/* ===== HERO ===== */}
      <section className="max-w-6xl mx-auto px-6 pt-14 pb-20">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-warga-100 text-warga-700 text-xs font-medium px-3 py-1 rounded-full mb-5">
              <Icon name="sparkles" className="w-4 h-4" />
              Layanan Administrasi Warga
            </div>

            <h1 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight text-slate-900">
              Urus surat desa{' '}
              <span className="text-warga-600">tanpa antre</span>,
              langsung dari rumah.
            </h1>

            <p className="mt-5 text-slate-600 text-lg leading-relaxed">
              e-Surat Desa mempermudah warga mengajukan surat keterangan
              secara online — cepat, rapi, dan langsung jadi PDF resmi
              tanpa perlu datang ke kantor.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/login" className="btn-primary px-6 py-3 text-base shadow-sm">
                Mulai Sekarang
                <Icon name="arrowRight" className="w-5 h-5 ml-2" />
              </Link>
              <Link to="/register" className="btn-secondary px-6 py-3 text-base">
                Daftar Akun Warga
              </Link>
            </div>

            <div className="mt-6 flex items-center gap-5 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <Icon name="check" className="w-4 h-4 text-emerald-600" />
                Gratis untuk warga
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Icon name="check" className="w-4 h-4 text-emerald-600" />
                PDF otomatis
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Icon name="check" className="w-4 h-4 text-emerald-600" />
                TTD digital
              </span>
            </div>
          </div>

          {/* Ilustrasi kartu surat */}
          <div className="relative">
            <div className="absolute -inset-6 bg-warga-200/40 rounded-3xl blur-2xl" />
            <div className="relative bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
              <div className="flex items-center justify-between pb-4 border-b border-dashed border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-md bg-warga-100 text-warga-700 flex items-center justify-center">
                    <Icon name="building" className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Pemerintah Desa</div>
                    <div className="text-sm font-semibold">RT 003 / RW 005</div>
                  </div>
                </div>
                <div className="text-[10px] font-mono text-slate-400">
                  001/DOM-RT003/V/2026
                </div>
              </div>

              <div className="mt-4 text-center">
                <div className="uppercase text-sm font-semibold tracking-wide">
                  Surat Keterangan Domisili
                </div>
                <div className="mt-3 h-2 w-2/3 bg-slate-100 rounded mx-auto" />
                <div className="mt-2 h-2 w-5/6 bg-slate-100 rounded mx-auto" />
                <div className="mt-2 h-2 w-4/6 bg-slate-100 rounded mx-auto" />
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
                <InfoCell label="Nama" value="Budi Santoso" />
                <InfoCell label="NIK" value="3201020202020001" />
                <InfoCell label="Pekerjaan" value="Wiraswasta" />
                <InfoCell label="Status" value="Disetujui" accent />
              </div>

              <div className="mt-5 flex items-end justify-between">
                <div className="text-[11px] text-slate-500 leading-snug">
                  Diterbitkan<br />
                  {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
                <div className="text-center">
                  <div className="w-20 h-10 border-b border-slate-400 mb-1 flex items-end justify-center">
                    <Icon name="signature" className="w-10 h-7 text-slate-700" />
                  </div>
                  <div className="text-[11px] font-semibold">Ketua RT</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FITUR ===== */}
      <section id="fitur" className="bg-white border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="text-xs font-semibold tracking-wider text-warga-600 uppercase">Fitur Utama</div>
            <h2 className="mt-2 text-3xl font-bold">Semua yang dibutuhkan dalam satu aplikasi</h2>
            <p className="mt-3 text-slate-600">
              Semua kemudahan untuk warga dalam mengurus surat keterangan.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Feature
              icon="bolt"
              title="Pengajuan Online"
              desc="Warga cukup mengisi formulir dari rumah. Tidak perlu antre di kantor."
            />
            <Feature
              icon="document"
              title="PDF Otomatis"
              desc="Sistem menerbitkan surat dalam format PDF profesional lengkap dengan kop."
            />
            <Feature
              icon="signature"
              title="Tanda Tangan Resmi"
              desc="Setiap surat yang disetujui dilengkapi tanda tangan resmi pada PDF."
            />
            <Feature
              icon="clock"
              title="Pantau Status"
              desc="Lihat status permohonan kapan saja: diajukan, disetujui, atau ditolak."
            />
            <Feature
              icon="archive"
              title="Riwayat Lengkap"
              desc="Semua surat yang pernah Anda ajukan tersimpan rapi dan bisa diunduh ulang."
            />
            <Feature
              icon="shield"
              title="Aman & Terjaga"
              desc="Data pribadi terlindungi dengan autentikasi dan password yang ter-enkripsi."
            />
          </div>
        </div>
      </section>

      {/* ===== CARA KERJA ===== */}
      <section id="cara-kerja" className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-xs font-semibold tracking-wider text-warga-600 uppercase">Cara Kerja</div>
          <h2 className="mt-2 text-3xl font-bold">Empat langkah sederhana</h2>
          <p className="mt-3 text-slate-600">
            Dari pengajuan sampai surat siap diunduh.
          </p>
        </div>

        <ol className="grid md:grid-cols-4 gap-6">
          <Step n="1" title="Daftar Akun" desc="Warga registrasi dengan NIK & data diri singkat." />
          <Step n="2" title="Ajukan Surat" desc="Pilih jenis surat, isi keperluan & data tambahan." />
          <Step n="3" title="Permohonan Disetujui" desc="Permohonan ditinjau lalu disetujui oleh pengurus." />
          <Step n="4" title="Unduh PDF" desc="Surat resmi siap cetak langsung dari dashboard." />
        </ol>
      </section>

      {/* ===== JENIS SURAT ===== */}
      <section id="jenis-surat" className="bg-white border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="text-xs font-semibold tracking-wider text-warga-600 uppercase">Jenis Surat</div>
            <h2 className="mt-2 text-3xl font-bold">Template yang siap dipakai</h2>
            <p className="mt-3 text-slate-600">
              Beragam jenis surat keterangan tersedia untuk kebutuhan warga sehari-hari.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <LetterCard
              kode="DOMISILI"
              nama="Keterangan Domisili"
              desc="Bukti tempat tinggal warga di wilayah desa/RT/RW."
            />
            <LetterCard
              kode="TIDAK_MAMPU"
              nama="Keterangan Tidak Mampu"
              desc="Untuk keringanan biaya pendidikan, kesehatan, atau bantuan sosial."
            />
            <LetterCard
              kode="USAHA"
              nama="Keterangan Usaha"
              desc="Bukti kepemilikan usaha warga di wilayah desa/RT/RW."
            />
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-warga-600 to-warga-700 text-white p-10 md:p-14 shadow-lg">
          <div className="absolute -right-10 -top-10 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -left-10 -bottom-10 w-60 h-60 bg-white/10 rounded-full blur-3xl" />

          <div className="relative max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold leading-tight">
              Siap mulai menggunakan e-Surat Desa?
            </h2>
            <p className="mt-3 text-white/90">
              Masuk ke akun Anda dan rasakan kemudahan mengurus
              surat secara digital.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/login"
                className="inline-flex items-center px-6 py-3 rounded-lg bg-white text-warga-700 font-semibold hover:bg-slate-100 transition-colors"
              >
                Mulai Sekarang
                <Icon name="arrowRight" className="w-5 h-5 ml-2" />
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center px-6 py-3 rounded-lg border border-white/60 text-white font-semibold hover:bg-white/10 transition-colors"
              >
                Daftar Akun Warga
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-warga-600 text-white flex items-center justify-center">
              <Icon name="document" className="w-4 h-4" />
            </div>
            <span className="font-medium text-slate-700">e-Surat Desa</span>
            <span className="text-slate-400">· {new Date().getFullYear()}</span>
          </div>
          <div className="text-xs">Dibuat untuk mempermudah layanan administrasi warga.</div>
        </div>
      </footer>
    </div>
  );
}

function Feature({ icon, title, desc }) {
  return (
    <div className="p-6 rounded-2xl border border-slate-200 hover:border-warga-300 hover:shadow-md transition-all bg-white">
      <div className="w-11 h-11 rounded-xl bg-warga-100 text-warga-700 flex items-center justify-center mb-4">
        <Icon name={icon} className="w-5 h-5" />
      </div>
      <h3 className="font-semibold text-slate-900">{title}</h3>
      <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">{desc}</p>
    </div>
  );
}

function Step({ n, title, desc }) {
  return (
    <li className="relative p-6 rounded-2xl bg-white border border-slate-200">
      <div className="absolute -top-4 left-5 w-9 h-9 rounded-full bg-warga-600 text-white font-bold flex items-center justify-center shadow-sm">
        {n}
      </div>
      <div className="mt-3 font-semibold text-slate-900">{title}</div>
      <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">{desc}</p>
    </li>
  );
}

function LetterCard({ kode, nama, desc }) {
  return (
    <div className="p-6 rounded-2xl bg-white border border-slate-200 hover:shadow-md transition-all">
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-lg bg-warga-50 text-warga-700 flex items-center justify-center">
          <Icon name="document" className="w-5 h-5" />
        </div>
        <span className="text-[10px] font-mono text-slate-400">{kode}</span>
      </div>
      <h3 className="mt-3 font-semibold text-slate-900">{nama}</h3>
      <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">{desc}</p>
    </div>
  );
}

function InfoCell({ label, value, accent }) {
  return (
    <div className="bg-slate-50 rounded-lg px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider text-slate-400">{label}</div>
      <div className={`font-medium ${accent ? 'text-emerald-600' : 'text-slate-800'}`}>
        {value}
      </div>
    </div>
  );
}
