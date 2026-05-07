import Layout from '../../components/Layout';

const MENU = [
  { to: '/admin', icon: 'chartBar', label: 'Dashboard' },
  { to: '/admin/permohonan', icon: 'inbox', label: 'Permohonan Masuk', matchPrefix: '/admin/permohonan' },
  { to: '/admin/arsip', icon: 'archive', label: 'Arsip Surat' },
];

export default function AdminLayout({ children }) {
  return <Layout variant="admin" menuItems={MENU}>{children}</Layout>;
}
