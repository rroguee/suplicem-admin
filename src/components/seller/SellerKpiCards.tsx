"use client";

import React from "react";
import { DollarSign, Truck, Users, ShoppingCart } from "lucide-react";
import { formatCurrency } from "@/components/interactions/formatCurrency";

interface Props {
  metrics: {
    totalBilled: number;
    totalTons: number;
    clientsCount: number;
    ordersCount: number;
  };
}

export const SellerKpiCards: React.FC<Props> = ({ metrics }) => {
  const kpis = [
    {
      title: "Facturación Total",
      value: formatCurrency(metrics.totalBilled),
      subtitle: "Órdenes aprobadas o completadas",
      icon: DollarSign,
      color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400",
    },
    {
      title: "Toneladas Colocadas",
      value: `${metrics.totalTons} Ton`,
      subtitle: "Volumen de cemento asistido",
      icon: Truck,
      color: "text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400",
    },
    {
      title: "Cartera de Clientes",
      value: metrics.clientsCount,
      subtitle: "Clientes asignados activos",
      icon: Users,
      color: "text-purple-600 bg-purple-50 dark:bg-purple-950/40 dark:text-purple-400",
    },
    {
      title: "Pedidos Asistidos",
      value: metrics.ordersCount,
      subtitle: "Registrados por este vendedor",
      icon: ShoppingCart,
      color: "text-orange-600 bg-orange-50 dark:bg-orange-950/40 dark:text-orange-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => {
        const IconComponent = kpi.icon;
        return (
          <div
            key={kpi.title}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {kpi.title}
              </span>
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${kpi.color}`}>
                <IconComponent className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
                {kpi.value}
              </h3>
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                {kpi.subtitle}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
