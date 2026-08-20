import TransporteListTable from '@/components/tables/TransportListTable';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Viajes | Admin Dashboard',
  description: 'Gestión de transportes en el panel de administración',
};

export default function TransportePage() {
  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Gestion de viajes" />
      <TransporteListTable />
    </div>
  );
}
