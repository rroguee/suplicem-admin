import React from "react";
import { formatNumberInput } from "@/utils/productLotUtils";

interface Props {
  name: string;
  onChangeName: (val: string) => void;
  price: string;
  onChangePrice: (val: string) => void;
  unit: string;
  onChangeUnit: (val: string) => void;
  weightKg: string;
  onChangeWeightKg: (val: string) => void;
}

export const ProductGeneralInfoCard: React.FC<Props> = ({
  name,
  onChangeName,
  price,
  onChangePrice,
  unit,
  onChangeUnit,
  weightKg,
  onChangeWeightKg,
}) => (
  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
    <h2 className="text-base font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">
      Información General
    </h2>
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
          Nombre del Producto
        </label>
        <input
          type="text"
          placeholder="Ej. Cemento Titán (42.5 kg)"
          value={name}
          onChange={(e) => onChangeName(e.target.value)}
          className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
          Precio Unitario Base (RD$)
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-2.5 text-gray-400 font-medium text-sm">RD$</span>
          <input
            type="text"
            placeholder="510.00"
            value={price}
            onChange={(e) => onChangePrice(formatNumberInput(e.target.value))}
            className="w-full pl-12 pr-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
            Unidad
          </label>
          <input
            type="text"
            placeholder="fundas, m³..."
            value={unit}
            onChange={(e) => onChangeUnit(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
            Peso por unidad (kg)
          </label>
          <input
            type="number"
            step="0.1"
            placeholder="42.5"
            value={weightKg}
            onChange={(e) => onChangeWeightKg(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition"
          />
        </div>
      </div>
    </div>
  </div>
);
