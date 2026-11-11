'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';

const AddressPicker = dynamic(() => import('@/hooks/AddressPicker'), {
  ssr: false,
  loading: () => <div className="h-10 w-full animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />,
});

export interface NewAddressFormState {
  description: string;
  recipientName: string;
  recipientDocument: string;
  recipientDocumentType: string;
  additionalInfo: string;
  placeId: string;
  latitude: number;
  longitude: number;
  saveToProfile?: boolean;
}

interface OrderAddAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: NewAddressFormState;
  onChange: (data: NewAddressFormState) => void;
  onSubmit: () => void;
}

export const OrderAddAddressModal: React.FC<OrderAddAddressModalProps> = ({
  isOpen,
  onClose,
  data,
  onChange,
  onSubmit,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-xl">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
        <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
          Agregar Nueva Dirección de Entrega
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
              Buscar Dirección
            </label>
            <AddressPicker
              onPlaceSelected={(place) => {
                onChange({
                  ...data,
                  description: place.description,
                  latitude: place.latitude,
                  longitude: place.longitude,
                  placeId: place.placeId,
                });
              }}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
              Referencia / Información Adicional
            </label>
            <input
              type="text"
              placeholder="Ej: Frente al colmado, portón blanco..."
              value={data.additionalInfo}
              onChange={(e) => onChange({ ...data, additionalInfo: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
              Nombre de quien recibe
            </label>
            <input
              type="text"
              placeholder="Nombre del receptor"
              value={data.recipientName}
              onChange={(e) => onChange({ ...data, recipientName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="saveToProfileCheckbox"
              checked={data.saveToProfile !== false}
              onChange={(e) => onChange({ ...data, saveToProfile: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
            />
            <label
              htmlFor="saveToProfileCheckbox"
              className="text-xs text-gray-600 dark:text-gray-400 cursor-pointer"
            >
              Guardar esta dirección en el perfil del cliente para futuros pedidos
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button onClick={onClose} variant="outline" size="sm">
              Cancelar
            </Button>
            <Button onClick={onSubmit} variant="primary" size="sm">
              Guardar Dirección
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
