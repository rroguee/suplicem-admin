import React from 'react';
import { Metadata } from 'next';
import { UserVerificationsScreen } from '@/components/verifications/UserVerificationsScreen';

export const metadata: Metadata = {
  title: 'Verificación de Cédulas | Suplicem Admin',
  description: 'Validación oficial y auditoría de documentos de identidad de usuarios en Suplicem.',
};

export default function UserVerificationsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <UserVerificationsScreen />
    </div>
  );
}
