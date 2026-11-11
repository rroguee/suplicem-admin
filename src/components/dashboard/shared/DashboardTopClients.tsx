"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight, ShoppingCart } from "lucide-react";
import { User } from "@/services/usersService";

interface Props {
  clients: User[];
  totalCount?: number;
  onNewOrder?: (client: User) => void;
  title?: string;
  subtitle?: string;
  isGlobal?: boolean;
}

export const DashboardTopClients: React.FC<Props> = ({
  clients,
  totalCount,
  onNewOrder,
  title,
  subtitle,
  isGlobal = false,
}) => {
  const displayTitle = title || (isGlobal ? "Cartera de Clientes" : "Mi Cartera de Clientes");
  const displaySubtitle =
    subtitle ||
    (isGlobal
      ? "Ferreterías y constructoras registradas en plataforma"
      : "Ferreterías y constructoras bajo tu atención directa");

  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white">{displayTitle}</h3>
          <p className="text-xs text-gray-400">{displaySubtitle}</p>
        </div>
        <Link
          href="/admin/user"
          className="flex items-center gap-1 text-xs font-semibold text-orange-500 hover:text-orange-600 dark:text-orange-400"
        >
          Ver todos ({totalCount ?? clients.length}) <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="divide-y divide-gray-100 dark:divide-white/[0.05]">
        {clients.slice(0, 5).map((c) => (
          <div key={c.uid} className="flex items-center justify-between py-2.5">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-xs font-bold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                {c.names?.[0] || "C"}
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-800 dark:text-white">
                  {c.names} {c.lastNames}
                </p>
                <p className="text-[11px] text-gray-400">
                  {c.email} {c.phone ? `• ${c.phone}` : ""}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                  c.status === "active"
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                    : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300"
                }`}
              >
                {c.status === "active" ? "Activo" : "Inactivo"}
              </span>
              {onNewOrder && c.status === "active" && (
                <button
                  type="button"
                  onClick={() => onNewOrder(c)}
                  className="flex h-6 w-6 items-center justify-center rounded-md bg-orange-50 text-orange-600 transition hover:bg-orange-100 dark:bg-orange-950/40 dark:text-orange-300"
                  title="Crear pedido asistido para este cliente"
                >
                  <ShoppingCart className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
        ))}
        {clients.length === 0 && (
          <p className="py-6 text-center text-xs text-gray-400">
            {isGlobal ? "No hay clientes registrados aún." : "No tienes clientes asignados aún."}
          </p>
        )}
      </div>
    </div>
  );
};
