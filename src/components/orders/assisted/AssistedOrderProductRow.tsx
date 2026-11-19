import React from "react";
export interface Product {
  id: string;
  name: string;
  price: number;
  unit?: string;
  weightKg?: number;
  lotPrices?: Record<string, number>;
  [key: string]: any;
}
import { formatCurrency } from "@/components/interactions/formatCurrency";
import { Plus, Minus } from "lucide-react";

interface Props {
  product: Product;
  quantity: number;
  onSetQuantity: (product: Product, qty: number) => void;
}

export const AssistedOrderProductRow: React.FC<Props> = ({
  product,
  quantity,
  onSetQuantity,
}) => {
  const productTons = Number(((quantity * (product.weightKg || 42.5)) / 1000).toFixed(2));

  return (
    <div className="rounded-xl border border-gray-200/80 bg-white p-3 shadow-xs dark:border-gray-800 dark:bg-gray-800/40 space-y-2.5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-bold text-gray-900 dark:text-white">{product.name}</p>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
            Precio ref: {formatCurrency(product.price || 0)} /{product.unit || "funda"}
          </p>
        </div>
        {quantity > 0 && (
          <span className="rounded-lg bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 text-[11px] font-bold text-orange-600 dark:text-orange-400 shrink-0">
            {productTons} Ton
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 pt-1 border-t border-gray-100 dark:border-gray-800/60">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onSetQuantity(product, Math.max(0, quantity - 50))}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-700 dark:text-white"
            title="Restar 50 fundas"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <input
            type="number"
            min="0"
            step="50"
            value={quantity === 0 ? "" : quantity}
            onChange={(e) => {
              const val = e.target.value === "" ? 0 : parseInt(e.target.value, 10);
              onSetQuantity(product, isNaN(val) ? 0 : val);
            }}
            placeholder="0"
            className="h-8 w-16 sm:w-20 rounded-lg border border-gray-200 bg-white text-center text-xs font-bold text-gray-900 shadow-xs focus:border-orange-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
          <button
            type="button"
            onClick={() => onSetQuantity(product, quantity + 50)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-700 dark:text-white"
            title="Sumar 50 fundas"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => onSetQuantity(product, 250)}
            className="rounded-md border border-gray-200 bg-white px-1.5 py-1 text-[10px] font-bold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          >
            250
          </button>
          <button
            type="button"
            onClick={() => onSetQuantity(product, 500)}
            className="rounded-md border border-gray-200 bg-white px-1.5 py-1 text-[10px] font-bold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          >
            500
          </button>
          <button
            type="button"
            onClick={() => onSetQuantity(product, 1000)}
            className="rounded-md border border-orange-200 bg-orange-50 px-1.5 py-1 text-[10px] font-bold text-orange-700 hover:bg-orange-100 dark:border-orange-900/40 dark:bg-orange-950/40 dark:text-orange-300"
          >
            1,000
          </button>
        </div>
      </div>
    </div>
  );
};
