"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight, Truck, Phone } from "lucide-react";
import { DriverSummary } from "@/hooks/useAdminDashboard";
import Badge from "@/components/ui/badge/Badge";

interface Props {
  drivers: DriverSummary[];
}

export const AdminDriversCard: React.FC<Props> = ({ drivers }) => {
  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Cartera de Conductores
              </h3>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                Flota
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Disponibilidad de choferes, capacidad y viajes completados
            </p>
          </div>
          <Link
            href="/admin/user"
            className="flex items-center gap-1 text-xs font-semibold text-orange-500 hover:text-orange-600 dark:text-orange-400"
          >
            Ver todos ({drivers.length}) <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-white/[0.05]">
          {drivers.slice(0, 5).map((driver) => {
            const vehicleInfo = driver.vehicle
              ? `${driver.vehicle.brand} ${driver.vehicle.model || ""} • Capacidad: ${driver.vehicle.tons || 0} Ton`
              : "Vehículo no registrado";

            return (
              <div key={driver.uid} className="flex items-center justify-between py-2.5">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                      driver.isOnRoute
                        ? "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
                        : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                    }`}
                  >
                    <Truck className="h-4 w-4" />
                  </div>

                  <div>
                    <p className="text-xs font-bold text-gray-900 dark:text-white">
                      {driver.names} {driver.lastNames}
                    </p>
                    <p className="text-[11px] text-gray-400">{vehicleInfo}</p>
                    {driver.phone && (
                      <a
                        href={`tel:${driver.phone}`}
                        className="mt-0.5 flex items-center gap-1 text-[11px] font-medium text-gray-600 hover:text-orange-600 dark:text-gray-400 dark:hover:text-orange-400"
                      >
                        <Phone className="h-2.5 w-2.5" /> {driver.phone}
                      </a>
                    )}
                  </div>
                </div>

                <div className="text-end">
                  <Badge size="sm" color={driver.isOnRoute ? "warning" : "success"}>
                    {driver.isOnRoute ? "En Ruta" : "Disponible"}
                  </Badge>
                  <p className="mt-1 text-xs font-bold text-gray-900 dark:text-white">
                    {driver.completedTripsCount} {driver.completedTripsCount === 1 ? "viaje" : "viajes"}
                  </p>
                  <span className="text-[10px] text-gray-400">
                    {driver.totalDeliveredTons} Ton entregadas
                  </span>
                </div>
              </div>
            );
          })}

          {drivers.length === 0 && (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <Truck className="h-8 w-8 text-gray-300 dark:text-gray-600" />
              <p className="mt-2 text-xs text-gray-400">No hay conductores registrados aún.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
