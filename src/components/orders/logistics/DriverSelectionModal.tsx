'use client';

import React from 'react';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import { User } from '@/services/usersService';

interface DriverSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  drivers: User[];
  selectedDriverId: string;
  onSelectDriver: (driverId: string) => void;
  targetTons?: number;
}

export const DriverSelectionModal: React.FC<DriverSelectionModalProps> = ({
  isOpen,
  onClose,
  drivers,
  selectedDriverId,
  onSelectDriver,
  targetTons,
}) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-xl">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl">
        <div className="flex justify-between items-center mb-4 border-b pb-3 pr-10 dark:border-gray-700">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Asignar Conductor</h3>
            {targetTons !== undefined && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Carga asignada: <span className="font-semibold text-gray-800 dark:text-gray-200">{targetTons.toFixed(2)} t</span>
              </p>
            )}
          </div>
        </div>

        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {/* Opción Bolsa General */}
          <div
            onClick={() => {
              onSelectDriver('');
              onClose();
            }}
            className={`p-3.5 rounded-lg border cursor-pointer transition flex items-center justify-between ${
              !selectedDriverId
                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
                : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/40'
            }`}
          >
            <div>
              <p className="font-semibold text-sm text-gray-900 dark:text-white">🌐 Bolsa General (Sin Asignar)</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Disponible para cualquier conductor con capacidad.</p>
            </div>
            <input
              type="radio"
              checked={!selectedDriverId}
              onChange={() => {}}
              className="text-blue-600 focus:ring-blue-500"
            />
          </div>

          {/* Lista de Choferes */}
          {drivers.map((driver) => {
            const isSelected = selectedDriverId === driver.uid;
            return (
              <div
                key={driver.uid}
                onClick={() => {
                  onSelectDriver(driver.uid);
                  onClose();
                }}
                className={`p-3.5 rounded-lg border cursor-pointer transition flex items-center justify-between ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/40'
                }`}
              >
                <div>
                  <p className="font-semibold text-sm text-gray-900 dark:text-white">
                    👤 {driver.names} {driver.lastNames}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    📞 {driver.phone || 'Sin teléfono'} {driver.identification ? `| Doc: ${driver.identification}` : ''}
                  </p>
                </div>
                <input
                  type="radio"
                  checked={isSelected}
                  onChange={() => {}}
                  className="text-blue-600 focus:ring-blue-500"
                />
              </div>
            );
          })}
        </div>

        <div className="mt-5 flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </div>
    </Modal>
  );
};
