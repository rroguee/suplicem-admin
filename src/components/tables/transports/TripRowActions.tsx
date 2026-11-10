'use client';

import React from 'react';
import { Eye, Navigation } from 'lucide-react';
import { Trip } from './types';

interface TripRowActionsProps {
  trip: Trip;
  onViewDetail: (tripId: string) => void;
}

export const TripRowActions: React.FC<TripRowActionsProps> = ({
  trip,
  onViewDetail,
}) => {
  const isInProgress = trip.status === 'started' || trip.status === 'in_progress' || trip.status === 'accepted';

  return (
    <div className="flex items-center gap-1.5 justify-end">
      {/* Botón GPS Vivo para viajes activos */}
      {isInProgress && (
        <button
          type="button"
          onClick={() => onViewDetail(trip.id)}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-900/50 border border-sky-200 dark:border-sky-800 rounded-lg transition-all"
          title="Ver Ubicación en Vivo y Ruta"
        >
          <Navigation className="w-3.5 h-3.5 animate-pulse" />
          <span className="hidden sm:inline">GPS Vivo</span>
        </button>
      )}

      {/* Botón Ver Detalle */}
      <button
        type="button"
        onClick={() => onViewDetail(trip.id)}
        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg transition-all"
        title="Ver Detalle Completo del Viaje"
      >
        <Eye className="w-3.5 h-3.5 text-gray-500" />
        <span>Detalle</span>
      </button>
    </div>
  );
};
