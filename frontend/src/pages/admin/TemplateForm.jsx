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
    aktif: true,
    fields: [emptyField()],
  });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

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

      <form onSubmit={submit} className="space-y-6 max-w-3xl">
        {/* Info dasar */}
        <div className="card">
          <h2 className="font-semibold mb-4">Informasi Dasar</h2>
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
                File harus ada di <code>backend/src/templates/</code>
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

        {/* Field tambahan */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold">Field Tambahan</h2>
              <p className="text-xs text-slate-500">
                Field yang harus diisi warga saat ajukan surat (di luar data identitas).
              </p>
            </div>
            <button type="button" onClick={addField} className="btn-secondary text-sm">
              <Icon name="plus" className="w-4 h-4 mr-1" /> Tambah Field
            </button>
          </div>

          <div className="space-y-3">
            {form.fields.map((f, idx) => (
              <div key={idx} className="border border-slate-200 rounded-lg p-3 bg-slate-50">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end">
                  <div className="md:col-span-3">
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Name (kode)
                    </label>
                    <input
                      value={f.name}
                      onChange={(e) => updateField(idx, 'name', e.target.value)}
                      className="input font-mono text-sm"
                      placeholder="tujuanInstansi"
                    />
                  </div>
                  <div className="md:col-span-4">
                    <label className="block text-xs font-medium text-slate-600 mb-1">Label</label>
                    <input
                      value={f.label}
                      onChange={(e) => updateField(idx, 'label', e.target.value)}
                      className="input text-sm"
                      placeholder="Tujuan Instansi"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-slate-600 mb-1">Tipe</label>
                    <select
                      value={f.type}
                      onChange={(e) => updateField(idx, 'type', e.target.value)}
                      className="input text-sm"
                    >
                      {FIELD_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2 flex items-center pb-2">
                    <label className="inline-flex items-center gap-1.5 text-sm">
                      <input
                        type="checkbox"
                        checked={!!f.required}
                        onChange={(e) => updateField(idx, 'required', e.target.checked)}
                        className="w-4 h-4 rounded"
                      />
                      Wajib
                    </label>
                  </div>
                  <div className="md:col-span-1 flex justify-end pb-1">
                    <button
                      type="button"
                      onClick={() => removeField(idx)}
                      className="text-red-600 hover:bg-red-50 p-2 rounded"
                      title="Hapus field"
                    >
                      <Icon name="x" className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2 text-sm text-blue-900">
            <Icon name="info" className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Catatan field name</p>
              <p>
                Gunakan camelCase (contoh: <code>tujuanInstansi</code>). Sistem akan otomatis
                mengubah jadi UPPERCASE saat replace placeholder di HTML template
                (contoh: <code>{'{{TUJUANINSTANSI}}'}</code>).
              </p>
            </div>
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
