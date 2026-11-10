'use client';

import React from 'react';
import { Check, X, Eye, MapPin } from 'lucide-react';
import { ServiceOrder } from './types';

interface OrdersRowActionsProps {
  order: ServiceOrder;
  isSeller: boolean;
  onApprove: (order: ServiceOrder) => void;
  onReject: (orderId: string) => void;
  onViewDetails: (order: ServiceOrder) => void;
  onPlanTrips?: (order: ServiceOrder) => void;
}

export const OrdersRowActions: React.FC<OrdersRowActionsProps> = ({
  order,
  isSeller,
  onApprove,
  onReject,
  onViewDetails,
  onPlanTrips,
}) => {
  const isPending = order.status === 'pending';
  const isApproved = order.status === 'approved';
  const isDomicilio = order.deliveryType === 'domicilio';

  return (
    <div className="flex items-center gap-1.5 justify-end">
      {/* Caso: PENDIENTE (CTA de Decisión Inmediata) */}
      {!isSeller && isPending && (
        <>
          <button
            type="button"
            onClick={() => onApprove(order)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 active:scale-95 rounded-md shadow-xs transition-all"
            title="Aprobar Orden"
          >
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Aprobar</span>
          </button>

          <button
            type="button"
            onClick={() => onReject(order.id)}
            className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/50 active:scale-95 border border-red-200 dark:border-red-800 rounded-md transition-all"
            title="Rechazar Orden"
          >
            <X className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Rechazar</span>
          </button>
        </>
      )}

      {/* Caso: APROBADA con Entrega a Domicilio (Acción Logística Rápida) */}
      {!isSeller && isApproved && isDomicilio && onPlanTrips && (
        <button
          type="button"
          onClick={() => onPlanTrips(order)}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-900/50 border border-sky-200 dark:border-sky-800 rounded-md transition-all"
          title="Planificar Viajes"
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Viajes</span>
        </button>
      )}

      {/* Acción Universal: Ver Detalle */}
      <button
        type="button"
        onClick={() => onViewDetails(order)}
        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-95 border border-gray-200 dark:border-gray-700 rounded-md transition-all"
        title="Ver Detalle Completo"
      >
        <Eye className="w-3.5 h-3.5 text-gray-500" />
        <span className="hidden md:inline">Detalle</span>
      </button>
    </div>
  );
};
