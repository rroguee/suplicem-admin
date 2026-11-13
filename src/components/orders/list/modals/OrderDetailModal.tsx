'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import { ServiceOrder, EditableDelivery } from '../types';
import { User } from '@/services/usersService';
import { OrderTripsProgressCard, TripItem } from '../../logistics/OrderTripsProgressCard';
import { formatRD } from '@/utils/currencyUtils';

const TripMap = dynamic(() => import('@/components/TripMap'), {
  ssr: false,
  loading: () => <div className="h-[260px] w-full animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />,
});

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedOrder: ServiceOrder | null;
  orderTrips: TripItem[];
  drivers: User[];
  isSeller: boolean;
  isEditingDetails: boolean;
  setIsEditingDetails: (val: boolean) => void;
  editedDeliveryType: string;
  setEditedDeliveryType: (val: string) => void;
  editedDeliveries: EditableDelivery[];
  onUpdateDelivery: (id: string, updates: Partial<EditableDelivery>) => void;
  onAddDelivery: () => void;
  onRemoveDelivery: (id: string) => void;
  onOpenAddAddressModal: () => void;
  onSaveDetails: () => void;
  onEdit: () => void;
  orderTracking: any;
  onOpenReceipt: (url: string, num: number | string) => void;
  onOpenPlanner: (order: ServiceOrder) => void;
  onAssignDriver: (trip: TripItem) => void;
  onCompletePickup: () => void;
  loading: boolean;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  isOpen,
  onClose,
  selectedOrder,
  orderTrips,
  drivers,
  isSeller,
  isEditingDetails,
  setIsEditingDetails,
  editedDeliveryType,
  setEditedDeliveryType,
  editedDeliveries,
  onUpdateDelivery,
  onAddDelivery,
  onRemoveDelivery,
  onOpenAddAddressModal,
  onSaveDetails,
  onEdit,
  orderTracking,
  onOpenReceipt,
  onOpenPlanner,
  onAssignDriver,
  onCompletePickup,
  loading,
}) => {
  if (!selectedOrder) return null;

  const calculateTotal = (items: ServiceOrder['items']) =>
    (items || []).reduce((acc, item) => acc + (item.subtotal || 0), 0);

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-3xl">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg max-h-[85vh] overflow-y-auto">
        {/* Encabezado del Detalle */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-3 mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Detalle de Orden #{selectedOrder.orderNumber}
            </h2>
            <p className="text-xs text-gray-500">ID: {selectedOrder.id}</p>
          </div>
          <div className="flex gap-2">
            {!isSeller && (
              isEditingDetails ? (
                <>
                  <Button onClick={onSaveDetails} variant="primary" size="sm">Guardar</Button>
                  <Button onClick={() => setIsEditingDetails(false)} variant="outline" size="sm">Cancelar</Button>
                </>
              ) : (
                <Button onClick={onEdit} variant="primary" size="sm">Editar</Button>
              )
            )}
          </div>
        </div>

        {/* Alerta de Riesgo IA */}
        {selectedOrder.aiRiskFlag && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-950/40 border border-red-300 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-800 dark:text-red-200 text-xs">
            <span className="text-lg">⚠️</span>
            <div>
              <p className="font-bold">Alerta de Seguridad: Contenido alterado con IA</p>
              <p>Revisa minuciosamente el comprobante de pago bancario adjunto.</p>
            </div>
          </div>
        )}

        {/* Grid Info Cliente & Resumen */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5 text-xs text-gray-700 dark:text-gray-300">
          <div className="space-y-1.5 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/40 border border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-2">Información del Cliente</h3>
            <p><span className="font-semibold">Nombre:</span> {selectedOrder.userNames} {selectedOrder.userLastNames}</p>
            <p>
              <span className="font-semibold">Teléfono:</span>{' '}
              {selectedOrder.userPhone ? (
                <a href={`tel:${selectedOrder.userPhone}`} className="text-blue-600 hover:underline">
                  {selectedOrder.userPhone}
                </a>
              ) : 'No disponible'}
            </p>
            <p><span className="font-semibold">Tipo Entrega:</span> <span className="capitalize">{selectedOrder.deliveryType}</span></p>
          </div>

          <div className="space-y-1.5 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/40 border border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-2">Resumen Financiero</h3>
            <p><span className="font-semibold">Fecha:</span> {new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
            <p><span className="font-semibold">Total:</span> <strong className="text-gray-900 dark:text-white text-sm tabular-nums">{formatRD(calculateTotal(selectedOrder.items))}</strong></p>
            <p><span className="font-semibold">Método Pago:</span> <span className="capitalize font-medium">{selectedOrder.paymentMethod === 'credit' ? 'Crédito' : 'Transferencia'}</span></p>
            {(selectedOrder.receiptUrl || selectedOrder.transferReceipt) && (
              <button
                type="button"
                onClick={() => onOpenReceipt(selectedOrder.receiptUrl || selectedOrder.transferReceipt || '', selectedOrder.orderNumber)}
                className="mt-2 text-xs font-semibold text-orange-600 hover:underline inline-block"
              >
                🧾 Ver Comprobante Bancario
              </button>
            )}
          </div>
        </div>

        {/* Lista de Productos */}
        <div className="mb-5">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Productos ({selectedOrder.items.length})</h3>
          <ul className="space-y-2">
            {selectedOrder.items.map((item, idx) => (
              <li key={idx} className="p-3 bg-gray-50 dark:bg-gray-700/40 rounded-lg border border-gray-200 dark:border-gray-700 flex justify-between items-center text-xs">
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">{item.name}</p>
                  <p className="text-gray-500">Cantidad: {item.quantity} {item.unit}</p>
                </div>
                <div className="font-bold tabular-nums text-gray-900 dark:text-white">
                  {formatRD(item.subtotal)}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Tarjeta de Progreso de Viajes */}
        <div className="mb-5">
          <OrderTripsProgressCard
            orderStatus={selectedOrder.status}
            deliveryType={selectedOrder.deliveryType}
            totalTons={Number(selectedOrder.totalTons || selectedOrder.pendingBalance) || calculateTotal(selectedOrder.items) / 500}
            deliveredTons={Number(selectedOrder.deliveredTons) || 0}
            trips={orderTrips}
            drivers={drivers}
            onOpenPlanner={() => onOpenPlanner(selectedOrder)}
            onAssignDriver={onAssignDriver}
            onCompletePickup={onCompletePickup}
            isProcessing={loading}
          />
        </div>

        {/* Mapa de Ubicación (solo para entregas a domicilio) */}
        {selectedOrder.deliveryType !== 'almacen' && (() => {
          const trackingInfo = orderTracking?.tracking || orderTracking;
          const loc = trackingInfo?.location;
          const currentDriverLoc = loc?.latitude && loc?.longitude
            ? { lat: Number(loc.latitude), lng: Number(loc.longitude) }
            : loc?.lat && loc?.lng
            ? { lat: Number(loc.lat), lng: Number(loc.lng) }
            : null;

          return (
            <div className="mb-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Ubicación de Despacho</h3>
              <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                <TripMap
                  driverLocation={currentDriverLoc}
                  driverInfo={trackingInfo?.driver}
                  deliveries={selectedOrder.deliveries?.map((d) => ({
                    address: d.address,
                    userId: selectedOrder.userId,
                    userNames: selectedOrder.userNames,
                    userLastNames: selectedOrder.userLastNames,
                    userPhone: '',
                  })) || []}
                  height="260px"
                />
              </div>
            </div>
          );
        })()}
      </div>
    </Modal>
  );
};
