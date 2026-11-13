'use client';

import React from 'react';
import { EditableDelivery, Address } from '../types';
import { MapPin, Plus } from 'lucide-react';

interface OrderDeliveriesEditSectionProps {
  deliveries: EditableDelivery[];
  isEditing: boolean;
  onUpdateDeliveryAddress: (address: Address) => void;
  onOpenAddAddressModal: () => void;
}

export const OrderDeliveriesEditSection: React.FC<OrderDeliveriesEditSectionProps> = ({
  deliveries,
  isEditing,
  onUpdateDeliveryAddress,
  onOpenAddAddressModal,
}) => {
  const currentDelivery = deliveries[0];
  const currentAddress = currentDelivery?.address;
  const availableAddresses = currentDelivery?.availableAddresses || [];

  return (
    <div className="mb-5">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-orange-500" />
          <span>Dirección de Entrega</span>
        </h3>
        {isEditing && (
          <button
            type="button"
            onClick={onOpenAddAddressModal}
            className="text-xs font-semibold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            Nueva Dirección
          </button>
        )}
      </div>

      <div className="p-3.5 bg-gray-50 dark:bg-gray-700/40 rounded-xl border border-gray-200 dark:border-gray-700 text-xs">
        {isEditing ? (
          <div>
            <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
              Seleccionar Dirección de Destino
            </label>
            <select
              value={currentAddress?.placeId || ''}
              onChange={(e) => {
                const placeId = e.target.value;
                const selectedAddr = availableAddresses.find((a) => a.placeId === placeId);
                if (selectedAddr) {
                  onUpdateDeliveryAddress(selectedAddr);
                }
              }}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs truncate"
            >
              <option value="">-- Seleccionar Dirección --</option>
              {availableAddresses.map((addr, idx) => (
                <option key={addr.placeId || idx} value={addr.placeId}>
                  {addr.description}
                </option>
              ))}
            </select>
            {currentAddress?.additionalInfo && (
              <p className="text-[11px] text-gray-500 mt-1.5">
                Ref: {currentAddress.additionalInfo}
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-1">
            <p className="font-semibold text-gray-900 dark:text-white">
              📍 {currentAddress?.description || 'Sin dirección asignada'}
            </p>
            {currentAddress?.additionalInfo && (
              <p className="text-gray-500 text-[11px]">
                Ref: {currentAddress.additionalInfo}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
