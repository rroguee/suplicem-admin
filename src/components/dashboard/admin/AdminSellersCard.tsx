"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight, TrendingUp } from "lucide-react";
import { TopSellerSummary } from "@/hooks/useAdminDashboard";
import { formatCurrency } from "@/components/interactions/formatCurrency";
import Badge from "@/components/ui/badge/Badge";

interface Props {
  sellers: TopSellerSummary[];
}

export const AdminSellersCard: React.FC<Props> = ({ sellers }) => {
  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Cartera de Vendedores
              </h3>
              <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-orange-800 dark:bg-orange-950/40 dark:text-orange-300">
                Por Órdenes
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Ranking según pedidos generados por sus clientes en app y asistidas
            </p>
          </div>
          <Link
            href="/admin/user"
            className="flex items-center gap-1 text-xs font-semibold text-orange-500 hover:text-orange-600 dark:text-orange-400"
          >
            Ver todos ({sellers.length}) <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-white/[0.05]">
          {sellers.slice(0, 5).map((seller, index) => (
            <div key={seller.uid} className="flex items-center justify-between py-2.5">
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-black ${
                    index === 0
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                      : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                  }`}
                >
                  #{index + 1}
                </span>

                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-gray-900 dark:text-white">
                      {seller.names} {seller.lastNames}
                    </p>
                    <span className="text-[10px] font-semibold text-orange-600 dark:text-orange-400">
                      {seller.sellerCode}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400">
                    {seller.clientsCount} clientes asignados
                    {seller.phone ? ` • Tel: ${seller.phone}` : ""}
                  </p>
                </div>
              </div>

              <div className="text-end">
                <div className="flex items-center justify-end gap-1.5">
                  <Badge size="sm" color={seller.ordersCount > 0 ? "success" : "light"}>
                    {seller.ordersCount} {seller.ordersCount === 1 ? "pedido" : "pedidos"}
                  </Badge>
                </div>
                <p className="mt-0.5 text-xs font-bold text-gray-900 dark:text-white">
                  {formatCurrency(seller.totalBilled)}
                </p>
                <span className="text-[10px] text-gray-400">{seller.totalTons} Ton</span>
              </div>
            </div>
          ))}

          {sellers.length === 0 && (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <TrendingUp className="h-8 w-8 text-gray-300 dark:text-gray-600" />
              <p className="mt-2 text-xs text-gray-400">No hay vendedores registrados aún.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
