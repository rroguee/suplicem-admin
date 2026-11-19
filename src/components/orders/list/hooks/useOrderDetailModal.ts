'use client';

import { useState, useEffect, useCallback } from 'react';
import { ServiceOrder, EditableDelivery } from '../types';
import { getUserById, updateUserAddresses } from '@/services/usersService';
import {
  getOrderTracking,
  completePickupOrder,
  updateOrderDeliveries,
} from '@/services/ordersService';
import { NewAddressFormState } from '../modals/OrderAddAddressModal';
import { useOrderTripsPlanning } from './useOrderTripsPlanning';

interface UseOrderDetailModalProps {
  fetchOrders: () => Promise<void>;
  showAlert: (config: any) => void;
  setGlobalLoading: (loading: boolean) => void;
}

export function useOrderDetailModal({
  fetchOrders,
  showAlert,
  setGlobalLoading,
}: UseOrderDetailModalProps) {
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [editedDeliveryType, setEditedDeliveryType] = useState('');
  const [originalDeliveryType, setOriginalDeliveryType] = useState('');
  const [editedDeliveries, setEditedDeliveries] = useState<EditableDelivery[]>([]);
  const [originalDeliveries, setOriginalDeliveries] = useState<EditableDelivery[]>([]);
  const [clientAddresses, setClientAddresses] = useState<any[]>([]);
  const [orderTracking, setOrderTracking] = useState<any>(null);

  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [newAddressData, setNewAddressData] = useState<NewAddressFormState>({
    description: '',
    recipientName: '',
    recipientDocument: '',
    recipientDocumentType: 'Cédula',
    additionalInfo: '',
    placeId: '',
    latitude: 0,
    longitude: 0,
    saveToProfile: true,
  });

  const tripsPlanning = useOrderTripsPlanning();

  const fetchOrderTrackingData = useCallback(async (orderId: string) => {
    try {
      const res = await getOrderTracking(orderId);
      if (res?.success) {
        const nextTracking = res.tracking || res;
        setOrderTracking((prev: any) => {
          const prevLoc = prev?.tracking?.location || prev?.location;
          const nextLoc = nextTracking?.tracking?.location || nextTracking?.location;
          if (
            prevLoc &&
            nextLoc &&
            Number(prevLoc.latitude || prevLoc.lat) === Number(nextLoc.latitude || nextLoc.lat) &&
            Number(prevLoc.longitude || prevLoc.lng) === Number(nextLoc.longitude || nextLoc.lng)
          ) {
            return prev;
          }
          return nextTracking;
        });
      }
    } catch (err) {
      console.error('Error fetching order tracking:', err);
    }
  }, []);

  // Polling automático en tiempo real
  useEffect(() => {
    if (!isDetailModalOpen || !selectedOrder?.id) return;

    const terminalStatuses = ['delivered', 'completed', 'canceled', 'rejected'];
    if (terminalStatuses.includes(selectedOrder.status)) return;

    let isTrackingInFlight = false;
    const intervalId = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible' && !isTrackingInFlight) {
        isTrackingInFlight = true;
        Promise.resolve(fetchOrderTrackingData(selectedOrder.id)).finally(() => {
          isTrackingInFlight = false;
        });
      }
    }, 15_000);

    return () => clearInterval(intervalId);
  }, [isDetailModalOpen, selectedOrder?.id, selectedOrder?.status, fetchOrderTrackingData]);

  const handleViewDetails = async (order: ServiceOrder) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
    setIsEditingDetails(false);
    fetchOrderTrackingData(order.id);
    tripsPlanning.fetchTripsForOrder(order.id);

    let userAddrs: any[] = order.deliveryAddress ? [order.deliveryAddress] : [];
    if (order.userId) {
      try {
        const userRes = await getUserById(order.userId);
        if (userRes?.success && userRes.user?.addresses) {
          userAddrs = userRes.user.addresses;
        } else if (userRes?.addresses) {
          userAddrs = userRes.addresses;
        }
      } catch (err) {
        console.error('Error fetching user addresses:', err);
      }
    }
    setClientAddresses(userAddrs);

    const delType = order.deliveryType || 'almacen';
    setEditedDeliveryType(delType);
    setOriginalDeliveryType(delType);

    const initialDeliveries: EditableDelivery[] = (order.deliveries && order.deliveries.length > 0)
      ? order.deliveries.map((del, idx) => ({
          id: del.id || `delivery-${idx}`,
          productId: del.productId || order.items?.[0]?.productId || '',
          quantity: Number(del.quantity) || 0,
          unit: del.unit || order.items?.[0]?.unit || 'fundas',
          address: del.address || order.deliveryAddress || userAddrs[0] || {
            description: '',
            latitude: 0,
            longitude: 0,
            placeId: '',
          },
          availableAddresses: userAddrs,
        }))
      : [
          {
            id: 'delivery-0',
            productId: order.items?.[0]?.productId || '',
            quantity: order.items?.[0]?.quantity || 0,
            unit: order.items?.[0]?.unit || 'fundas',
            address: order.deliveryAddress || userAddrs[0] || {
              description: '',
              latitude: 0,
              longitude: 0,
              placeId: '',
            },
            availableAddresses: userAddrs,
          },
        ];

    setEditedDeliveries(initialDeliveries);
    setOriginalDeliveries(initialDeliveries);
  };

  const handleUpdateDeliveryAddress = (address: any) => {
    setEditedDeliveries((prev) =>
      prev.map((d) => ({
        ...d,
        address,
      }))
    );
  };

  const handleSaveNewAddressSubmit = async () => {
    if (!newAddressData.description || !newAddressData.latitude) {
      showAlert({ type: 'warning', title: 'Dirección Incompleta', message: 'Selecciona una dirección válida del mapa.' });
      return;
    }

    const newAddr: any = {
      description: newAddressData.description,
      placeId: newAddressData.placeId || `addr-${Date.now()}`,
      latitude: newAddressData.latitude,
      longitude: newAddressData.longitude,
      additionalInfo: newAddressData.additionalInfo,
      recipientName: newAddressData.recipientName || `${selectedOrder?.userNames || ''} ${selectedOrder?.userLastNames || ''}`.trim(),
      recipientDocument: newAddressData.recipientDocument,
      recipientDocumentType: newAddressData.recipientDocumentType,
    };

    const updatedAddrs = [newAddr, ...clientAddresses];
    setClientAddresses(updatedAddrs);

    setEditedDeliveries((prev) =>
      prev.map((d, idx) => ({
        ...d,
        address: idx === 0 ? newAddr : d.address,
        availableAddresses: updatedAddrs,
      }))
    );

    if (newAddressData.saveToProfile && selectedOrder?.userId) {
      updateUserAddresses(selectedOrder.userId, updatedAddrs).catch((err) =>
        console.error('Error al guardar dirección en perfil:', err)
      );
    }

    setIsAddingNewAddress(false);
    showAlert({ type: 'success', title: 'Dirección Agregada', message: 'Dirección agregada a la entrega.' });
  };

  const handleCancelEditing = useCallback(() => {
    tripsPlanning.resetTripsState();
    setEditedDeliveryType(originalDeliveryType);
    setEditedDeliveries(originalDeliveries);
    setIsEditingDetails(false);
  }, [tripsPlanning, originalDeliveryType, originalDeliveries]);

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedOrder(null);
    setOrderTracking(null);
    handleCancelEditing();
  };

  const handleSaveOrderDetails = async () => {
    if (!selectedOrder) return;
    try {
      setGlobalLoading(true);

      const deliveryTypeChanged = editedDeliveryType !== originalDeliveryType;
      const deliveriesChanged = JSON.stringify(editedDeliveries) !== JSON.stringify(originalDeliveries);
      const cleanDeliveries = editedDeliveries.map(({ availableAddresses, ...rest }: any) => rest);

      if (deliveryTypeChanged || (editedDeliveryType === 'domicilio' && deliveriesChanged)) {
        if (editedDeliveryType === 'domicilio') {
          for (const d of editedDeliveries) {
            if (!d.address?.placeId && !d.address?.description) {
              showAlert({ type: 'warning', title: 'Falta Dirección', message: 'Todas las entregas deben tener una dirección seleccionada.' });
              setGlobalLoading(false);
              return;
            }
            if (!d.quantity || d.quantity <= 0) {
              showAlert({ type: 'warning', title: 'Cantidad Inválida', message: 'Todas las entregas deben tener cantidad mayor a 0.' });
              setGlobalLoading(false);
              return;
            }
          }
        }

        const res = await updateOrderDeliveries(selectedOrder.id, editedDeliveryType, cleanDeliveries);
        if (!res?.success) {
          showAlert({ type: 'error', title: 'Error', message: res?.message || 'No se pudo actualizar las entregas.' });
          setGlobalLoading(false);
          return;
        }
      }

      await tripsPlanning.saveTripsOrAssignments(selectedOrder.id);

      showAlert({ type: 'success', title: 'Éxito', message: 'Cambios de la orden guardados correctamente.' });

      setSelectedOrder((prev) =>
        prev
          ? {
              ...prev,
              deliveryType: editedDeliveryType,
              deliveries: cleanDeliveries,
            }
          : prev
      );

      setIsEditingDetails(false);
      setOriginalDeliveryType(editedDeliveryType);
      setOriginalDeliveries(editedDeliveries);
      fetchOrders();
      tripsPlanning.finalizeSavedTrips(selectedOrder.id);
    } catch (err: any) {
      showAlert({
        type: 'error',
        title: 'Error',
        message: err?.response?.data?.message || err?.message || 'Error al guardar los cambios.',
      });
    } finally {
      setGlobalLoading(false);
    }
  };

  const handleCompletePickup = async () => {
    if (!selectedOrder) return;
    try {
      setGlobalLoading(true);
      const res = await completePickupOrder(selectedOrder.id);
      if (res.success) {
        showAlert({ type: 'success', title: 'Éxito', message: 'Retiro en almacén completado.' });
        fetchOrders();
        closeDetailModal();
      }
    } finally {
      setGlobalLoading(false);
    }
  };

  return {
    isDetailModalOpen,
    selectedOrder,
    orderTrips: tripsPlanning.orderTrips,
    orderTracking,
    isEditingDetails,
    editedDeliveryType,
    setEditedDeliveryType,
    editedDeliveries,
    isPlannerOpen: tripsPlanning.isPlannerOpen,
    setIsPlannerOpen: tripsPlanning.setIsPlannerOpen,
    orderForPlanning: tripsPlanning.orderForPlanning,
    setOrderForPlanning: tripsPlanning.setOrderForPlanning,
    tripForDriver: tripsPlanning.tripForDriver,
    isDriverModalOpen: tripsPlanning.isDriverModalOpen,
    setIsDriverModalOpen: tripsPlanning.setIsDriverModalOpen,
    isAddingNewAddress,
    setIsAddingNewAddress,
    newAddressData,
    setNewAddressData,
    handleViewDetails,
    closeDetailModal,
    setIsEditingDetails,
    handleCancelEditing,
    handleSaveOrderDetails,
    handleUpdateDeliveryAddress,
    handleSaveNewAddressSubmit,
    handleConfirmPlan: tripsPlanning.handleConfirmPlan,
    handleAssignDriverToTrip: tripsPlanning.handleAssignDriverToTrip,
    handleSelectDriverForTrip: tripsPlanning.handleSelectDriverForTrip,
    handleCompletePickup,
  };
}
