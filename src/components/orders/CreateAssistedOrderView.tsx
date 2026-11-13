"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAssistedOrder } from "@/hooks/useAssistedOrder";
import { ArrowLeft, ShoppingCart, AlertCircle } from "lucide-react";
import { AssistedOrderClientSection } from "./AssistedOrderClientSection";
import { AssistedOrderProductsSection } from "./AssistedOrderProductsSection";
import { AssistedOrderPaymentSection } from "./AssistedOrderPaymentSection";
import { AssistedOrderSummaryCard } from "./AssistedOrderSummaryCard";
import { useCustomAlert } from "@/hooks/useCustomAlert";
import CustomAlert from "@/components/CustomAlert";

export const CreateAssistedOrderView: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialClientId = searchParams?.get("clientId") || null;
  const { alertConfig, showSuccess, showError, closeAlert } = useCustomAlert();

  const orderState = useAssistedOrder(null, () => {
    router.push("/admin");
  }, initialClientId);

  const handleSend = async () => {
    const res = await orderState.submitAssistedOrder();
    if (res.success) {
      showSuccess({
        title: "¡Pedido asistido creado con éxito!",
        message: `Orden #${res.orderNumber} registrada y procesada correctamente.`,
        confirmText: "Ir al panel",
        onConfirm: () => router.push("/admin"),
      });
    } else {
      showError({
        title: "No se pudo crear el pedido",
        message: res.message || "Por favor verifica los productos y condiciones de la orden.",
      });
    }
  };

  return (
    <div className="space-y-6 pb-28 lg:pb-12 max-w-7xl mx-auto">
      {/* Botón Volver y Badge de Rol */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Volver al panel</span>
        </button>

        <span
          className={`rounded-full px-3 py-1 text-xs font-bold w-fit ${
            orderState.isAdmin
              ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
              : "bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300"
          }`}
        >
          {orderState.isAdmin ? "Orden Administrativa (Admin)" : "Venta Asistida (Vendedor)"}
        </span>
      </div>

      {/* Título y Subtítulo */}
      <div className="flex items-center gap-3.5">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl shrink-0 ${
            orderState.isAdmin
              ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400"
              : "bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400"
          }`}
        >
          <ShoppingCart className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white leading-tight">
            Nuevo Pedido Asistido
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            {orderState.isAdmin
              ? "Emite una orden directa para cualquier cliente o vendedor de la plataforma"
              : "Emite una orden directa para un cliente asignado a tu cartera de ventas"}
          </p>
        </div>
      </div>

      {orderState.errorMessage && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 p-4 text-xs font-medium text-red-700 dark:bg-red-950/40 dark:text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{orderState.errorMessage}</span>
        </div>
      )}

      {/* Grid: 8 Columnas Formulario / 4 Columnas Resumen Sticky */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        <div className="space-y-6 lg:col-span-8">
          <AssistedOrderClientSection state={orderState} />
          <AssistedOrderProductsSection state={orderState} />
          <AssistedOrderPaymentSection state={orderState} />
        </div>

        <div className="lg:col-span-4 lg:sticky lg:top-24">
          <AssistedOrderSummaryCard state={orderState} onSubmit={handleSend} />
        </div>
      </div>

      <CustomAlert {...alertConfig} onClose={closeAlert} />
    </div>
  );
};
