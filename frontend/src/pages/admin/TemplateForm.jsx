import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import AdminLayout from './AdminLayout';
import Icon from '../../components/Icon';

const FIELD_TYPES = [
  { value: 'text', label: 'Text (1 baris)' },
  { value: 'textarea', label: 'Textarea (multi-baris)' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
];

const PLACEHOLDERS = [
  { label: 'Nama Warga', value: '{{NAMA}}' },
  { label: 'Keperluan', value: '{{KEPERLUAN}}' },
  { label: 'No. RT', value: '{{RT_NOMOR}}' },
  { label: 'No. RW', value: '{{RW_NOMOR}}' },
  { label: 'Kelurahan', value: '{{KELURAHAN}}' },
  { label: 'Kecamatan', value: '{{KECAMATAN}}' },
  { label: 'Kota', value: '{{KOTA}}' },
  { label: 'Tanggal Terbit', value: '{{TANGGAL_TERBIT}}' },
];

const SAMPLE_DATA = {
  '{{NAMA}}': 'Andi Wijaya',
  '{{KEPERLUAN}}': 'melamar pekerjaan',
  '{{RT_NOMOR}}': '02',
  '{{RW_NOMOR}}': '03',
  '{{KELURAHAN}}': 'Saronggi',
  '{{KECAMATAN}}': 'Saronggi',
  '{{KOTA}}': 'Sumenep',
  '{{TANGGAL_TERBIT}}': '6 Mei 2025',
};

const emptyField = () => ({ name: '', label: '', type: 'text', required: true });

export default function TemplateForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState({
    kode: '',
    nama: '',
    deskripsi: '',
    file_template: '',
    kalimat_penutup: '',
    aktif: true,
    fields: [emptyField()],
  });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [insertedPlaceholder, setInsertedPlaceholder] = useState(null);

  const insertPlaceholder = (placeholder) => {
    const textarea = document.getElementById('kalimat-penutup');
    if (!textarea) return;
    
    textarea.focus();
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = form.kalimat_penutup.slice(0, start);
    const after = form.kalimat_penutup.slice(end);
    const needSpaceBefore = before.length > 0 && !/\s$/.test(before);
    const needSpaceAfter = after.length > 0 && !/^\s/.test(after);
    const insert = (needSpaceBefore ? ' ' : '') + placeholder + (needSpaceAfter ? ' ' : '');
    const newValue = before + insert + after;
    
    setForm({ ...form, kalimat_penutup: newValue });
    setInsertedPlaceholder(placeholder);
    setTimeout(() => setInsertedPlaceholder(null), 600);
    
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + insert.length;
    }, 0);
  };

  const getPreviewHtml = () => {
    const raw = form.kalimat_penutup.trim();
    if (!raw) return '<span style="color: rgb(148 163 184)">Tulis kalimat penutup untuk melihat preview...</span>';
    
    let html = raw;
    Object.entries(SAMPLE_DATA).forEach(([ph, value]) => {
      const regex = new RegExp(ph.replace(/[{}]/g, '\\$&'), 'g');
      html = html.replace(regex, `<span style="background-color: rgb(209 250 229); color: rgb(5 122 85); font-weight: 500; padding: 1px 5px; border-radius: 3px;">${value}</span>`);
    });
    
    return html;
  };

  useEffect(() => {
    api.get('/admin/template/files')
      .then((res) => setFiles(res.data.data));

    if (isEdit) {
      setLoading(true);
      api.get(`/admin/template/${id}`)
        .then((res) => {
          const t = res.data.data;
          let fields = t.fields;
          if (typeof fields === 'string') {
            try { fields = JSON.parse(fields); } catch { fields = []; }
          }
          setForm({
            kode: t.kode,
            nama: t.nama,
            deskripsi: t.deskripsi || '',
            file_template: t.file_template,
            kalimat_penutup: t.kalimat_penutup || '',
            aktif: t.aktif,
            fields: Array.isArray(fields) && fields.length ? fields : [emptyField()],
          });
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const updateField = (idx, key, value) => {
    const next = [...form.fields];
    next[idx] = { ...next[idx], [key]: value };
    setForm({ ...form, fields: next });
  };

  const addField = () => setForm({ ...form, fields: [...form.fields, emptyField()] });

  const removeField = (idx) => {
    const next = form.fields.filter((_, i) => i !== idx);
    setForm({ ...form, fields: next.length ? next : [emptyField()] });
  };

  const submit = async (e) => {
    e.preventDefault();

    // Validasi field
    for (const f of form.fields) {
      if (!f.name.trim() || !f.label.trim()) {
        toast.error('Setiap field harus punya name & label');
        return;
      }
      if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(f.name)) {
        toast.error(`Nama field "${f.name}" tidak valid (huruf/angka/underscore, mulai dengan huruf)`);
        return;
      }
    }

    setSaving(true);
    try {
      const payload = { ...form, fields: form.fields };
      if (isEdit) {
        delete payload.kode; // kode tidak boleh diubah
        await api.put(`/admin/template/${id}`, payload);
        toast.success('Template diperbarui');
      } else {
        await api.post('/admin/template', payload);
        toast.success('Template dibuat');
      }
      navigate('/admin/template');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <AdminLayout><p className="text-slate-500">Memuat...</p></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center gap-3">
        <Link to="/admin/template" className="btn-secondary text-sm">
          <Icon name="arrowLeft" className="w-4 h-4 mr-1" /> Kembali
        </Link>
        <h1 className="text-2xl font-bold">
          {isEdit ? 'Edit Template' : 'Template Baru'}
        </h1>
      </div>

      <form onSubmit={submit} className="space-y-6 max-w-4xl">
        {/* Info dasar */}
        <div className="card">
          <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-4">Informasi Dasar</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Kode <span className="text-red-500">*</span>
              </label>
              <input
                name="kode"
                value={form.kode}
                onChange={onChange}
                disabled={isEdit}
                className={`input font-mono ${isEdit ? 'bg-slate-50 text-slate-500' : ''}`}
                placeholder="DOMISILI"
                required
              />
              <p className="text-xs text-slate-400 mt-1">
                Otomatis huruf besar. Tidak bisa diubah setelah dibuat.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Nama Surat <span className="text-red-500">*</span>
              </label>
              <input
                name="nama"
                value={form.nama}
                onChange={onChange}
                className="input"
                placeholder="Surat Keterangan Domisili"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Deskripsi</label>
              <textarea
                name="deskripsi"
                value={form.deskripsi}
                onChange={onChange}
                rows="2"
                className="input"
                placeholder="Penjelasan singkat fungsi surat ini"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                File Template HTML <span className="text-red-500">*</span>
              </label>
              <select
                name="file_template"
                value={form.file_template}
                onChange={onChange}
                className="input"
                required
              >
                <option value="">— Pilih file —</option>
                {files.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
              <p className="text-xs text-slate-400 mt-1">
                File harus ada di <code>backend/templates/</code>. Gunakan <code>universal.html</code> agar admin tidak perlu menulis HTML.
              </p>
            </div>
            <div className="flex items-end">
              <label className="inline-flex items-center gap-2 select-none">
                <input
                  type="checkbox"
                  name="aktif"
                  checked={form.aktif}
                  onChange={onChange}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm">Aktif (tampil ke warga)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Kalimat Penutup */}
        <div className="card">
          <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-4">Kalimat Penutup Surat</h2>
          <p className="text-xs text-slate-500 mb-3">Klik placeholder di bawah untuk sisipkan ke posisi kursor:</p>
          
          {/* Placeholder chips */}
          <div className="flex flex-wrap gap-2 mb-4">
            {PLACEHOLDERS.map((ph) => (
              <button
                key={ph.value}
                type="button"
                onClick={() => insertPlaceholder(ph.value)}
                className={`text-xs px-2.5 py-1.5 rounded-full border transition-all font-medium ${
                  insertedPlaceholder === ph.value
                    ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300 cursor-pointer'
                }`}
              >
                {ph.label}
              </button>
            ))}
          </div>

          {/* Textarea */}
          <textarea
            id="kalimat-penutup"
            name="kalimat_penutup"
            value={form.kalimat_penutup}
            onChange={onChange}
            rows="4"
            className="input mb-3 font-[inherit]"
            placeholder="Contoh: Adalah benar warga RT {{RT_NOMOR}} RW {{RW_NOMOR}} Desa {{KELURAHAN}}... untuk keperluan {{KEPERLUAN}}."
          />

          {/* Preview */}
          <div>
            <p className="text-xs font-medium text-slate-600 mb-2">Preview (simulasi dengan data contoh):</p>
            <div 
              className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm leading-relaxed text-slate-900 min-h-12"
              dangerouslySetInnerHTML={{ __html: getPreviewHtml() }}
            />
          </div>

          <p className="text-xs text-slate-500 mt-3 italic py-2 px-3 bg-slate-50 border-l-2 border-slate-300 rounded">
            Catatan: Kalimat "Demikian surat keterangan ini dibuat dengan sebenarnya untuk dapat dipergunakan sebagaimana mestinya." akan ditambahkan otomatis di akhir.
          </p>
        </div>

        {/* Field tambahan */}
        <div className="card">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Data Tambahan per Surat</h2>
              <p className="text-xs text-slate-500 mt-1">
                Nama, NIK, alamat warga sudah otomatis terisi. Tambahkan hanya data spesifik untuk surat ini.
              </p>
            </div>
            <button 
              type="button" 
              onClick={addField} 
              className="btn-secondary text-sm inline-flex items-center gap-1.5 flex-shrink-0"
            >
              <Icon name="plus" className="w-4 h-4" /> Tambah
            </button>
          </div>

          {form.fields.length > 0 && (
            <div className="space-y-2">
              {form.fields.map((f, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
                    {/* Name */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Name</label>
                      <input
                        value={f.name}
                        onChange={(e) => updateField(idx, 'name', e.target.value)}
                        className="input text-xs font-mono placeholder-slate-400"
                        placeholder="namaUsaha"
                      />
                    </div>
                    {/* Label */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Label</label>
                      <input
                        value={f.label}
                        onChange={(e) => updateField(idx, 'label', e.target.value)}
                        className="input text-xs placeholder-slate-400"
                        placeholder="Nama Usaha"
                      />
                    </div>
                    {/* Type & Required */}
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Tipe</label>
                        <select
                          value={f.type}
                          onChange={(e) => updateField(idx, 'type', e.target.value)}
                          className="input text-xs"
                        >
                          {FIELD_TYPES.map((t) => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-end">
                        <label className="inline-flex items-center gap-1.5 text-xs select-none">
                          <input
                            type="checkbox"
                            checked={!!f.required}
                            onChange={(e) => updateField(idx, 'required', e.target.checked)}
                            className="w-3.5 h-3.5 rounded"
                          />
                          <span>Wajib</span>
                        </label>
                      </div>
                    </div>
                    {/* Delete */}
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeField(idx)}
                        className="text-slate-400 hover:text-red-600 p-2 hover:bg-red-50 rounded transition"
                        title="Hapus field"
                      >
                        <Icon name="trash" className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900">
            <p className="font-medium mb-1">💡 Nama field</p>
            <p>
              Gunakan camelCase (contoh: <code className="text-blue-700 font-mono">namaUsaha</code>, <code className="text-blue-700 font-mono">tujuanInstansi</code>). 
              Sistem otomatis ubah jadi UPPERCASE saat render PDF (menjadi <code className="text-blue-700 font-mono">{'{{NAMAUSAHA}}'}</code>).
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Link to="/admin/template" className="btn-secondary">Batal</Link>
          <button type="submit" disabled={saving} className="btn-admin-primary">
            {saving ? 'Menyimpan...' : (isEdit ? 'Simpan Perubahan' : 'Buat Template')}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}
