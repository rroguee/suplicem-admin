"use client";

import React from "react";
import { DollarSign, Truck, Users, Clock } from "lucide-react";
import { formatCurrency } from "@/components/interactions/formatCurrency";

interface Props {
  metrics: {
    totalBilled: number;
    totalTons: number;
    clientsCount: number;
    pendingOrdersCount: number;
    activeDeliveriesCount?: number;
    activeTripsCount?: number;
  };
  isGlobal?: boolean;
}

export const DashboardHeroKpis: React.FC<Props> = ({ metrics, isGlobal = false }) => {
  const activeCount = metrics.activeDeliveriesCount ?? metrics.activeTripsCount ?? 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Tarjeta 1 - Facturación */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
            {isGlobal ? "Facturación Global" : "Mi Facturación"}
          </span>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-3">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {formatCurrency(metrics.totalBilled)}
          </h2>
          <p className="mt-1 flex items-center gap-1 text-xs text-gray-500 font-medium">
            <span>🏗️ Volumen:</span>
            <span className="font-bold text-gray-800 dark:text-gray-200">{metrics.totalTons} Ton</span> de cemento
          </p>
        </div>
      </div>

      {/* Tarjeta 2 - Cartera de Clientes */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
            {isGlobal ? "Cartera General" : "Mi Cartera"}
          </span>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-white/90">
            <Users className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.clientsCount}</h3>
          <p className="mt-1 text-xs text-gray-400">
            {isGlobal ? "Clientes registrados" : "Clientes asignados"}
          </p>
        </div>
      </div>

      {/* Tarjeta 3 - Pedidos en Aprobación */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500">Por Aprobar</span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400">
            <Clock className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.pendingOrdersCount}</h3>
          <p className="mt-1 text-xs text-gray-400">
            {isGlobal ? "Pendientes de aprobación" : "Pendientes de admin"}
          </p>
        </div>
      </div>

      {/* Tarjeta 4 - Despachos Activos */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500">Despachos Activos</span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
            <Truck className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{activeCount}</h3>
          <p className="mt-1 text-xs text-gray-400">Camiones en ruta</p>
        </div>
      </div>
    </div>
  );
};
