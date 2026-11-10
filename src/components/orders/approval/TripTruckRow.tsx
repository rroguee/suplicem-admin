import React from "react";

export interface TruckTripItem {
  id: string;
  totalTons: number;
  driverId?: string;
  driverName?: string;
  comments?: string;
  deliveryId?: string;
}

interface Props {
  truck: TruckTripItem;
  index: number;
  drivers: Array<{ uid: string; names?: string; lastNames?: string }>;
  onUpdateTons: (tons: number) => void;
  onSelectDriver: (driverId: string) => void;
  onRemove: () => void;
  canRemove: boolean;
}

export const TripTruckRow: React.FC<Props> = ({
  truck,
  index,
  drivers,
  onUpdateTons,
  onSelectDriver,
  onRemove,
  canRemove,
}) => {
  const estFundas = Math.round((truck.totalTons * 1000) / 42.5);

  return (
    <div className="bg-gray-50 dark:bg-gray-800/60 rounded-lg p-4 border border-gray-200 dark:border-gray-700 mb-3">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <span className="text-base">🚚</span>
          <span className="font-bold text-sm text-gray-900 dark:text-white">
            Camión #{index + 1}
          </span>
        </div>

        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-red-500 hover:text-red-700 text-sm font-semibold p-1"
            title="Eliminar este camión"
          >
            ✕ Eliminar
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        {/* Toneladas y fundas estimadas */}
        <div>
          <label className="block text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1">
            Carga (Toneladas)
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onUpdateTons(Math.max(1, Number((truck.totalTons - 1).toFixed(2))))}
              className="px-2.5 py-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded text-sm font-bold text-gray-800 dark:text-gray-200"
            >
              -1
            </button>
            <input
              type="number"
              step="0.5"
              min="1"
              value={truck.totalTons}
              onChange={(e) => onUpdateTons(parseFloat(e.target.value) || 0)}
              className="w-24 px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-center font-bold text-gray-900 dark:text-white bg-white dark:bg-gray-700"
            />
            <button
              type="button"
              onClick={() => onUpdateTons(Number((truck.totalTons + 1).toFixed(2)))}
              className="px-2.5 py-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded text-sm font-bold text-gray-800 dark:text-gray-200"
            >
              +1
            </button>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              ~{estFundas} fundas
            </span>
          </div>
        </div>

        {/* Asignación de Chofer */}
        <div>
          <label className="block text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1">
            Conductor Asignado
          </label>
          <select
            value={truck.driverId || ""}
            onChange={(e) => onSelectDriver(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Disponible en Bolsa (Sin asignar)</option>
            {drivers.map((d) => (
              <option key={d.uid} value={d.uid}>
                {d.names} {d.lastNames}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};