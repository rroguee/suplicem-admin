"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Badge from "@/components/ui/badge/Badge";
import { formatCurrency } from "@/components/interactions/formatCurrency";

interface Props {
  orders: any[];
  title?: string;
  subtitle?: string;
  isGlobal?: boolean;
}

export const DashboardRecentOrders: React.FC<Props> = ({
  orders,
  title = "Últimos Pedidos",
  subtitle,
  isGlobal = false,
}) => {
  const displaySubtitle =
    subtitle ||
    (isGlobal
      ? "Ventas y pedidos recientes en toda la plataforma"
      : "Ventas y pedidos recientes de tu cartera");

  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white">{title}</h3>
          <p className="text-xs text-gray-400">{displaySubtitle}</p>
        </div>
        <Link
          href="/admin/basic-tables"
          className="flex items-center gap-1 text-xs font-semibold text-orange-500 hover:text-orange-600 dark:text-orange-400"
        >
          Ver todas <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="divide-y divide-gray-100 dark:divide-white/[0.05]">
        {orders.slice(0, 5).map((o) => {
          const total = (o.items || []).reduce(
            (s: number, it: any) => s + (it.subtotal || it.quantity * it.unitPrice || 0),
            0
          );
          return (
            <div key={o.id || o.orderNumber} className="flex items-center justify-between py-2.5">
              <div>
                <p className="text-xs font-semibold text-gray-900 dark:text-white">
                  Orden #{o.orderNumber || "S/N"}
                </p>
                <p className="text-[11px] text-gray-400">
                  {o.userNames ? `${o.userNames} ${o.userLastNames || ""}` : "Cliente"}
                </p>
              </div>
              <div className="text-end">
                <p className="text-xs font-bold text-gray-900 dark:text-white">
                  {formatCurrency(total)}
                </p>
                <Badge
                  size="sm"
                  color={
                    o.status === "completed"
                      ? "success"
                      : o.status === "approved"
                      ? "info"
                      : "warning"
                  }
                >
                  {o.status === "completed"
                    ? "Completada"
                    : o.status === "approved"
                    ? "Aprobada"
                    : "Pendiente"}
                </Badge>
              </div>
            </div>
          );
        })}
        {orders.length === 0 && (
          <p className="py-6 text-center text-xs text-gray-400">No hay pedidos recientes.</p>
        )}
      </div>
    </div>
  );
};
