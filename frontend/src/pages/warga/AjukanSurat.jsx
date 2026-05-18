import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import WargaLayout from './WargaLayout';
import Icon from '../../components/Icon';

export default function AjukanSurat() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [selected, setSelected] = useState(null);
  const [keperluan, setKeperluan] = useState('');
  const [dataTambahan, setDataTambahan] = useState({});
  const [persyaratanFiles, setPersyaratanFiles] = useState({});
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    api.get('/surat/template').then((res) => {
      const data = res.data.data.map((t) => {
        const fieldsRaw = typeof t.fields === 'string' ? JSON.parse(t.fields) : (t.fields || []);
        const persyaratanRaw = typeof t.persyaratan === 'string' ? JSON.parse(t.persyaratan) : (t.persyaratan || []);
        const fields = fieldsRaw.filter((f) => !['formulirPermohonan', 'suratPengantarRtRw'].includes(f.name));
        const persyaratan = persyaratanRaw
          .map((item, idx) => ({
            key: item.key || `persyaratan_${idx + 1}`,
            label: item.label || item.nama || `Persyaratan ${idx + 1}`,
            required: item.required ?? item.wajib ?? false,
            note: item.note || item.catatan || '',
          }))
          .filter((item) => item.key !== 'formulir_permohonan' && item.key !== 'surat_pengantar_rt_rw');
        return { ...t, fields, persyaratan };
      });
      setTemplates(data);
    });
  }, []);

  const pickTemplate = (tpl) => {
    setSelected(tpl);
    setDataTambahan({});
    setPersyaratanFiles({});
    setKeperluan('');
    setStep(2);
  };

  const isStep2Valid = useMemo(() => {
    if (!selected) return false;
    const requiredFieldsFilled = selected.fields.every((f) => !f.required || String(dataTambahan[f.name] || '').trim());
    const requiredFilesFilled = selected.persyaratan?.every((p, idx) => !p.required || persyaratanFiles[`persyaratan_${idx}`]);
    return keperluan.trim() && requiredFieldsFilled && requiredFilesFilled;
  }, [selected, dataTambahan, persyaratanFiles, keperluan]);

  const submit = async () => {
    setLoading(true);
    try {
      const form = new FormData();
      form.append('templateKode', selected.kode);
      form.append('keperluan', keperluan);
      form.append('dataTambahan', JSON.stringify(dataTambahan));
      Object.entries(persyaratanFiles).forEach(([key, file]) => {
        if (file) form.append(key, file);
      });

      await api.post('/surat/ajukan', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
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
      <div className="mb-6 rounded-3xl border border-warga-100 bg-gradient-to-br from-warga-50 via-white to-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            {step > 1 && (
              <button onClick={() => setStep(step - 1)} className="btn-secondary text-sm shrink-0">
                <Icon name="arrowLeft" className="w-4 h-4 mr-1" /> Kembali
              </button>
            )}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-warga-700">Layanan Surat Desa</p>
              <h1 className="mt-1 text-2xl font-bold text-slate-900">Ajukan Permohonan Surat</h1>
              <p className="mt-1 text-sm text-slate-500">
                Isi data secara lengkap, upload berkas persyaratan, lalu kirim untuk diverifikasi admin desa.
              </p>
            </div>
          </div>
          <div className="rounded-2xl bg-white/80 px-4 py-3 text-sm shadow-sm border border-slate-100">
            <span className="font-semibold text-warga-700">Langkah {step} dari 3</span>
            <p className="text-slate-500">{step === 1 ? 'Pilih jenis surat' : step === 2 ? 'Isi formulir' : 'Preview & kirim'}</p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          {[
            ['Pilih Surat', 'document'],
            ['Isi Data', 'edit'],
            ['Kirim', 'check'],
          ].map(([label, icon], idx) => {
            const s = idx + 1;
            const active = s <= step;
            return (
              <div key={label} className={`rounded-2xl border p-3 ${active ? 'border-warga-200 bg-warga-50 text-warga-800' : 'border-slate-200 bg-white text-slate-400'}`}>
                <div className="flex items-center gap-2">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full ${active ? 'bg-warga-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                    <Icon name={icon} className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-semibold hidden sm:inline">{label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Pilih Jenis Surat</h2>
            <p className="text-sm text-slate-500">Pilih layanan surat sesuai kebutuhan Anda.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => pickTemplate(t)}
                className="group rounded-3xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-warga-300 hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-warga-100 text-warga-700 group-hover:bg-warga-600 group-hover:text-white transition-colors">
                    <Icon name="document" className="w-6 h-6" />
                  </div>
                  <Icon name="arrowRight" className="w-5 h-5 text-slate-300 group-hover:text-warga-600" />
                </div>
                <h3 className="mt-4 font-bold text-slate-900">{t.nama}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{t.deskripsi}</p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">{t.fields?.length || 0} data diisi</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">{t.persyaratan?.length || 0} berkas</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && selected && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <section className="card overflow-hidden">
              <div className="mb-5 flex items-start gap-3 border-b border-slate-100 pb-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-warga-100 text-warga-700">
                  <Icon name="document" className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{selected.nama}</h2>
                  <p className="text-sm text-slate-500">Lengkapi data surat di bawah ini.</p>
                </div>
              </div>

              <div className="space-y-5">
                <FieldBlock
                  label="Keperluan Surat"
                  required
                  hint="Contoh: untuk kebutuhan administrasi sekolah, pekerjaan, bank, atau instansi tertentu."
                >
                  <textarea
                    className="input min-h-[96px] resize-y"
                    rows="3"
                    placeholder="Tuliskan keperluan surat dengan singkat dan jelas"
                    value={keperluan}
                    onChange={(e) => setKeperluan(e.target.value)}
                  />
                </FieldBlock>

                {selected.fields.map((f) => (
                  <FieldBlock key={f.name} label={f.label} required={f.required}>
                    {f.type === 'textarea' ? (
                      <textarea
                        className="input min-h-[96px] resize-y"
                        rows="3"
                        required={f.required}
                        placeholder={`Masukkan ${f.label.toLowerCase()}`}
                        value={dataTambahan[f.name] || ''}
                        onChange={(e) => setDataTambahan((s) => ({ ...s, [f.name]: e.target.value }))}
                      />
                    ) : (
                      <input
                        type={f.type || 'text'}
                        className="input"
                        required={f.required}
                        placeholder={`Masukkan ${f.label.toLowerCase()}`}
                        value={dataTambahan[f.name] || ''}
                        onChange={(e) => setDataTambahan((s) => ({ ...s, [f.name]: e.target.value }))}
                      />
                    )}
                  </FieldBlock>
                ))}
              </div>
            </section>

            {selected.persyaratan?.length > 0 && (
              <section className="card">
                <div className="mb-5 flex items-start gap-3 border-b border-slate-100 pb-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                    <Icon name="archive" className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Upload Lampiran Persyaratan</h2>
                    <p className="text-sm text-slate-500">Format yang didukung: PDF, JPG, PNG, WEBP. Maksimal 5MB per file.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selected.persyaratan.map((item, idx) => {
                    const field = `persyaratan_${idx}`;
                    const pickedFile = persyaratanFiles[field];
                    return (
                      <label
                        key={field}
                        className={`group cursor-pointer rounded-2xl border-2 border-dashed p-4 transition-all ${pickedFile ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-slate-50 hover:border-warga-300 hover:bg-warga-50'}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${pickedFile ? 'bg-emerald-100 text-emerald-700' : 'bg-white text-slate-500'}`}>
                            <Icon name={pickedFile ? 'check' : 'plus'} className="w-5 h-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-slate-900">{item.label}</p>
                              {item.required && <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-700">Wajib</span>}
                            </div>
                            {item.note && <p className="mt-1 text-xs text-slate-500">{item.note}</p>}
                            <p className={`mt-2 truncate text-sm ${pickedFile ? 'font-medium text-emerald-700' : 'text-slate-400'}`}>
                              {pickedFile ? pickedFile.name : 'Klik untuk memilih file'}
                            </p>
                          </div>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          required={item.required}
                          onChange={(e) => setPersyaratanFiles((s) => ({ ...s, [field]: e.target.files?.[0] || null }))}
                          accept=".pdf,.jpg,.jpeg,.png,.webp"
                        />
                      </label>
                    );
                  })}
                </div>
              </section>
            )}

            <button
              disabled={!isStep2Valid}
              onClick={() => setStep(3)}
              className="btn-primary w-full py-3 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Lanjut ke Preview
              <Icon name="arrowRight" className="w-4 h-4 ml-2" />
            </button>
          </div>

          <aside className="space-y-4">
            <div className="card bg-slate-900 text-white">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                  <Icon name="info" className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold">Tips Pengisian</h3>
                  <p className="text-xs text-slate-300">Pastikan data sesuai dokumen asli.</p>
                </div>
              </div>
              <ul className="mt-4 space-y-3 text-sm text-slate-200">
                <li className="flex gap-2"><Icon name="check" className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" /> Gunakan nomor KK yang benar.</li>
                <li className="flex gap-2"><Icon name="check" className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" /> Upload berkas yang jelas dan tidak buram.</li>
                <li className="flex gap-2"><Icon name="check" className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" /> NIK tidak perlu diisi ulang karena sudah dari akun warga.</li>
              </ul>
            </div>

            <div className="card">
              <h3 className="font-bold text-slate-900">Ringkasan</h3>
              <dl className="mt-4 space-y-3 text-sm">
                <SummaryRow label="Jenis Surat" value={selected.nama} />
                <SummaryRow label="Data wajib" value={`${selected.fields.filter((f) => f.required).length} item`} />
                <SummaryRow label="Lampiran wajib" value={`${selected.persyaratan.filter((p) => p.required).length} berkas`} />
                <SummaryRow label="Lampiran dipilih" value={`${Object.values(persyaratanFiles).filter(Boolean).length} berkas`} />
              </dl>
            </div>
          </aside>
        </div>
      )}

      {step === 3 && selected && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card">
            <div className="mb-5 flex items-start gap-3 border-b border-slate-100 pb-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                <Icon name="eye" className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Preview Permohonan</h2>
                <p className="text-sm text-slate-500">Periksa kembali data sebelum dikirim ke admin.</p>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <PreviewRow label="Jenis Surat" value={selected.nama} strong />
              <PreviewRow label="Keperluan" value={keperluan} />
              {selected.fields.map((f) => (
                <PreviewRow key={f.name} label={f.label} value={dataTambahan[f.name] || '-'} />
              ))}
            </div>

            {selected.persyaratan?.length > 0 && (
              <div className="mt-6">
                <h3 className="mb-3 font-bold text-slate-900">Lampiran</h3>
                <div className="space-y-2">
                  {selected.persyaratan.map((item, idx) => {
                    const field = `persyaratan_${idx}`;
                    return (
                      <div key={field} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800">{item.label}</p>
                          <p className="truncate text-slate-500">{persyaratanFiles[field]?.name || 'Belum dipilih'}</p>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${persyaratanFiles[field] ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          {persyaratanFiles[field] ? 'Siap' : 'Kosong'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <aside className="space-y-4">
            <div className="card border-amber-200 bg-amber-50">
              <div className="flex items-start gap-3">
                <Icon name="info" className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-amber-900">Sebelum Mengirim</h3>
                  <p className="mt-1 text-sm text-amber-800">
                    Setelah dikirim, permohonan akan masuk ke admin untuk diverifikasi. Status bisa dipantau di menu riwayat permohonan.
                  </p>
                </div>
              </div>
            </div>

            <div className="card space-y-3">
              <button onClick={() => setStep(2)} className="btn-secondary w-full">
                <Icon name="edit" className="w-4 h-4 mr-2" /> Edit Data
              </button>
              <button onClick={submit} disabled={loading} className="btn-primary w-full py-3 disabled:opacity-50">
                {loading ? 'Mengirim...' : 'Kirim Permohonan'}
              </button>
            </div>
          </aside>
        </div>
      )}
    </WargaLayout>
  );
}

function FieldBlock({ label, required, hint, children }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center gap-2">
        <label className="text-sm font-semibold text-slate-800">{label}</label>
        {required && <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-700">Wajib</span>}
      </div>
      {children}
      {hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex justify-between gap-3 border-b border-slate-100 pb-2 last:border-b-0 last:pb-0">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-semibold text-slate-800">{value}</dd>
    </div>
  );
}

function PreviewRow({ label, value, strong = false }) {
  return (
    <div className="grid grid-cols-1 gap-1 border-b border-slate-200 px-4 py-3 last:border-b-0 sm:grid-cols-3 sm:gap-4">
      <dt className="text-sm font-medium text-slate-500">{label}</dt>
      <dd className={`sm:col-span-2 text-sm ${strong ? 'font-bold text-slate-900' : 'text-slate-800'}`}>{value}</dd>
    </div>
  );
}
