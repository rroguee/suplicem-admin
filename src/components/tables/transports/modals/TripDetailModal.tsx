'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import Badge from '@/components/ui/badge/Badge';
import { User, Phone, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import { Trip } from '../types';

const TripMap = dynamic(() => import('@/components/TripMap'), {
  ssr: false,
  loading: () => <div className="h-[260px] w-full animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />,
});

interface TripDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip | null;
  driverLocation: { lat: number; lng: number } | null;
  loading: boolean;
  error: string | null;
}

const TRACKING_STEPS = ['Pendiente de iniciar', 'En camino', 'Completado'];

export const TripDetailModal: React.FC<TripDetailModalProps> = ({
  isOpen,
  onClose,
  trip,
  driverLocation,
  loading,
  error,
}) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const getStepCompleted = (step: string) => {
    if (!trip) return false;
    const stepIdx = TRACKING_STEPS.indexOf(step);
    let curIdx = 0;
    if (['started', 'in_progress', 'accepted'].includes(trip.status || '')) {
      curIdx = 1;
    } else if (trip.status === 'completed') {
      curIdx = 2;
    }
    return stepIdx <= curIdx;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-3xl p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-h-[88vh] overflow-y-auto">
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3 mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Detalle del Viaje: {trip?.tripNumber || ''}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">ID: {trip?.id}</p>
        </div>
        {trip?.status && (
          <Badge size="md" color={trip.status === 'completed' ? 'success' : trip.status === 'available' ? 'warning' : 'primary'}>
            {trip.status}
          </Badge>
        )}
      </div>

      {loading && <p className="text-center py-8 text-xs text-gray-400">Cargando datos del viaje...</p>}
      {error && <p className="text-center py-8 text-xs text-red-500">{error}</p>}

      {!loading && !error && trip && (
        <div className="space-y-5">
          {/* Grid: Conductor & Seguimiento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                Conductor Asignado
              </h4>
              {trip.driver ? (
                <div className="text-xs space-y-1">
                  <div className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                    <User className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{trip.driver.names} {trip.driver.lastNames}</span>
                  </div>
                  {trip.driver.phone && (
                    <div className="flex items-center gap-2 text-gray-500">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      <span>{trip.driver.phone}</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-amber-600 italic">Sin conductor asignado para esta ruta.</p>
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                Progreso de Ruta
              </h4>
              <div className="space-y-1.5">
                {TRACKING_STEPS.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs">
                    <div className={`w-2 h-2 rounded-full ${getStepCompleted(step) ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                    <span className={getStepCompleted(step) ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-400'}>
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Órdenes del Viaje */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
              Órdenes Despachadas ({trip.orders?.length || 0})
            </h4>
            <div className="space-y-2">
              {trip.orders?.map((order, idx) => {
                const isExp = expandedIndex === idx;
                return (
                  <div key={order.id} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
                    <div
                      onClick={() => setExpandedIndex(isExp ? null : idx)}
                      className="p-3 flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750"
                    >
                      <div>
                        <span className="text-xs font-bold text-gray-900 dark:text-white">ORD-{order.orderNumber}</span>
                        <span className="text-xs text-gray-500 ml-2">({order.userNames} {order.userLastNames})</span>
                      </div>
                      {isExp ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </div>

                    {isExp && (
                      <div className="p-3 bg-gray-50/70 dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-700 text-xs space-y-2">
                        <div>
                          <p className="font-semibold text-gray-700 dark:text-gray-300">Materiales:</p>
                          {order.items?.map((it, i) => (
                            <p key={i} className="text-gray-500 pl-2">• {it.name}: {it.quantity} {it.unit}</p>
                          ))}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-700 dark:text-gray-300">Entregas:</p>
                          {order.deliveries?.map((d, di) => (
                            <div key={di} className="flex items-start gap-1.5 text-gray-500 pl-2 mt-0.5">
                              <MapPin className="w-3.5 h-3.5 text-sky-500 shrink-0 mt-0.5" />
                              <span>{d.address?.description} ({d.status === 'delivered' ? '✅ Entregado' : 'Pendiente'})</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mapa GPS */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
              Trayecto y Ubicación en Tiempo Real
            </h4>
            <div className="h-64 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
              <TripMap
                driverLocation={driverLocation}
                driverInfo={trip.driver}
                deliveries={trip.orders?.flatMap((o) =>
                  o.deliveries?.map((d) => ({
                    ...d,
                    userId: o.userId,
                    userNames: o.userNames,
                    userLastNames: o.userLastNames,
                    userPhone: o.userPhone,
                  })) || []
                ) || []}
              />
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end pt-4 mt-4 border-t border-gray-100 dark:border-gray-800">
        <Button size="sm" variant="outline" onClick={onClose}>
          Cerrar
        </Button>
      </div>
    </Modal>
  );
};
