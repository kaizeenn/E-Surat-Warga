import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import WargaLayout from './WargaLayout';
import Icon from '../../components/Icon';

export default function AjukanSurat() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [selected, setSelected] = useState(null); // template object
  const [keperluan, setKeperluan] = useState('');
  const [dataTambahan, setDataTambahan] = useState({});
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: pilih, 2: isi form, 3: preview

  useEffect(() => {
    api.get('/surat/template').then((res) => {
      const data = res.data.data.map((t) => ({
        ...t,
        fields: typeof t.fields === 'string' ? JSON.parse(t.fields) : (t.fields || []),
      }));
      setTemplates(data);
    });
  }, []);

  const pickTemplate = (tpl) => {
    setSelected(tpl);
    setDataTambahan({});
    setKeperluan('');
    setStep(2);
  };

  const submit = async () => {
    setLoading(true);
    try {
      await api.post('/surat/ajukan', {
        templateKode: selected.kode,
        keperluan,
        dataTambahan,
      });
      toast.success('Permohonan berhasil dikirim');
      navigate('/warga/permohonan');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengirim');
    } finally {
      setLoading(false);
    }
  };

  return (
    <WargaLayout>
      <div className="mb-6 flex items-center gap-3">
        {step > 1 && (
          <button onClick={() => setStep(step - 1)} className="btn-secondary text-sm">
            <Icon name="arrowLeft" className="w-4 h-4 mr-1" /> Kembali
          </button>
        )}
        <div>
          <h1 className="text-2xl font-bold">Ajukan Surat</h1>
          <p className="text-slate-500 text-sm">
            Langkah {step} dari 3 — {step === 1 ? 'Pilih jenis surat' : step === 2 ? 'Isi data' : 'Preview & kirim'}
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3].map((s) => (
          <div key={s} className={`flex-1 h-1.5 rounded ${s <= step ? 'bg-warga-600' : 'bg-slate-200'}`} />
        ))}
      </div>

      {/* STEP 1: pilih template */}
      {step === 1 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((t) => (
            <button
              key={t.id}
              onClick={() => pickTemplate(t)}
              className="card text-left hover:border-warga-400 hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-warga-100 rounded-lg flex items-center justify-center shrink-0">
                  <Icon name="document" className="w-5 h-5 text-warga-600" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold">{t.nama}</h3>
                  <p className="text-sm text-slate-500 mt-1">{t.deskripsi}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* STEP 2: isi form */}
      {step === 2 && selected && (
        <div className="card">
          <h2 className="font-semibold mb-4">{selected.nama}</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Keperluan *</label>
              <textarea
                className="input"
                rows="2"
                placeholder="Jelaskan tujuan/keperluan surat ini"
                value={keperluan}
                onChange={(e) => setKeperluan(e.target.value)}
              />
            </div>

            {selected.fields.map((f) => (
              <div key={f.name}>
                <label className="block text-sm font-medium mb-1">
                  {f.label} {f.required && '*'}
                </label>
                <input
                  type={f.type || 'text'}
                  className="input"
                  required={f.required}
                  value={dataTambahan[f.name] || ''}
                  onChange={(e) => setDataTambahan((s) => ({ ...s, [f.name]: e.target.value }))}
                />
              </div>
            ))}
          </div>

          <button
            disabled={!keperluan || selected.fields.some(f => f.required && !dataTambahan[f.name])}
            onClick={() => setStep(3)}
            className="btn-primary w-full mt-6"
          >
            Lanjut ke Preview
          </button>
        </div>
      )}

      {/* STEP 3: preview */}
      {step === 3 && selected && (
        <div className="card">
          <h2 className="font-semibold mb-4">Preview Permohonan</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex">
              <dt className="w-40 text-slate-500">Jenis Surat</dt>
              <dd className="flex-1 font-medium">{selected.nama}</dd>
            </div>
            <div className="flex">
              <dt className="w-40 text-slate-500">Keperluan</dt>
              <dd className="flex-1">{keperluan}</dd>
            </div>
            {selected.fields.map((f) => (
              <div className="flex" key={f.name}>
                <dt className="w-40 text-slate-500">{f.label}</dt>
                <dd className="flex-1">{dataTambahan[f.name] || '-'}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
            <Icon name="info" className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              Setelah dikirim, permohonan akan masuk ke admin untuk direview.
              Anda akan mendapat notifikasi setelah status berubah.
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={() => setStep(2)} className="btn-secondary flex-1">
              Edit
            </button>
            <button onClick={submit} disabled={loading} className="btn-primary flex-1">
              {loading ? 'Mengirim...' : 'Kirim Permohonan'}
            </button>
          </div>
        </div>
      )}
    </WargaLayout>
  );
}
