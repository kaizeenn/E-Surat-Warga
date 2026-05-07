import Layout from '../../components/Layout';

const MENU = [
  { to: '/warga', icon: 'chartBar', label: 'Dashboard' },
  { to: '/warga/ajukan', icon: 'plus', label: 'Ajukan Surat' },
  { to: '/warga/permohonan', icon: 'list', label: 'Permohonan Saya', matchPrefix: '/warga/permohonan' },
  { to: '/warga/profil', icon: 'user', label: 'Profil' },
];

export default function WargaLayout({ children }) {
  return <Layout variant="warga" menuItems={MENU}>{children}</Layout>;
}
