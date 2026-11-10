'use client';

import React from 'react';
import { Plus, Clock, Truck, Layers, Scale } from 'lucide-react';

interface TripListHeaderProps {
  totalTrips: number;
  pendingTrips: number;
  inRouteTrips: number;
  fractionalTrips: number;
  totalTons: number;
  onNewTrip: () => void;
  isSeller: boolean;
}

export const TripListHeader: React.FC<TripListHeaderProps> = ({
  totalTrips,
  pendingTrips,
  inRouteTrips,
  fractionalTrips,
  totalTons,
  onNewTrip,
  isSeller,
}) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Gestión de Viajes y Fletes
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          Supervisión de despachos, camiones, cubicaje de carga y trazabilidad en vivo.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        {/* KPI: Pendientes */}
        <div className="bg-white dark:bg-gray-800 border border-amber-200 dark:border-amber-900/50 rounded-xl px-3 py-2 shadow-xs flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Clock className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-semibold text-amber-700 dark:text-amber-400">Pendientes</div>
            <div className="text-base font-bold text-gray-900 dark:text-white leading-none tabular-nums mt-0.5">
              {pendingTrips}
            </div>
          </div>
        </div>

        {/* KPI: En Curso */}
        <div className="bg-white dark:bg-gray-800 border border-sky-200 dark:border-sky-900/50 rounded-xl px-3 py-2 shadow-xs flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-sky-50 dark:bg-sky-950/40 flex items-center justify-center text-sky-600 dark:text-sky-400">
            <Truck className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-semibold text-sky-700 dark:text-sky-400">En Ruta</div>
            <div className="text-base font-bold text-gray-900 dark:text-white leading-none tabular-nums mt-0.5">
              {inRouteTrips}
            </div>
          </div>
        </div>

        {/* KPI: Fraccionados */}
        <div className="bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-900/50 rounded-xl px-3 py-2 shadow-xs flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center text-purple-600 dark:text-purple-400">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-semibold text-purple-700 dark:text-purple-400">Fraccionados</div>
            <div className="text-base font-bold text-gray-900 dark:text-white leading-none tabular-nums mt-0.5">
              {fractionalTrips}
            </div>
          </div>
        </div>

        {/* KPI: Toneladas en Tránsito */}
        <div className="bg-white dark:bg-gray-800 border border-emerald-200 dark:border-emerald-900/50 rounded-xl px-3 py-2 shadow-xs flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Scale className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-semibold text-emerald-700 dark:text-emerald-400">En Tránsito</div>
            <div className="text-base font-bold text-gray-900 dark:text-white leading-none tabular-nums mt-0.5">
              {totalTons.toFixed(1)} <span className="text-[11px] font-normal text-gray-500">t</span>
            </div>
          </div>
        </div>

        {/* CTA: Nuevo Viaje */}
        {!isSeller && (
          <button
            type="button"
            onClick={onNewTrip}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 active:scale-95 rounded-xl shadow-xs transition-all h-[42px]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Nuevo Viaje</span>
          </button>
        )}
      </div>
    </div>
  );
};
