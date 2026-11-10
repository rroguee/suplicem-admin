"use client";

import React from "react";
import Link from "next/link";
import { Truck, Phone, ArrowUpRight } from "lucide-react";
import Badge from "@/components/ui/badge/Badge";

interface Props {
  trips: any[];
  title?: string;
  subtitle?: string;
}

export const DashboardActiveDeliveries: React.FC<Props> = ({
  trips,
  title = "Despachos en Camino",
  subtitle = "Camiones con cemento en ruta hacia clientes",
}) => {
  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white">{title}</h3>
          <p className="text-xs text-gray-400">{subtitle}</p>
        </div>
        <Link
          href="/admin/transports"
          className="flex items-center gap-1 text-xs font-semibold text-orange-500 hover:text-orange-600 dark:text-orange-400"
        >
          Ver todos <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {trips.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-400 dark:bg-gray-800">
            <Truck className="h-6 w-6 text-gray-400 dark:text-gray-500" />
          </div>
          <p className="mt-3 text-xs font-medium text-gray-600 dark:text-gray-300">
            No hay camiones en ruta en este momento
          </p>
          <span className="text-[11px] text-gray-400">
            Todos los pedidos previos han sido completados
          </span>
        </div>
      ) : (
        <div className="divide-y divide-gray-100 dark:divide-white/[0.05]">
          {trips.slice(0, 5).map((trip) => {
            const driverName =
              trip.driverName ||
              (trip.driver ? `${trip.driver.names} ${trip.driver.lastNames || ""}`.trim() : null);
            const driverPhone = trip.driverPhone || trip.driver?.phone;

            return (
              <div
                key={trip.id || trip.tripNumber}
                className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400">
                    <Truck className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        Viaje #{trip.tripNumber}
                      </span>
                      <Badge size="sm" color={trip.status === "started" ? "success" : "info"}>
                        {trip.status === "started" ? "En Camino" : "Asignado"}
                      </Badge>
                    </div>
                    <span className="text-xs text-gray-400">Carga: {trip.totalTons} Toneladas</span>
                  </div>
                </div>

                {driverName && (
                  <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-300">
                    <span>👤 {driverName}</span>
                    {driverPhone && (
                      <a
                        href={`tel:${driverPhone}`}
                        className="flex items-center gap-1 font-semibold text-gray-700 hover:text-orange-600 dark:text-gray-300 dark:hover:text-orange-400"
                      >
                        <Phone className="h-3 w-3" /> {driverPhone}
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
