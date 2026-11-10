'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import CustomAlert from '@/components/CustomAlert';
import { Trash2 } from 'lucide-react';
import { ApprovedOrder, AlertConfig } from '../types';
import { getOrdersWithStatus } from '@/services/ordersService';
import { createTrip } from '@/services/tripsService';

interface CreateTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateTripModal: React.FC<CreateTripModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [numberTrip, setNumberTrip] = useState('');
  const [comment, setComment] = useState('');
  const [approvedOrders, setApprovedOrders] = useState<ApprovedOrder[]>([]);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [savedOrders, setSavedOrders] = useState<ApprovedOrder[]>([]);
  const [isOrderSelectionOpen, setIsOrderSelectionOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [alertConfig, setAlertConfig] = useState<AlertConfig>({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
  });

  const showAlert = (config: Omit<AlertConfig, 'isOpen'>) => {
    setAlertConfig({ ...config, isOpen: true });
  };

  useEffect(() => {
    if (isOpen) {
      getOrdersWithStatus('approved')
        .then((data) => {
          if (data?.success && data?.orders?.length > 0) {
            const filtered = data.orders.filter(
              (o: ApprovedOrder) => !o.tripId && o.deliveryType === 'domicilio'
            );
            setApprovedOrders(filtered);
          }
        })
        .catch((err) => console.error('Error fetching approved orders:', err));
    } else {
      setNumberTrip('');
      setComment('');
      setSavedOrders([]);
      setSelectedOrderIds([]);
    }
  }, [isOpen]);

  const toggleSelectOrder = (orderId: string) => {
    setSelectedOrderIds((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
    );
  };

  const handleSaveSelected = () => {
    const newlySelected = approvedOrders.filter((o) => selectedOrderIds.includes(o.id));
    const unique = newlySelected.filter((o) => !savedOrders.some((s) => s.id === o.id));
    setSavedOrders((prev) => [...prev, ...unique]);
    setIsOrderSelectionOpen(false);
    setSelectedOrderIds([]);
  };

  const handleRemoveSaved = (orderId: string) => {
    setSavedOrders((prev) => prev.filter((o) => o.id !== orderId));
  };

  const handleSubmit = async () => {
    if (!numberTrip.trim() || !comment.trim()) {
      showAlert({ message: 'Número de viaje y comentario son obligatorios.', type: 'error', title: 'Campos Requeridos' });
      return;
    }
    if (savedOrders.length === 0) {
      showAlert({ message: 'Debe agregar al menos una orden aprobada.', type: 'error', title: 'Órdenes Requeridas' });
      return;
    }

    const totalTons = savedOrders.reduce((sum, order) => {
      const orderTons = order.deliveries?.reduce((acc, d) => acc + (d.quantity || 0), 0) || 0;
      return sum + orderTons;
    }, 0);

    const orderIds = savedOrders.map((o) => o.id);

    try {
      setLoading(true);
      const res = await createTrip(numberTrip, orderIds, totalTons, comment);
      if (res.success) {
        showAlert({
          message: 'Viaje creado correctamente.',
          type: 'success',
          title: 'Éxito',
          onConfirm: () => {
            onSuccess();
            onClose();
          },
        });
      } else {
        showAlert({ message: res.message || 'Error al crear el viaje.', type: 'error', title: 'Error' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl p-6">
        <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Crear Nuevo Viaje</h3>

        <div className="space-y-4">
          <div>
            <Label>Número de Viaje</Label>
            <Input
              type="text"
              placeholder="Ej: TRIP-1010"
              value={numberTrip}
              onChange={(e) => setNumberTrip(e.target.value)}
              className="w-full mt-1"
            />
          </div>

          <div>
            <Label>{savedOrders.length > 0 ? 'Órdenes agregadas:' : 'Órdenes en este viaje:'}</Label>
            {savedOrders.length > 0 && (
              <div className="space-y-2 mt-2 max-h-48 overflow-y-auto">
                {savedOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2.5 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div>
                      <p className="text-xs font-bold text-gray-900 dark:text-white">ORD-{order.orderNumber}</p>
                      <p className="text-[11px] text-gray-500">{order.userNames} {order.userLastNames}</p>
                    </div>
                    <button type="button" onClick={() => handleRemoveSaved(order.id)} className="p-1 text-red-500 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <Button size="sm" variant="outline" onClick={() => setIsOrderSelectionOpen(true)} className="mt-2 w-full">
              + Agregar Órdenes Aprobadas
            </Button>
          </div>

          <div>
            <Label>Comentario de Despacho:</Label>
            <Input
              type="text"
              placeholder="Ej: Flete asignado a zona norte"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full mt-1"
            />
          </div>

          <div className="flex justify-end gap-2.5 mt-5">
            <Button size="sm" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button size="sm" onClick={handleSubmit} disabled={loading}>
              Crear Viaje
            </Button>
          </div>
        </div>
      </Modal>

      {/* Submodal: Selección de Órdenes */}
      <Modal isOpen={isOrderSelectionOpen} onClose={() => setIsOrderSelectionOpen(false)} className="max-w-md p-6">
        <h3 className="text-lg font-bold mb-3 text-gray-900 dark:text-white">Órdenes Aprobadas Disponibles</h3>
        <div className="max-h-80 overflow-y-auto space-y-2 mb-4">
          {approvedOrders.length > 0 ? (
            approvedOrders.map((order) => {
              const isSelected = selectedOrderIds.includes(order.id);
              return (
                <div
                  key={order.id}
                  onClick={() => toggleSelectOrder(order.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-orange-50 border-orange-500 dark:bg-orange-950/40 dark:border-orange-600'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <p className="text-xs font-bold text-gray-900 dark:text-white">ORD-{order.orderNumber}</p>
                  <p className="text-[11px] text-gray-500">{order.userNames} {order.userLastNames}</p>
                </div>
              );
            })
          ) : (
            <p className="text-center text-xs text-gray-400 py-6">No hay órdenes aprobadas pendientes de flete.</p>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="outline" onClick={() => setIsOrderSelectionOpen(false)}>
            Cerrar
          </Button>
          <Button size="sm" onClick={handleSaveSelected} disabled={selectedOrderIds.length === 0}>
            Agregar Seleccionadas ({selectedOrderIds.length})
          </Button>
        </div>
      </Modal>

      <CustomAlert
        isOpen={alertConfig.isOpen}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        onConfirm={alertConfig.onConfirm}
        onCancel={alertConfig.onCancel}
        onClose={() => setAlertConfig((prev) => ({ ...prev, isOpen: false }))}
      />
    </>
  );
};
