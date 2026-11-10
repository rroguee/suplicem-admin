import TransporteListTable from '@/components/tables/TransportListTable';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gestión de Viajes | Suplicem Admin',
  description: 'Gestión de transportes y despachos en el panel de administración',
};

export default function TransportePage() {
  return (
    <div className="space-y-4">
      <TransporteListTable />
    </div>
  );
}
