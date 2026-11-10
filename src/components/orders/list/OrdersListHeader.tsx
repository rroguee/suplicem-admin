'use client';

import React from 'react';
import { Clock, Truck, CheckCircle2, ShieldAlert } from 'lucide-react';
import { formatRD } from '@/utils/currencyUtils';

interface OrdersListHeaderProps {
  pendingCount: number;
  pendingAmount: number;
  inRouteCount: number;
  approvedCount: number;
  aiRiskCount: number;
}

export const OrdersListHeader: React.FC<OrdersListHeaderProps> = ({
  pendingCount,
  pendingAmount,
  inRouteCount,
  approvedCount,
  aiRiskCount,
}) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Gestión de Órdenes
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          Aprobación de pagos, remisiones y despacho logístico en tiempo real.
        </p>
      </div>

      {/* KPI Cards Rápidas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-white dark:bg-gray-800 border border-amber-200 dark:border-amber-900/50 rounded-xl p-2.5 px-3.5 shadow-sm">
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Por Aprobar</span>
            <Clock className="w-3.5 h-3.5" />
          </div>
          <div className="text-lg font-bold text-gray-900 dark:text-white tabular-nums mt-0.5">
            {pendingCount}{' '}
            <span className="text-[11px] font-normal text-gray-500">
              ({formatRD(pendingAmount)})
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-sky-200 dark:border-sky-900/50 rounded-xl p-2.5 px-3.5 shadow-sm">
          <div className="flex items-center justify-between text-sky-600 dark:text-sky-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">En Ruta</span>
            <Truck className="w-3.5 h-3.5" />
          </div>
          <div className="text-lg font-bold text-gray-900 dark:text-white tabular-nums mt-0.5">
            {inRouteCount}{' '}
            <span className="text-[11px] font-normal text-gray-500">viajes</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-emerald-200 dark:border-emerald-900/50 rounded-xl p-2.5 px-3.5 shadow-sm">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Aprobadas</span>
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <div className="text-lg font-bold text-gray-900 dark:text-white tabular-nums mt-0.5">
            {approvedCount}
          </div>
        </div>

        <div className={`bg-white dark:bg-gray-800 border rounded-xl p-2.5 px-3.5 shadow-sm ${
          aiRiskCount > 0 ? 'border-red-300 dark:border-red-900 bg-red-50/40 dark:bg-red-950/20' : 'border-gray-200 dark:border-gray-700'
        }`}>
          <div className="flex items-center justify-between text-red-600 dark:text-red-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Riesgo IA</span>
            <ShieldAlert className="w-3.5 h-3.5" />
          </div>
          <div className="text-lg font-bold text-gray-900 dark:text-white tabular-nums mt-0.5">
            {aiRiskCount}
          </div>
        </div>
      </div>
    </div>
  );
};
