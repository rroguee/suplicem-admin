"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Users, ShoppingBag } from "lucide-react";
import { useSellerProfile } from "@/hooks/useSellerProfile";
import { SellerHeaderCard } from "./SellerHeaderCard";
import { SellerKpiCards } from "./SellerKpiCards";
import { SellerClientsTable } from "./SellerClientsTable";
import { SellerOrdersTable } from "./SellerOrdersTable";

interface Props {
  sellerId?: string | null;
}

export const SellerProfileScreen: React.FC<Props> = ({ sellerId = null }) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"clients" | "orders">("clients");

  const {
    seller,
    allSellers,
    clients,
    orders,
    loading,
    error,
    metrics,
    handleReassignClient,
  } = useSellerProfile(sellerId);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-sm text-gray-500">Cargando perfil del vendedor...</p>
        </div>
      </div>
    );
  }

  if (error || !seller) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900/50 dark:bg-red-950/20">
        <h3 className="text-lg font-semibold text-red-800 dark:text-red-400">
          {error || "No se pudo encontrar el vendedor."}
        </h3>
        <button
          onClick={() => router.push("/admin/user")}
          className="mt-4 rounded-lg bg-gray-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-gray-800 dark:bg-white dark:text-gray-900"
        >
          Volver a Usuarios
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <SellerHeaderCard seller={seller} onBack={() => router.push("/admin/user")} />

      <SellerKpiCards metrics={metrics} />

      <div className="space-y-4">
        <div className="flex border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setActiveTab("clients")}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-medium transition ${
              activeTab === "clients"
                ? "border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            <Users className="h-4 w-4" />
            Cartera de Clientes ({clients.length})
          </button>

          <button
            onClick={() => setActiveTab("orders")}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-medium transition ${
              activeTab === "orders"
                ? "border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            <ShoppingBag className="h-4 w-4" />
            Ventas Asistidas ({orders.length})
          </button>
        </div>

        {activeTab === "clients" ? (
          <SellerClientsTable
            clients={clients}
            allSellers={allSellers}
            onReassign={handleReassignClient}
          />
        ) : (
          <SellerOrdersTable orders={orders} />
        )}
      </div>
    </div>
  );
};
