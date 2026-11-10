"use client";

import React from "react";
import { formatCurrency } from "@/components/interactions/formatCurrency";

interface LotPricingTableProps {
  basePrice: number;
  registeredLots: number[];
  manualLotPrices: Record<string, number>;
  onStartEdit: (lotKey: string) => void;
  onRemovePrice: (lotKey: string) => void;
}

export const LotPricingTable: React.FC<LotPricingTableProps> = ({
  basePrice,
  registeredLots,
  manualLotPrices,
  onStartEdit,
  onRemovePrice,
}) => {
  return (
    <div className="mt-5 border border-gray-200 rounded-xl overflow-hidden shadow-xs dark:border-gray-800">
      <div className="px-5 py-3 bg-gray-50/80 border-b border-gray-200 flex items-center justify-between dark:bg-gray-800/50 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
            Lotes Personalizados
          </span>
          <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-600 text-xs font-bold tabular-nums">
            {registeredLots.length}
          </span>
        </div>
        <span className="text-xs text-gray-400">
          Los demás usan el precio base
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-700 dark:text-gray-200">
          <thead className="bg-gray-50/40 text-xs font-semibold uppercase tracking-wider text-gray-500 border-b border-gray-100 dark:border-gray-800">
            <tr>
              <th className="px-5 py-3">Lote</th>
              <th className="px-5 py-3">Precio Lote</th>
              <th className="px-5 py-3">Por Funda</th>
              <th className="px-5 py-3">vs Base</th>
              <th className="px-5 py-3 text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {registeredLots.map((lot) => {
              const price = manualLotPrices[String(lot)];
              const perBag = price / lot;
              const diff = basePrice > 0 ? ((perBag - basePrice) / basePrice) * 100 : 0;
              return (
                <tr key={lot} className="hover:bg-gray-50/60 transition dark:hover:bg-gray-800/40">
                  <td className="px-5 py-3.5 font-bold text-gray-900 dark:text-white">{lot.toLocaleString("en-US")} fundas</td>
                  <td className="px-5 py-3.5 font-bold text-gray-900 tabular-nums dark:text-white">RD$ {formatCurrency(price)}</td>
                  <td className="px-5 py-3.5 text-gray-500 tabular-nums">RD$ {formatCurrency(perBag)}</td>
                  <td className="px-5 py-3.5 tabular-nums">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${diff < 0 ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-gray-100 text-gray-600"}`}>
                      {diff > 0 ? "+" : ""}{diff.toFixed(1)}% vs base
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right space-x-2">
                    <button onClick={() => onStartEdit(String(lot))} className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-gray-200 hover:bg-gray-50 dark:border-gray-700">Editar</button>
                    <button onClick={() => onRemovePrice(String(lot))} className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-orange-200 text-orange-600 hover:bg-orange-50 dark:border-orange-900/50">Eliminar</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {registeredLots.length === 0 && (
        <div className="py-6 text-center text-sm text-gray-400">
          No has fijado precios manuales. Todos los lotes son proporcionales al precio base.
        </div>
      )}
    </div>
  );
};
