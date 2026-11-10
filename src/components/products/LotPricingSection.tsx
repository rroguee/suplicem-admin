"use client";

import React, { useState } from "react";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { formatCurrency } from "@/components/interactions/formatCurrency";
import { LotPricingTable } from "./LotPricingTable";
import {
  AVAILABLE_LOTS,
  formatNumberInput,
  parseFormattedNumber,
} from "@/utils/productLotUtils";

interface LotPricingSectionProps {
  basePrice: number;
  manualLotPrices: Record<string, number>;
  onUpdateManualLotPrices: (prices: Record<string, number>) => void;
}

export const LotPricingSection: React.FC<LotPricingSectionProps> = ({
  basePrice,
  manualLotPrices,
  onUpdateManualLotPrices,
}) => {
  const [selectedLot, setSelectedLot] = useState("50");
  const [inputPrice, setInputPrice] = useState("");
  const [editingLot, setEditingLot] = useState<string | null>(null);

  const selectedLotNum = parseInt(selectedLot, 10);
  const proportionalPrice = basePrice * selectedLotNum;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddPrice();
    }
  };

  const handleAddPrice = () => {
    const val = parseFormattedNumber(inputPrice);
    if (!val || val <= 0) return;

    onUpdateManualLotPrices({
      ...manualLotPrices,
      [selectedLot]: val,
    });
    handleCancelEdit();
  };

  const handleStartEdit = (lotKey: string) => {
    setEditingLot(lotKey);
    setSelectedLot(lotKey);
    setInputPrice(formatNumberInput(manualLotPrices[lotKey]));
  };

  const handleRemovePrice = (lotKey: string) => {
    const updated = { ...manualLotPrices };
    delete updated[lotKey];
    onUpdateManualLotPrices(updated);
    if (editingLot === lotKey) handleCancelEdit();
  };

  const handleCancelEdit = () => {
    setEditingLot(null);
    setInputPrice("");
  };

  const registeredLots = Object.keys(manualLotPrices)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className="border-t border-gray-100 pt-6 dark:border-gray-800">
      <div className="mb-3">
        <h4 className="text-base font-semibold text-gray-900 dark:text-white/90">
          Precios por Lote (Fraccionamiento)
        </h4>

      </div>

      {/* Escala Visual de Lotes */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
        </div>
        <div className="grid grid-cols-10 gap-1.5 p-2 bg-gray-50 rounded-xl border border-gray-200 dark:bg-gray-900 dark:border-gray-800">
          {AVAILABLE_LOTS.map((lot) => {
            const isManual = manualLotPrices[String(lot)] !== undefined;
            const isSelected = selectedLot === String(lot);
            return (
              <button
                key={lot}
                type="button"
                onClick={() => {
                  setSelectedLot(String(lot));
                  if (manualLotPrices[String(lot)]) handleStartEdit(String(lot));
                  else handleCancelEdit();
                }}
                className={`h-7 rounded-lg text-xs font-semibold tabular-nums transition ${
                  isManual
                    ? "bg-orange-500 text-white shadow-xs"
                    : isSelected
                    ? "border-2 border-orange-500 bg-white text-orange-600 dark:bg-gray-800"
                    : "border border-gray-200 bg-white text-gray-600 hover:border-orange-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                }`}
              >
                {lot}
              </button>
            );
          })}
        </div>
      </div>

      {/* Input con tecla Enter */}
      <div className="bg-gradient-to-b from-gray-50 to-white border border-gray-200 rounded-2xl p-4 shadow-xs dark:from-gray-900 dark:to-gray-800 dark:border-gray-800">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
            {editingLot ? `Editando Lote de ${Number(editingLot).toLocaleString("en-US")} fundas` : "Fijar Precio Manual"}
          </span>
          <span className="text-xs text-gray-400">
            Presiona <kbd className="px-1.5 py-0.5 rounded bg-white border border-gray-300 text-gray-700 font-mono shadow-xs dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300">Enter ↵</kbd>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-4">
            <Label>Lote</Label>
            <div className="w-full h-11 rounded-xl border border-orange-500 bg-white px-4 flex items-center justify-between text-sm font-bold text-gray-900 dark:border-orange-500 dark:bg-gray-900 dark:text-white">
              <span>{Number(selectedLot).toLocaleString("en-US")} fundas</span>
              <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">
                {((Number(selectedLot) * 42.5) / 1000).toFixed(2)} t
              </span>
            </div>
          </div>

          <div className="sm:col-span-5">
            <div className="flex items-center justify-between mb-1">
              <Label>Precio del Lote (RD$)</Label>
              <span className="text-xs text-gray-400 tabular-nums">
                Proporcional: RD$ {formatCurrency(proportionalPrice)}
              </span>
            </div>
            <Input
              type="text"
              inputMode="decimal"
              placeholder="Ej. 240,000 (Enter ↵)"
              value={inputPrice}
              onChange={(e) => setInputPrice(formatNumberInput(e.target.value))}
              onKeyDown={handleKeyDown}
            />
          </div>

          <div className="sm:col-span-3 flex gap-2">
            <Button size="sm" onClick={handleAddPrice} className="w-full">
              {editingLot ? "Actualizar ↵" : "Agregar ↵"}
            </Button>
            {editingLot && (
              <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                Cancelar
              </Button>
            )}
          </div>
        </div>
      </div>

      <LotPricingTable
        basePrice={basePrice}
        registeredLots={registeredLots}
        manualLotPrices={manualLotPrices}
        onStartEdit={handleStartEdit}
        onRemovePrice={handleRemovePrice}
      />
    </div>
  );
};
