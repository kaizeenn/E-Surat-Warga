import { Link } from 'react-router-dom';
import Icon from '../components/Icon';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-slate-50 to-warga-50">
      <div className="card max-w-2xl w-full text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-warga-100 rounded-full mb-6">
          <Icon name="document" className="w-10 h-10 text-warga-600" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Surat Warga RT/RW</h1>
        <p className="text-slate-600 mb-8">
          Generator surat keterangan otomatis. Ajukan dari rumah, terima PDF siap cetak.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link to="/login" className="btn-primary">
            <Icon name="user" className="w-5 h-5 mr-2" />
            Masuk
          </Link>
          <Link to="/register" className="btn-secondary">
            <Icon name="plus" className="w-5 h-5 mr-2" />
            Daftar Akun Warga
          </Link>
        </div>

        <p className="mt-6 text-xs text-slate-400">
          Admin RT/RW?{' '}
          <Link to="/login?as=admin" className="text-slate-500 hover:text-admin-600 hover:underline">
            Login di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
