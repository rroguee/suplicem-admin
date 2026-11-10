'use client';

import React from 'react';
import { User, AlertTriangle } from 'lucide-react';
import { Trip, isTripFractional } from './types';
import { TripRowActions } from './TripRowActions';

interface TripTableRowProps {
  trip: Trip;
  onViewDetail: (tripId: string) => void;
}

export const TripTableRow: React.FC<TripTableRowProps> = ({
  trip,
  onViewDetail,
}) => {
  const isFractional = isTripFractional(trip.tripNumber);
  const fractionNum = isFractional ? trip.tripNumber.split('-').pop() : null;

  const getStatusBadge = (status?: string | null) => {
    switch (status) {
      case 'available':
      case 'assigned':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/80 dark:bg-amber-950/30 dark:border-amber-900/60 dark:text-amber-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            {status === 'assigned' ? 'Asignado' : 'Pendiente'}
          </span>
        );
      case 'started':
      case 'in_progress':
      case 'accepted':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200/80 dark:bg-sky-950/30 dark:border-sky-900/60 dark:text-sky-300">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
            {status === 'started' ? 'Iniciado' : status === 'in_progress' ? 'En ruta' : 'Aceptado'}
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/30 dark:border-emerald-900/60 dark:text-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Finalizado
          </span>
        );
      case 'canceled':
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/80 dark:bg-rose-950/30 dark:border-rose-900/60 dark:text-rose-300">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            {status === 'rejected' ? 'Rechazado' : 'Cancelado'}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
            {status || 'Desconocido'}
          </span>
        );
    }
  };

  return (
    <tr className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-colors">
      {/* Código de Viaje y Destino */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-xs text-gray-900 dark:text-white tabular-nums">
            {trip.tripNumber}
          </span>
          {isFractional && (
            <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800">
              🧩 Fracción #{fractionNum}
            </span>
          )}
        </div>
        {trip.comments ? (
          <p
            className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 max-w-[280px] sm:max-w-md truncate"
            title={trip.comments}
          >
            {trip.comments}
          </p>
        ) : (
          <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1 italic">
            Sin notas de despacho
          </p>
        )}
      </td>

      {/* Carga y Fecha */}
      <td className="px-4 py-3.5 text-xs">
        <div className="font-bold text-gray-900 dark:text-white tabular-nums">
          ⚖️ {Number(trip.totalTons || 0).toFixed(2)} toneladas
        </div>
        <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 tabular-nums">
          📅 {new Date(trip.createdAt).toLocaleString()}
        </div>
      </td>

      {/* Conductor Asignado */}
      <td className="px-4 py-3.5 text-xs">
        {trip.driver ? (
          <div>
            <div className="flex items-center gap-1 font-semibold text-gray-900 dark:text-white">
              <User className="w-3 h-3 text-emerald-600" />
              <span>{trip.driver.names} {trip.driver.lastNames}</span>
            </div>
            {trip.driver.phone && (
              <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                📞 {trip.driver.phone}
              </div>
            )}
          </div>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/40">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            Sin conductor
          </span>
        )}
      </td>

      {/* Estado */}
      <td className="px-4 py-3.5 whitespace-nowrap">
        {getStatusBadge(trip.status)}
      </td>

      {/* Acciones */}
      <td className="px-4 py-3.5 text-right whitespace-nowrap">
        <TripRowActions trip={trip} onViewDetail={onViewDetail} />
      </td>
    </tr>
  );
};
