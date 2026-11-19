import React from "react";
import { BankAccount } from "@/services/bankAccountService";

interface Props {
  paymentMethod: "credit" | "transfer";
  setPaymentMethod: (method: "credit" | "transfer") => void;
  bankAccounts: BankAccount[];
  selectedBankAccountId: string;
  setSelectedBankAccountId: (id: string) => void;
  transferReference: string;
  setTransferReference: (ref: string) => void;
  creditNote: string;
  setCreditNote: (note: string) => void;
  deliveryNotes: string;
  setDeliveryNotes: (notes: string) => void;
}

export const AssistedOrderPaymentSection: React.FC<Props> = ({
  paymentMethod,
  setPaymentMethod,
  bankAccounts,
  selectedBankAccountId,
  setSelectedBankAccountId,
  transferReference,
  setTransferReference,
  creditNote,
  setCreditNote,
  deliveryNotes,
  setDeliveryNotes,
}) => {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
        3. Modalidad de Pago e Instrucciones
      </label>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setPaymentMethod("credit")}
          className={`flex-1 rounded-xl border py-2 text-xs font-bold transition shadow-xs ${
            paymentMethod === "credit"
              ? "border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300"
              : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
          }`}
        >
          Crédito Comercial
        </button>
        <button
          type="button"
          onClick={() => setPaymentMethod("transfer")}
          className={`flex-1 rounded-xl border py-2 text-xs font-bold transition shadow-xs ${
            paymentMethod === "transfer"
              ? "border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300"
              : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
          }`}
        >
          Transferencia Bancaria
        </button>
      </div>

      {paymentMethod === "transfer" && (
        <div className="space-y-2 rounded-xl border border-gray-200/80 bg-gray-50/50 p-3 dark:border-gray-800 dark:bg-gray-800/30">
          <div>
            <label className="text-[11px] font-bold text-gray-600 dark:text-gray-300">
              Cuenta Receptora Suplicem
            </label>
            <select
              value={selectedBankAccountId}
              onChange={(e) => setSelectedBankAccountId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-800 shadow-xs focus:border-orange-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="">Selecciona cuenta receptora...</option>
              {bankAccounts.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.bankName} - No. {b.accountNumber} ({b.beneficiaryName || ''})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[11px] font-bold text-gray-600 dark:text-gray-300">
              No. de Comprobante / Referencia Bancaria
            </label>
            <input
              type="text"
              value={transferReference}
              onChange={(e) => setTransferReference(e.target.value)}
              placeholder="Ej: 98452178"
              className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-900 shadow-xs focus:border-orange-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>
        </div>
      )}

      {paymentMethod === "credit" && (
        <div className="rounded-xl border border-gray-200/80 bg-gray-50/50 p-3 dark:border-gray-800 dark:bg-gray-800/30">
          <label className="text-[11px] font-bold text-gray-600 dark:text-gray-300">
            Condiciones de Crédito y Facturación (Opcional)
          </label>
          <input
            type="text"
            value={creditNote}
            onChange={(e) => setCreditNote(e.target.value)}
            placeholder="Ej: Plazo acordado 15 días tras despacho"
            className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-900 shadow-xs focus:border-orange-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>
      )}

      <div>
        <label className="text-[11px] font-bold text-gray-600 dark:text-gray-300">
          Notas de Entrega para Choferes y Almacén
        </label>
        <textarea
          value={deliveryNotes}
          onChange={(e) => setDeliveryNotes(e.target.value)}
          rows={2}
          placeholder="Ej: Entregar en horario matutino. Contactar al maestro constructor..."
          className="mt-1 w-full rounded-lg border border-gray-200 bg-white p-2.5 text-xs text-gray-900 shadow-xs focus:border-orange-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        />
      </div>
    </div>
  );
};
