"use client";

import React from "react";
import { formatCurrency } from "@/components/interactions/formatCurrency";
import { UseAssistedOrderReturn } from "@/hooks/useAssistedOrder";
import { Minus, Plus, Layers } from "lucide-react";

interface Props {
  state: UseAssistedOrderReturn;
}

export const AssistedOrderProductsSection: React.FC<Props> = ({ state }) => {
  const { products, items, setItemQuantity } = state;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-700 dark:bg-orange-950/60 dark:text-orange-300">
            2
          </span>
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200">
            Productos y Lotes
          </h2>
        </div>
        <span className="text-xs text-gray-400">Precios de referencia oficiales</span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {products.map((p) => {
          const currentItem = items.find((it) => it.productId === p.id);
          const qty = currentItem?.quantity || 0;
          const productTons = Number(((qty * (p.weightKg || 42.5)) / 1000).toFixed(2));

          return (
            <div
              key={p.id}
              className={`rounded-2xl border p-4 transition space-y-3 ${
                qty > 0
                  ? "border-orange-300 bg-orange-50/20 dark:border-orange-800/80 dark:bg-orange-950/10"
                  : "border-gray-200/80 bg-white dark:border-gray-800 dark:bg-gray-800/40"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white leading-snug">{p.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Ref: <span className="font-semibold text-gray-700 dark:text-gray-200">{formatCurrency(p.price || 0)}</span> /{p.unit || "funda"}
                  </p>
                </div>
                {qty > 0 && (
                  <span className="rounded-xl bg-orange-100 dark:bg-orange-950/60 px-2.5 py-1 text-xs font-bold text-orange-700 dark:text-orange-300 shrink-0">
                    {productTons} Ton
                  </span>
                )}
              </div>

              {/* Controles de Cantidad */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setItemQuantity(p, Math.max(0, qty - 50))}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-700 transition hover:bg-gray-100 active:scale-95 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    title="Restar 50 fundas"
                  >
                    <Minus className="h-4 w-4" />
                  </button>

                  <div className="flex flex-col items-center">
                    <input
                      type="number"
                      min="0"
                      step="50"
                      value={qty === 0 ? "" : qty}
                      placeholder="0"
                      onChange={(e) => setItemQuantity(p, parseInt(e.target.value) || 0)}
                      className="w-20 h-9 rounded-xl border border-gray-200 bg-white px-2 text-center text-sm font-black text-gray-900 shadow-inner focus:border-orange-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                    <span className="text-[10px] text-gray-400 -mt-0.5 font-medium">fundas</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setItemQuantity(p, qty + 50)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-700 transition hover:bg-gray-100 active:scale-95 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    title="Sumar 50 fundas"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setItemQuantity(p, qty + 500)}
                  className="flex items-center gap-1 rounded-xl bg-orange-100 hover:bg-orange-200 px-3 py-2 text-xs font-bold text-orange-800 transition active:scale-95 dark:bg-orange-950/60 dark:text-orange-300 dark:hover:bg-orange-900/60"
                  title="Sumar lote de 500 fundas"
                >
                  <Layers className="h-3.5 w-3.5" />
                  <span>+500 Lote</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
