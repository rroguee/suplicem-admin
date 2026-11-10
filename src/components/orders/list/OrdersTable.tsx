'use client';

import React from 'react';
import { ServiceOrder } from './types';
import { OrdersTableRow } from './OrdersTableRow';
import Pagination from '@/components/tables/Pagination';

interface OrdersTableProps {
  orders: ServiceOrder[];
  loading: boolean;
  error: string | null;
  isSeller: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onApprove: (order: ServiceOrder) => void;
  onReject: (orderId: string) => void;
  onViewDetails: (order: ServiceOrder) => void;
  onPlanTrips: (order: ServiceOrder) => void;
  onOpenReceipt: (imageUrl: string, orderNumber: number | string) => void;
}

export const OrdersTable: React.FC<OrdersTableProps> = ({
  orders,
  loading,
  error,
  isSeller,
  currentPage,
  totalPages,
  onPageChange,
  onApprove,
  onReject,
  onViewDetails,
  onPlanTrips,
  onOpenReceipt,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/80 dark:border-gray-700/80 overflow-hidden shadow-xs">
      {/* Estado: Error */}
      {error && (
        <div className="p-6 text-center text-sm text-red-600 dark:text-red-400">
          <p>{error}</p>
        </div>
      )}

      {/* Estado: Cargando */}
      {loading && (
        <div className="p-12 text-center text-xs text-gray-500 dark:text-gray-400 flex flex-col items-center justify-center gap-2">
          <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <span>Cargando órdenes y despachos...</span>
        </div>
      )}

      {/* Estado: Vacío */}
      {!loading && !error && orders.length === 0 && (
        <div className="p-12 text-center text-xs text-gray-500 dark:text-gray-400">
          No se encontraron órdenes con los filtros seleccionados.
        </div>
      )}

      {/* Tabla con Datos */}
      {!loading && !error && orders.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 dark:bg-gray-700/40 border-b border-gray-200/80 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-[11px] uppercase tracking-wider font-semibold">
                <th className="px-4 py-3">Orden #</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Producto(s)</th>
                <th className="px-4 py-3">Entrega / Pago</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {orders.map((order) => (
                <OrdersTableRow
                  key={order.id}
                  order={order}
                  isSeller={isSeller}
                  onApprove={onApprove}
                  onReject={onReject}
                  onViewDetails={onViewDetails}
                  onPlanTrips={onPlanTrips}
                  onOpenReceipt={onOpenReceipt}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Paginación */}
      {!loading && !error && orders.length > 0 && totalPages > 1 && (
        <div className="p-4 border-t border-gray-100 dark:border-gray-700/60 flex justify-center">
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
