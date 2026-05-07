import Layout from '../../components/Layout';

const MENU = [
  { to: '/admin', icon: 'chartBar', label: 'Dashboard' },
  { to: '/admin/permohonan', icon: 'inbox', label: 'Permohonan Masuk', matchPrefix: '/admin/permohonan' },
  { to: '/admin/arsip', icon: 'archive', label: 'Arsip Surat' },
  { to: '/admin/template', icon: 'document', label: 'Kelola Template', matchPrefix: '/admin/template' },
  { to: '/admin/profil', icon: 'user', label: 'Profil' },
];

export default function AdminLayout({ children }) {
  return <Layout variant="admin" menuItems={MENU}>{children}</Layout>;
}
