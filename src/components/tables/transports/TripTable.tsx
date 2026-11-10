'use client';

import React from 'react';
import { Trip } from './types';
import { TripTableRow } from './TripTableRow';
import Pagination from '../Pagination';

interface TripTableProps {
  trips: Trip[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onViewDetail: (tripId: string) => void;
}

export const TripTable: React.FC<TripTableProps> = ({
  trips,
  loading,
  error,
  currentPage,
  totalPages,
  onPageChange,
  onViewDetail,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/80 dark:border-gray-700/80 overflow-hidden shadow-xs">
      {loading && (
        <div className="p-12 text-center text-xs text-gray-500 dark:text-gray-400 flex flex-col items-center justify-center gap-2">
          <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <span>Cargando viajes y estados de flota...</span>
        </div>
      )}

      {error && (
        <div className="p-6 text-center text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {!loading && !error && trips.length === 0 && (
        <div className="p-12 text-center text-xs text-gray-500 dark:text-gray-400">
          No se encontraron viajes con los filtros seleccionados.
        </div>
      )}

      {!loading && !error && trips.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 dark:bg-gray-700/40 border-b border-gray-200/80 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-[11px] uppercase tracking-wider font-semibold">
                <th className="px-4 py-3">Viaje & Destino</th>
                <th className="px-4 py-3">Carga & Fecha</th>
                <th className="px-4 py-3">Conductor</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {trips.map((trip) => (
                <TripTableRow
                  key={trip.id}
                  trip={trip}
                  onViewDetail={onViewDetail}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Paginación */}
      {!loading && !error && trips.length > 0 && totalPages > 1 && (
        <div className="p-3.5 border-t border-gray-100 dark:border-gray-700/60 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
};
