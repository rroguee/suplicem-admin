'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import { User } from '@/services/usersService';
import CustomAlert from '@/components/CustomAlert';
import { useCustomAlert } from '@/hooks/useCustomAlert';

export interface PlannedTripItem {
  totalTons: number;
  driverId: string;
  comments?: string;
}

interface OrderTripPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderTotalTons: number;
  drivers: User[];
  onConfirmPlan: (trips: PlannedTripItem[]) => void;
  isSaving?: boolean;
}

export const OrderTripPlannerModal: React.FC<OrderTripPlannerModalProps> = ({
  isOpen,
  onClose,
  orderTotalTons,
  drivers,
  onConfirmPlan,
  isSaving = false,
}) => {
  const [tripCount, setTripCount] = useState<number>(orderTotalTons > 25 ? 2 : 1);
  const [trips, setTrips] = useState<PlannedTripItem[]>([]);
  const { alertConfig, showError, closeAlert } = useCustomAlert();

  useEffect(() => {
    if (!isOpen || orderTotalTons <= 0) return;
    const initialCount = orderTotalTons > 25 ? 2 : 1;
    setTripCount(initialCount);
    recalculate(initialCount, orderTotalTons);
  }, [isOpen, orderTotalTons]);

  const recalculate = (count: number, total: number) => {
    const tonsPerTrip = Number((total / count).toFixed(2));
    const newTrips: PlannedTripItem[] = [];
    let allocated = 0;

    for (let i = 0; i < count; i++) {
      const tons = i === count - 1 ? Number((total - allocated).toFixed(2)) : tonsPerTrip;
      allocated += tons;
      newTrips.push({ totalTons: tons, driverId: '' });
    }
    setTrips(newTrips);
  };

  const handleTripCountChange = (newCount: number) => {
    if (newCount < 1 || newCount > 20) return;
    setTripCount(newCount);
    recalculate(newCount, orderTotalTons);
  };

  const updateTripTons = (index: number, val: string) => {
    const num = parseFloat(val) || 0;
    setTrips((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], totalTons: num };
      return copy;
    });
  };

  const updateTripDriver = (index: number, driverId: string) => {
    setTrips((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], driverId };
      return copy;
    });
  };

  const sumTons = trips.reduce((sum, t) => sum + (Number(t.totalTons) || 0), 0);
  const isDiffSignificant = Math.abs(sumTons - orderTotalTons) > 0.05;

  const handleSubmit = () => {
    if (trips.some((t) => t.totalTons <= 0)) {
      showError({
        title: "Tonelaje Inválido",
        message: "Todos los viajes deben tener un tonelaje mayor a 0.",
      });
      return;
    }
    if (isDiffSignificant) {
      showError({
        title: "Tonelaje Descuadrado",
        message: `La suma (${sumTons.toFixed(2)} t) no coincide con el total de la orden (${orderTotalTons.toFixed(2)} t).`,
      });
      return;
    }
    onConfirmPlan(trips);
  };

  if (!isOpen) return null;

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-h-[85vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 border-b pb-3 pr-10 dark:border-gray-700">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Planificar y Fraccionar Viajes</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Total orden: <span className="font-semibold text-blue-600 dark:text-blue-400">{orderTotalTons.toFixed(2)} toneladas</span>
            </p>
          </div>
        </div>

        {/* Selector de número de camiones */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg mb-5">
          <span className="font-medium text-sm text-gray-700 dark:text-gray-300">Número de viajes / camiones:</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleTripCountChange(tripCount - 1)}
              disabled={tripCount <= 1 || isSaving}
              className="w-8 h-8 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 font-bold disabled:opacity-40"
            >
              -
            </button>
            <span className="font-bold text-lg w-6 text-center text-gray-900 dark:text-white">{tripCount}</span>
            <button
              onClick={() => handleTripCountChange(tripCount + 1)}
              disabled={tripCount >= 20 || isSaving}
              className="w-8 h-8 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 font-bold disabled:opacity-40"
            >
              +
            </button>
          </div>
        </div>

        {/* Lista de Viajes Planificados */}
        <div className="space-y-4 mb-5">
          {trips.map((trip, idx) => (
            <div key={idx} className="p-4 border rounded-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200 mb-3">🚚 Camión / Viaje #{idx + 1}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Toneladas:</label>
                  <input
                    type="number"
                    step="0.01"
                    value={trip.totalTons}
                    onChange={(e) => updateTripTons(idx, e.target.value)}
                    className="w-full px-3 py-2 border rounded-md text-sm bg-white dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Conductor Asignado:</label>
                  <select
                    value={trip.driverId}
                    onChange={(e) => updateTripDriver(idx, e.target.value)}
                    className="w-full px-3 py-2 border rounded-md text-sm bg-white dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
                  >
                    <option value="">Bolsa general (Sin asignar)</option>
                    {drivers.map((d) => (
                      <option key={d.uid} value={d.uid}>
                        {d.names} {d.lastNames}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Resumen de Carga */}
        <div className={`p-3 rounded-lg text-sm mb-5 ${isDiffSignificant ? 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300' : 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-300'}`}>
          Suma planificada: <span className="font-bold">{sumTons.toFixed(2)} t</span> / Total necesario: <span className="font-bold">{orderTotalTons.toFixed(2)} t</span>
          {isDiffSignificant && <p className="text-xs mt-1">⚠️ Ajusta los pesos para que la suma cuadre exactamente con la orden.</p>}
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit} disabled={isDiffSignificant || isSaving}>
            {isSaving ? 'Guardando...' : 'Confirmar Planificación'}
          </Button>
        </div>
      </div>
    </Modal>
    <CustomAlert {...alertConfig} onClose={closeAlert} />
  </>
  );
};
