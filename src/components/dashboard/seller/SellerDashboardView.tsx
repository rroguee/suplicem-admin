"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { useSellerDashboard } from "@/hooks/useSellerDashboard";
import { DashboardHeroKpis } from "../shared/DashboardHeroKpis";
import { DashboardActiveDeliveries } from "../shared/DashboardActiveDeliveries";
import { DashboardTopClients } from "../shared/DashboardTopClients";
import { DashboardRecentOrders } from "../shared/DashboardRecentOrders";
import { DashboardCompletedTrips } from "../shared/DashboardCompletedTrips";
import { User } from "@/services/usersService";

export const SellerDashboardView: React.FC = () => {
  const router = useRouter();
  const {
    user,
    loading,
    isRefreshing,
    metrics,
    clients,
    activeTrips,
    completedTrips,
    recentOrders,
    reload,
  } = useSellerDashboard();

  useEffect(() => {
    const handleOrderCreated = () => {
      reload();
    };
    if (typeof window !== "undefined") {
      window.addEventListener("order-created", handleOrderCreated);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("order-created", handleOrderCreated);
      }
    };
  }, [reload]);

  const handleOpenNewOrder = (client?: User) => {
    if (client?.uid) {
      router.push(`/admin/orders/create?clientId=${client.uid}`);
    } else {
      router.push("/admin/orders/create");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-600 border-t-transparent" />
          <p className="text-xs text-gray-500">Cargando métricas de ventas...</p>
        </div>
      </div>
    );
  }

  const sellerCode =
    user?.sellerCode ||
    (user?.uid ? `VEND-${user.uid.slice(0, 5).toUpperCase()}` : "VEND-XXXX");

  return (
    <div className="space-y-6 pb-10">
      {/* Saludo, Código de Vendedor e Indicador de Sincronización en Vivo */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-black tracking-tight text-gray-900 dark:text-white sm:text-2xl">
            Panel Comercial — {user?.names} {user?.lastNames}
          </h1>
          <p className="text-xs text-gray-500">
            Resumen de operaciones y cartera asignada •{" "}
            <span className="font-semibold text-orange-600 dark:text-orange-400">{sellerCode}</span>
          </p>
        </div>

        {/* Indicador en Vivo y Refresco Manual */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
            <span
              className={`h-2 w-2 rounded-full bg-emerald-500 ${
                isRefreshing ? "animate-ping" : "animate-pulse"
              }`}
            />
            <span>{isRefreshing ? "Sincronizando..." : "En vivo"}</span>
          </div>

          <button
            onClick={reload}
            disabled={isRefreshing}
            className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-600 shadow-sm transition hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 disabled:opacity-50"
            title="Refrescar métricas ahora"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-orange-600" : ""}`}
            />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      {/* 1. KPIs Héroe */}
      <DashboardHeroKpis metrics={metrics} isGlobal={false} />

      {/* 2. Grid de Operaciones en Tránsito y Cartera */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-stretch">
        <div className="lg:col-span-7">
          <DashboardActiveDeliveries
            trips={activeTrips}
            subtitle="Camiones con cemento en ruta hacia tus clientes"
          />
        </div>
        <div className="lg:col-span-5">
          <DashboardTopClients
            clients={clients}
            totalCount={metrics.clientsCount}
            onNewOrder={handleOpenNewOrder}
            isGlobal={false}
          />
        </div>
      </div>

      {/* 3. Grid de Pedidos Recientes y Viajes Completados de la Semana */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-stretch">
        <div className="lg:col-span-7">
          <DashboardRecentOrders orders={recentOrders} isGlobal={false} />
        </div>
        <div className="lg:col-span-5">
          <DashboardCompletedTrips trips={completedTrips} />
        </div>
      </div>
    </div>
  );
};
