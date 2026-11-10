import React from "react";
import { TripTruckRow, TruckTripItem } from "./TripTruckRow";

interface DeliveryInfo {
  id?: string;
  index: number;
  addressDescription: string;
  recipientName?: string;
  quantityFundas: number;
  totalTons: number;
  trucks: TruckTripItem[];
}

interface Props {
  delivery: DeliveryInfo;
  drivers: Array<{ uid: string; names?: string; lastNames?: string }>;
  onAddTruck: () => void;
  onUpdateTruckTons: (truckId: string, tons: number) => void;
  onSelectDriver: (truckId: string, driverId: string) => void;
  onRemoveTruck: (truckId: string) => void;
}

export const DeliveryApprovalCard: React.FC<Props> = ({
  delivery,
  drivers,
  onAddTruck,
  onUpdateTruckTons,
  onSelectDriver,
  onRemoveTruck,
}) => {
  const plannedTons = delivery.trucks.reduce((sum, t) => sum + (Number(t.totalTons) || 0), 0);
  const diff = Number((plannedTons - delivery.totalTons).toFixed(2));
  const isBalanced = Math.abs(diff) < 0.05;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm mb-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl text-orange-600">📍</span>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Entrega #{delivery.index + 1}
          </h3>
        </div>
        <span className="px-3 py-1 text-xs font-bold rounded-lg bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300">
          {delivery.quantityFundas} fundas ({delivery.totalTons.toFixed(2)} t)
        </span>
      </div>

      <p className="text-sm text-gray-700 dark:text-gray-300">
        📍 {delivery.addressDescription || "Dirección no especificada"}
      </p>
      {delivery.recipientName && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          👤 Recibe: {delivery.recipientName}
        </p>
      )}

      {/* Balance Bar */}
      <div
        className={`flex justify-between items-center px-4 py-2.5 rounded-lg text-xs my-4 border ${
          isBalanced
            ? "bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300"
            : "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300"
        }`}
      >
        <span>
          Planificado en camiones: <strong className="font-bold">{plannedTons.toFixed(2)} t</strong> de {delivery.totalTons.toFixed(2)} t
        </span>
        {!isBalanced && (
          <span className="font-bold">
            {diff > 0 ? `+${diff.toFixed(2)} t de más` : `${Math.abs(diff).toFixed(2)} t faltantes`}
          </span>
        )}
      </div>

      {/* Lista de Camiones */}
      <div className="space-y-3">
        {delivery.trucks.map((truck, idx) => (
          <TripTruckRow
            key={truck.id || `truck-${idx}`}
            truck={truck}
            index={idx}
            drivers={drivers}
            onUpdateTons={(tons) => onUpdateTruckTons(truck.id, tons)}
            onSelectDriver={(driverId) => onSelectDriver(truck.id, driverId)}
            onRemove={() => onRemoveTruck(truck.id)}
            canRemove={delivery.trucks.length > 1}
          />
        ))}
      </div>

      {/* Botón para agregar camión */}
      <button
        type="button"
        onClick={onAddTruck}
        className="w-full mt-3 py-2.5 px-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-50/60 dark:bg-gray-800/40 hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
      >
        <span>+</span> Agregar Camión para esta Entrega
      </button>
    </div>
  );
};