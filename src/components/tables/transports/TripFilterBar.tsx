'use client';

import React from 'react';
import { Search, RotateCw, X } from 'lucide-react';
import { TripFilterStatus } from './types';

interface FilterOption {
  id: TripFilterStatus;
  label: string;
}

const FILTER_OPTIONS: FilterOption[] = [
  { id: 'Todos', label: 'Todos' },
  { id: 'available', label: 'Pendientes' },
  { id: 'accepted', label: 'Aceptados / En Ruta' },
  { id: 'fractional', label: '🧩 Fraccionados' },
  { id: 'completed', label: 'Finalizados' },
  { id: 'canceled', label: 'Cancelados' },
];

interface TripFilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  statusFilter: TripFilterStatus;
  onStatusChange: (status: TripFilterStatus) => void;
  counts: Record<TripFilterStatus, number>;
  onRefresh: () => void;
  loading: boolean;
}

export const TripFilterBar: React.FC<TripFilterBarProps> = ({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  counts,
  onRefresh,
  loading,
}) => {
  return (
    <div className="space-y-3 mb-4">
      {/* Barra de Búsqueda y Actualización */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por código (ej. TRIP-1008), destino u orden..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-8 py-2 border rounded-lg text-xs md:text-sm bg-gray-50/70 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-xs"
          />
          {search.trim().length > 0 && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/60 shadow-xs transition-all disabled:opacity-50"
        >
          <RotateCw className={`w-3.5 h-3.5 text-gray-500 dark:text-gray-400 ${loading ? 'animate-spin' : ''}`} />
          <span>Actualizar</span>
        </button>
      </div>

      {/* Chips de Filtro con Paridad 1:1 con Suplicem Go */}
      <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1">
        {FILTER_OPTIONS.map((opt) => {
          const isActive = statusFilter === opt.id;
          const count = counts[opt.id] ?? 0;
          const isFractional = opt.id === 'fractional';

          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onStatusChange(opt.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 border ${
                isActive
                  ? isFractional
                    ? 'bg-purple-700 text-white border-purple-700 shadow-xs'
                    : 'bg-gray-900 text-white border-gray-900 shadow-xs dark:bg-white dark:text-gray-900 dark:border-white'
                  : isFractional
                  ? 'bg-purple-50/60 text-purple-700 border-purple-200 hover:bg-purple-100/60 dark:bg-purple-950/20 dark:border-purple-900/60 dark:text-purple-300'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/60'
              }`}
            >
              <span>{opt.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] tabular-nums ${
                  isActive
                    ? 'bg-white/20 text-white dark:bg-black/10 dark:text-gray-900'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
