'use client';

import React from 'react';

export type FilterStatus = 'Todos' | 'pending' | 'Alertas IA' | 'approved' | 'on_the_way' | 'completed' | 'rejected';

interface FilterOption {
  id: FilterStatus;
  label: string;
}

const FILTER_OPTIONS: FilterOption[] = [
  { id: 'Todos', label: 'Todas' },
  { id: 'pending', label: 'Pendientes' },
  { id: 'Alertas IA', label: '⚠️ Alertas IA' },
  { id: 'approved', label: 'Aprobadas' },
  { id: 'on_the_way', label: 'En camino' },
  { id: 'completed', label: 'Entregadas' },
  { id: 'rejected', label: 'Rechazadas' },
];

interface OrderFilterChipsProps {
  activeFilter: FilterStatus;
  onSelectFilter: (filter: FilterStatus) => void;
  counts: Record<string, number>;
}

export const OrderFilterChips: React.FC<OrderFilterChipsProps> = ({
  activeFilter,
  onSelectFilter,
  counts,
}) => {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {FILTER_OPTIONS.map((opt) => {
        const isActive = activeFilter === opt.id;
        const count = counts[opt.id] || 0;
        const isAi = opt.id === 'Alertas IA';

        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onSelectFilter(opt.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 border ${
              isActive
                ? isAi
                  ? 'bg-red-600 text-white border-red-600 shadow-sm'
                  : 'bg-orange-500 text-white border-orange-500 shadow-sm'
                : isAi
                ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100 dark:bg-red-950/20 dark:border-red-900 dark:text-red-300'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <span>{opt.label}</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                isActive
                  ? 'bg-white/30 text-white'
                  : isAi
                  ? 'bg-red-200 text-red-800 dark:bg-red-900/60 dark:text-red-200'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
