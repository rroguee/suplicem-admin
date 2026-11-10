'use client';

import React from 'react';
import Button from '@/components/ui/button/Button';
import { User } from '@/services/usersService';

export interface TripItem {
  id: string;
  tripNumber?: string;
  status: string;
  totalTons?: number;
  assignedDriverId?: string;
  driverId?: string;
}

interface OrderTripsProgressCardProps {
  orderStatus: string;
  deliveryType: string;
  totalTons: number;
  deliveredTons?: number;
  trips: TripItem[];
  drivers: User[];
  onOpenPlanner: () => void;
  onAssignDriver: (trip: TripItem) => void;
  onCompletePickup: () => void;
  isProcessing?: boolean;
}

export const OrderTripsProgressCard: React.FC<OrderTripsProgressCardProps> = ({
  orderStatus,
  deliveryType,
  totalTons,
  deliveredTons = 0,
  trips,
  drivers,
  onOpenPlanner,
  onAssignDriver,
  onCompletePickup,
  isProcessing = false,
}) => {
  const isPickup = deliveryType === 'almacen';

  return (
    <div className="bg-gray-50 dark:bg-gray-700/40 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-6">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
          📦 Control Logístico de la Orden
        </h3>
        {!isPickup && orderStatus === 'approved' && (
          <Button variant="outline" size="sm" onClick={onOpenPlanner} disabled={isProcessing}>
            🔄 Replanificar / Fraccionar Viajes
          </Button>
        )}
      </div>

      {/* Resumen de Tonelaje */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4 text-center">
        <div className="bg-white dark:bg-gray-800 p-2.5 rounded border border-gray-100 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">Total Orden</p>
          <p className="text-base font-bold text-gray-900 dark:text-white">{totalTons.toFixed(2)} t</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-2.5 rounded border border-gray-100 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">Entregado</p>
          <p className="text-base font-bold text-green-600 dark:text-green-400">{deliveredTons.toFixed(2)} t</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-2.5 rounded border border-gray-100 dark:border-gray-700 col-span-2 sm:col-span-1">
          <p className="text-xs text-gray-500 dark:text-gray-400">Pendiente</p>
          <p className="text-base font-bold text-orange-600 dark:text-orange-400">
            {Math.max(0, totalTons - deliveredTons).toFixed(2)} t
          </p>
        </div>
      </div>

      {/* Retiro en Almacén */}
      {isPickup && orderStatus === 'approved' && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">🏬 Entrega en Almacén</p>
            <p className="text-xs text-amber-700 dark:text-amber-300">El cliente retira el pedido directamente.</p>
          </div>
          <Button variant="primary" size="sm" onClick={onCompletePickup} disabled={isProcessing}>
            Confirmar Retiro en Almacén
          </Button>
        </div>
      )}

      {/* Lista de Viajes (si es a domicilio) */}
      {!isPickup && trips.length > 0 && (
        <div className="space-y-2.5 mt-3">
          <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">Viajes Asociados ({trips.length}):</p>
          {trips.map((t, idx) => {
            const driverId = t.assignedDriverId || t.driverId;
            const driver = drivers.find((d) => d.uid === driverId);
            return (
              <div
                key={t.id || idx}
                className="bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-between gap-2 text-sm"
              >
                <div>
                  <span className="font-bold text-gray-900 dark:text-white">Viaje #{t.tripNumber || idx + 1}</span>
                  <span className="ml-2 text-xs text-gray-500">({t.totalTons?.toFixed(2) || '0.00'} t)</span>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                    Chofer: <span className="font-medium text-gray-800 dark:text-gray-200">{driver ? `${driver.names} ${driver.lastNames}` : 'Bolsa general (Sin asignar)'}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-xs font-semibold capitalize bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                    {t.status}
                  </span>
                  <Button variant="outline" size="sm" onClick={() => onAssignDriver(t)} disabled={isProcessing}>
                    {driver ? 'Cambiar Chofer' : 'Asignar Chofer'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
