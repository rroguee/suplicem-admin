"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle2, ArrowUpRight, Truck } from "lucide-react";
import Badge from "@/components/ui/badge/Badge";

export interface CompletedTripItem {
  id?: string;
  tripNumber: string;
  totalTons: number;
  clientName?: string;
  driverName?: string;
  date?: string;
}

interface Props {
  trips: CompletedTripItem[];
  title?: string;
  subtitle?: string;
}

export const DashboardCompletedTrips: React.FC<Props> = ({
  trips,
  title = "Viajes Completados",
  subtitle = "Despachos finalizados con éxito en destino",
}) => {
  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">{title}</h3>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
              Esta semana ({trips.length})
            </span>
          </div>
          <p className="text-xs text-gray-400">{subtitle}</p>
        </div>
        <Link
          href="/admin/transports"
          className="flex items-center gap-1 text-xs font-semibold text-orange-500 hover:text-orange-600 dark:text-orange-400"
        >
          Ver todos <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="divide-y divide-gray-100 dark:divide-white/[0.05]">
        {trips.slice(0, 5).map((trip) => (
          <div key={trip.id || trip.tripNumber} className="flex items-center justify-between py-2.5">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-900 dark:text-white">
                  Viaje #{trip.tripNumber}
                </p>
                <p className="text-[11px] text-gray-400">
                  {trip.clientName ? trip.clientName : "Cliente"}
                  {trip.driverName ? ` • Chofer: ${trip.driverName}` : ""}
                </p>
              </div>
            </div>

            <div className="text-end">
              <p className="text-xs font-bold text-gray-900 dark:text-white">
                {trip.totalTons} Ton
              </p>
              <Badge size="sm" color="success">
                Completado
              </Badge>
            </div>
          </div>
        ))}

        {trips.length === 0 && (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Truck className="h-8 w-8 text-gray-300 dark:text-gray-600" />
            <p className="mt-2 text-xs text-gray-400">
              No hay viajes completados en los últimos 7 días.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
