"use client";

import React from "react";
import Button from "@/components/ui/button/Button";
import { formatCurrency } from "@/components/interactions/formatCurrency";
import { UseAssistedOrderReturn } from "@/hooks/useAssistedOrder";
import { ShoppingBag, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";

interface Props {
  state: UseAssistedOrderReturn;
  onSubmit: () => void;
}

export const AssistedOrderSummaryCard: React.FC<Props> = ({ state, onSubmit }) => {
  const {
    estimatedTotal,
    totalBags,
    totalTons,
    items,
    submitting,
    selectedClient,
    paymentMethod,
    deliveryType,
    isAdmin,
  } = state;

  const canSubmit = !submitting && Boolean(selectedClient) && items.length > 0;

  return (
    <>
      {/* 1. Tarjeta Lateral para Desktop / Tablet */}
      <div className="hidden lg:flex flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 space-y-5">
        <div className="border-b border-gray-100 dark:border-gray-800 pb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Resumen de la Orden
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">Liquidación preliminar</p>
        </div>

        {/* Cliente Seleccionado */}
        <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-800/60 text-xs space-y-1">
          <span className="text-[11px] font-medium text-gray-400 block">Cliente receptor:</span>
          {selectedClient ? (
            <p className="font-bold text-gray-800 dark:text-white truncate">
              {selectedClient.names} {selectedClient.lastNames}
            </p>
          ) : (
            <p className="text-gray-400 italic">No has seleccionado cliente</p>
          )}
        </div>

        {/* Desglose de Totales */}
        <div className="space-y-2.5 text-xs">
          <div className="flex justify-between text-gray-600 dark:text-gray-300">
            <span>Productos agregados:</span>
            <span className="font-semibold">{items.length} tipo(s)</span>
          </div>

          <div className="flex justify-between text-gray-600 dark:text-gray-300">
            <span>Cantidad de fundas:</span>
            <span className="font-bold text-orange-600 dark:text-orange-400">{totalBags} Fundas</span>
          </div>

          <div className="flex justify-between text-gray-600 dark:text-gray-300">
            <span>Tonelaje total:</span>
            <span className="font-bold text-gray-800 dark:text-white">{totalTons} Ton</span>
          </div>

          <div className="flex justify-between text-gray-600 dark:text-gray-300">
            <span>Modalidad de pago:</span>
            <span className="font-medium capitalize">{paymentMethod === "credit" ? "Crédito Comercial" : "Transferencia"}</span>
          </div>

          <div className="flex justify-between text-gray-600 dark:text-gray-300">
            <span>Modalidad de entrega:</span>
            <span className="font-semibold">
              {deliveryType === "almacen" ? "Retiro en Almacén" : "A Domicilio"}
            </span>
          </div>
        </div>

        {/* Monto Total */}
        <div className="border-t border-gray-100 dark:border-gray-800 pt-3">
          <span className="text-xs text-gray-400 block -mb-0.5">Monto Total Estimado</span>
          <p className="text-2xl font-black text-gray-900 dark:text-white">
            {formatCurrency(estimatedTotal)}
          </p>
          <p className="text-[10px] text-gray-400 leading-tight mt-1.5">
            * Tarifas por lote y flete liquidados definitivamente por el backend.
          </p>
        </div>

        {/* Botón de Emisión Principal */}
        <Button
          size="md"
          onClick={onSubmit}
          disabled={!canSubmit}
          className={`w-full justify-center !rounded-xl font-bold transition shadow-sm ${
            isAdmin ? "!bg-indigo-600 hover:!bg-indigo-700" : "!bg-orange-600 hover:!bg-orange-700"
          }`}
        >
          {submitting ? "Emitiendo Orden..." : "Emitir Pedido Asistido"}
        </Button>
      </div>

      {/* 2. Barra Flotante Inferior para Móviles */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/95 backdrop-blur-md p-3.5 shadow-xl dark:border-gray-800 dark:bg-gray-900/95">
        <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
          <div>
            <span className="text-[10px] text-gray-400 block">Total Estimado</span>
            <span className="text-base font-black text-gray-900 dark:text-white leading-tight">
              {formatCurrency(estimatedTotal)}
            </span>
            <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 block">
              {totalBags} Fundas ({totalTons} Ton)
            </span>
          </div>

          <Button
            size="sm"
            onClick={onSubmit}
            disabled={!canSubmit}
            className={`!py-2.5 !px-4 text-xs font-bold !rounded-xl ${
              isAdmin ? "!bg-indigo-600 hover:!bg-indigo-700" : "!bg-orange-600 hover:!bg-orange-700"
            }`}
          >
            {submitting ? "Emitiendo..." : "Emitir Pedido"}
          </Button>
        </div>
      </div>
    </>
  );
};
