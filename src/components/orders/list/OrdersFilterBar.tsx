'use client';

import React from 'react';
import { Search, RotateCw } from 'lucide-react';
import { OrderFilterChips, FilterStatus } from '../logistics/OrderFilterChips';

interface OrdersFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: FilterStatus;
  onStatusFilterChange: (status: FilterStatus) => void;
  orderCounts: Record<string, number>;
  onRefresh: () => void;
  loading: boolean;
}

export const OrdersFilterBar: React.FC<OrdersFilterBarProps> = ({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  orderCounts,
  onRefresh,
  loading,
}) => {
  return (
    <div className="space-y-3 mb-4">
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        {/* Input de Búsqueda Moderno */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por cliente, # orden o teléfono..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border rounded-lg text-xs md:text-sm bg-gray-50/70 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
          />
        </div>

        {/* Botón de Actualizar estilizado */}
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

      {/* Chips de Filtro */}
      <OrderFilterChips
        activeFilter={statusFilter}
        onSelectFilter={onStatusFilterChange}
        counts={orderCounts}
      />
    </div>
  );
};
