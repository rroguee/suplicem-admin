'use client';

import React from 'react';
import { useUserVerifications } from '@/hooks/useUserVerifications';
import { UserVerificationCard } from './UserVerificationCard';
import { UserVerificationImageModal } from './UserVerificationImageModal';
import CustomAlert from '@/components/CustomAlert';
import { RefreshCw, ShieldAlert, Users, CheckCircle } from 'lucide-react';

export const UserVerificationsScreen: React.FC = () => {
  const {
    pendingUsers,
    aiAlertUsers,
    currentUsers,
    activeTab,
    setActiveTab,
    loading,
    selectedImage,
    setSelectedImage,
    alertConfig,
    closeAlert,
    fetchRequests,
    handleUpdateStatus,
  } = useUserVerifications();

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
            Verificación de Cédulas y Cuentas
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Valida los documentos de identidad oficiales y atiende alertas de alteración digital.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchRequests}
          disabled={loading}
          className="inline-flex items-center gap-2 self-start rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 shadow-xs hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Actualizar</span>
        </button>
      </div>

      {/* Pestañas: Pendientes y Alertas IA */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('pending')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition ${
            activeTab === 'pending'
              ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-xs'
              : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Pendientes ({pendingUsers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ai_alerts')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition ${
            activeTab === 'ai_alerts'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40'
          }`}
        >
          <ShieldAlert className="h-4 w-4" />
          <span>Alertas IA SynthID ({aiAlertUsers.length})</span>
        </button>
      </div>

      {/* Rejilla de Tarjetas o Estado Vacío */}
      {loading && currentUsers.length === 0 ? (
        <div className="py-20 text-center text-sm text-gray-400">
          Cargando solicitudes de verificación...
        </div>
      ) : currentUsers.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 py-16 px-4 text-center dark:border-gray-800 dark:bg-gray-900/30">
          <CheckCircle className="h-12 w-12 text-emerald-500 mb-3" />
          <h3 className="text-base font-bold text-gray-800 dark:text-gray-200">
            {activeTab === 'pending'
              ? 'No hay solicitudes pendientes de aprobación'
              : 'No hay cuentas con alertas de alteración IA'}
          </h3>
          <p className="mt-1 text-xs text-gray-500 max-w-sm">
            {activeTab === 'pending'
              ? 'Todos los registros nuevos han sido revisados y procesados satisfactoriamente.'
              : 'Ningún documento adjunto ha sido catalogado como sintético o adulterado por SynthID.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {currentUsers.map((u) => (
            <UserVerificationCard
              key={u.uid}
              user={u}
              onViewImage={(url) => setSelectedImage(url)}
              onApprove={(user) => handleUpdateStatus(user, 'active')}
              onReject={(user) => handleUpdateStatus(user, 'rejected')}
            />
          ))}
        </div>
      )}

      {/* Modal Visor de Cédula */}
      <UserVerificationImageModal
        imageUrl={selectedImage}
        onClose={() => setSelectedImage(null)}
      />

      {/* Modal de Alerta y Confirmación */}
      <CustomAlert
        isOpen={alertConfig.isOpen}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        onConfirm={alertConfig.onConfirm}
        onCancel={alertConfig.onCancel}
        onClose={closeAlert}
      />
    </div>
  );
};
