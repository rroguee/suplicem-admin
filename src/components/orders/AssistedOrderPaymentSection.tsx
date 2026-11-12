"use client";

import React from "react";
import { UseAssistedOrderReturn } from "@/hooks/useAssistedOrder";
import { CreditCard, Landmark, FileText, Truck } from "lucide-react";

interface Props {
  state: UseAssistedOrderReturn;
}

export const AssistedOrderPaymentSection: React.FC<Props> = ({ state }) => {
  const {
    paymentMethod,
    setPaymentMethod,
    bankAccounts,
    selectedBankAccountId,
    setSelectedBankAccountId,
    creditNote,
    setCreditNote,
    transferReference,
    setTransferReference,
    deliveryNotes,
    setDeliveryNotes,
    deliveryType,
  } = state;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900 space-y-4">
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-700 dark:bg-orange-950/60 dark:text-orange-300">
          3
        </span>
        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200">
          Condiciones de Pago y Despacho
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setPaymentMethod("credit")}
          className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-bold transition ${
            paymentMethod === "credit"
              ? "border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300 shadow-xs"
              : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-300"
          }`}
        >
          <CreditCard className="h-4 w-4" />
          <span>Crédito Comercial</span>
        </button>

        <button
          type="button"
          onClick={() => setPaymentMethod("transfer")}
          className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-bold transition ${
            paymentMethod === "transfer"
              ? "border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300 shadow-xs"
              : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-300"
          }`}
        >
          <Landmark className="h-4 w-4" />
          <span>Transferencia Bancaria</span>
        </button>
      </div>

      {paymentMethod === "credit" && (
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Condiciones y Plazo de Crédito
          </label>
          <input
            type="text"
            value={creditNote}
            onChange={(e) => setCreditNote(e.target.value)}
            placeholder="Ej. Plazo 30 días, autorizado por Gerencia Comercial"
            className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs text-gray-800 shadow-xs focus:border-orange-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>
      )}

      {paymentMethod === "transfer" && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Cuenta Bancaria Suplicem
            </label>
            <select
              value={selectedBankAccountId}
              onChange={(e) => setSelectedBankAccountId(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs font-medium text-gray-800 shadow-xs focus:border-orange-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              {bankAccounts.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.bankName} - {b.accountType} ({b.accountNumber})
                </option>
              ))}
              {bankAccounts.length === 0 && <option value="">Cargando cuentas...</option>}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Referencia / Comprobante
            </label>
            <input
              type="text"
              value={transferReference}
              onChange={(e) => setTransferReference(e.target.value)}
              placeholder="Ej. Transferencia Banco Popular #948291"
              className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs text-gray-800 shadow-xs focus:border-orange-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          {deliveryType === "almacen"
            ? "Instrucciones de Retiro en Almacén (Opcional)"
            : "Instrucciones de Despacho en Obra (Opcional)"}
        </label>
        <input
          type="text"
          value={deliveryNotes}
          onChange={(e) => setDeliveryNotes(e.target.value)}
          placeholder={
            deliveryType === "almacen"
              ? "Ej. Retira camión placa L123456, autorizado Ing. Pedro Castillo"
              : "Ej. Descargar en torre B, recibir con el Ing. Pedro Castillo"
          }
          className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs text-gray-800 shadow-xs focus:border-orange-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        />
      </div>
    </div>
  );
};
