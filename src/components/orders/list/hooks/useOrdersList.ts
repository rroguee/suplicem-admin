'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ServiceOrder, EditableDelivery, AlertConfig } from '../types';
import { FilterStatus } from '../../logistics/OrderFilterChips';
import { TripItem } from '../../logistics/OrderTripsProgressCard';
import { useCustomAlert } from '@/hooks/useCustomAlert';
import { User, getUsers, getUserById, updateUserAddresses } from '@/services/usersService';
import {
  getOrders,
  approveOrder,
  rejectedOrder,
  getOrderTracking,
  completePickupOrder,
  updateOrderDeliveries,
} from '@/services/ordersService';
import { getTripByOrderId, assignTripDriver, splitOrderTrips } from '@/services/tripsService';
import { NewAddressFormState } from '../modals/OrderAddAddressModal';

const ITEMS_PER_PAGE = 7;

export function useOrdersList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [statusFilter, setStatusFilterState] = useState<FilterStatus>('Todos');

  const [orderCounts, setOrderCounts] = useState<Record<string, number>>({
    Todos: 0,
    pending: 0,
    'Alertas IA': 0,
    approved: 0,
    on_the_way: 0,
    completed: 0,
    rejected: 0,
  });
  const [kpis, setKpis] = useState({
    pendingCount: 0,
    pendingAmount: 0,
    inRouteCount: 0,
    approvedCount: 0,
    aiRiskCount: 0,
  });

  const [users, setUsers] = useState<User[]>([]);
  const [drivers, setDrivers] = useState<User[]>([]);

  // Modales
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [orderToRejectId, setOrderToRejectId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [editedDeliveryType, setEditedDeliveryType] = useState('');
  const [originalDeliveryType, setOriginalDeliveryType] = useState('');
  const [editedDeliveries, setEditedDeliveries] = useState<EditableDelivery[]>([]);
  const [originalDeliveries, setOriginalDeliveries] = useState<EditableDelivery[]>([]);
  const [clientAddresses, setClientAddresses] = useState<any[]>([]);
  const [orderTracking, setOrderTracking] = useState<any>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [receiptImageUrl, setReceiptImageUrl] = useState<string | null>(null);
  const [receiptOrderNumber, setReceiptOrderNumber] = useState<number | string>('');
  const [isPlannerOpen, setIsPlannerOpen] = useState(false);
  const [orderForPlanning, setOrderForPlanning] = useState<ServiceOrder | null>(null);
  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);
  const [tripForDriver, setTripForDriver] = useState<TripItem | null>(null);
  const [orderTrips, setOrderTrips] = useState<TripItem[]>([]);
  const [originalOrderTrips, setOriginalOrderTrips] = useState<TripItem[]>([]);
  const [pendingPlannedTrips, setPendingPlannedTrips] = useState<any[] | null>(null);
  const [pendingDriverAssignments, setPendingDriverAssignments] = useState<Record<string, string>>({});
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

  const { alertConfig, showAlert, closeAlert } = useCustomAlert();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  const setStatusFilter = (status: FilterStatus) => {
    setStatusFilterState(status);
    setCurrentPage(1);
  };

  const fetchDrivers = useCallback(async () => {
    try {
      const driversRes = await getUsers({ userType: 'driver', status: 'active' });
      if (driversRes?.success) setDrivers(driversRes.users || []);
    } catch (err) {
      console.error('Error fetching drivers:', err);
    }
  }, []);

  const fetchTripsForOrder = useCallback(async (orderId: string) => {
    try {
      const response = await getTripByOrderId(orderId);
      const trips = response?.success && Array.isArray(response?.trips)
        ? response.trips
        : response?.trip
        ? [response.trip]
        : [];
      setOrderTrips(trips);
      setOriginalOrderTrips(trips);
      setPendingPlannedTrips(null);
      setPendingDriverAssignments({});
    } catch (err) {
      console.error('Error fetching trips for order:', err);
      setOrderTrips([]);
      setOriginalOrderTrips([]);
      setPendingPlannedTrips(null);
      setPendingDriverAssignments({});
    }
  }, []);

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

  // Polling automático en tiempo real para la ubicación del camión mientras el modal esté abierto
  useEffect(() => {
    if (!isDetailModalOpen || !selectedOrder?.id) return;

    const terminalStatuses = ['delivered', 'completed', 'canceled', 'rejected'];
    if (terminalStatuses.includes(selectedOrder.status)) return;

    const intervalId = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        fetchOrderTrackingData(selectedOrder.id);
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, [isDetailModalOpen, selectedOrder?.id, selectedOrder?.status, fetchOrderTrackingData]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getOrders({
        status: statusFilter,
        search: debouncedSearch.trim() || undefined,
        page: currentPage,
        limit: ITEMS_PER_PAGE,
      });

      if (response.success) {
        setOrders(response.orders || []);
        setTotalPages(response.pagination?.totalPages || 1);
        if (response.orderCounts) setOrderCounts(response.orderCounts);
        if (response.kpis) setKpis(response.kpis);
      } else {
        setError('Error al cargar órdenes.');
      }
    } catch {
      setError('No se pudieron cargar las órdenes.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, debouncedSearch, currentPage]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  const handleApproveOrder = async (order: ServiceOrder) => {
    if (order.deliveryType === 'almacen') {
      try {
        setLoading(true);
        const res = await approveOrder(order.id);
        if (res.success) {
          showAlert({ type: 'success', title: 'Éxito', message: 'Orden de retiro en almacén aprobada.' });
          fetchOrders();
        } else {
          showAlert({ type: 'error', title: 'Error', message: res.message || 'No se pudo aprobar la orden.' });
        }
      } catch {
        showAlert({ type: 'error', title: 'Error', message: 'No se pudo aprobar la orden.' });
      } finally {
        setLoading(false);
      }
      return;
    }
    router.push(`/admin/orders/${order.id}/approval`);
  };

  const handleRejectOrder = (orderId: string) => {
    setOrderToRejectId(orderId);
    setRejectionReason('');
    setIsRejectModalOpen(true);
  };

  const confirmRejectOrder = async () => {
    if (!orderToRejectId || !rejectionReason.trim()) return;
    try {
      setLoading(true);
      const res = await rejectedOrder(orderToRejectId, rejectionReason);
      if (res.success) {
        showAlert({ type: 'success', title: 'Éxito', message: 'Orden rechazada correctamente.' });
        fetchOrders();
        setIsRejectModalOpen(false);
      }
    } catch {
      showAlert({ type: 'error', title: 'Error', message: 'No se pudo rechazar la orden.' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReceipt = (imageUrl: string, orderNumber: number | string) => {
    setReceiptImageUrl(imageUrl);
    setReceiptOrderNumber(orderNumber);
    setIsReceiptModalOpen(true);
  };

  const handleViewDetails = async (order: ServiceOrder) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
    setIsEditingDetails(false);
    fetchOrderTrackingData(order.id);
    fetchTripsForOrder(order.id);

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
    setOrderTrips(originalOrderTrips);
    setPendingPlannedTrips(null);
    setPendingDriverAssignments({});
    setEditedDeliveryType(originalDeliveryType);
    setEditedDeliveries(originalDeliveries);
    setIsEditingDetails(false);
  }, [originalOrderTrips, originalDeliveryType, originalDeliveries]);

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedOrder(null);
    setOrderTracking(null);
    handleCancelEditing();
  };

  const handleConfirmPlan = (plannedTrips: any[]) => {
    // Guarda la planificación en borrador local sin llamar a la API hasta que se guarde
    setPendingPlannedTrips(plannedTrips);
    const mappedTrips: TripItem[] = plannedTrips.map((p, idx) => ({
      id: `temp-${idx}`,
      tripNumber: `Planificado ${idx + 1}`,
      status: p.driverId ? 'accepted' : 'available',
      totalTons: Number(p.totalTons) || 0,
      assignedDriverId: p.driverId,
      driverId: p.driverId,
    }));
    setOrderTrips(mappedTrips);
    setIsPlannerOpen(false);
  };

  const handleAssignDriverToTrip = (trip: TripItem) => {
    setTripForDriver(trip);
    setIsDriverModalOpen(true);
  };

  const handleSelectDriverForTrip = (driverId: string) => {
    if (!tripForDriver) return;

    if (pendingPlannedTrips) {
      setPendingPlannedTrips((prev) => {
        if (!prev) return prev;
        return prev.map((t, idx) => {
          if (tripForDriver.id === `temp-${idx}` || tripForDriver.id === t.id) {
            return { ...t, driverId };
          }
          return t;
        });
      });
    } else {
      setPendingDriverAssignments((prev) => ({
        ...prev,
        [tripForDriver.id]: driverId,
      }));
    }

    setOrderTrips((prev) =>
      prev.map((t) =>
        t.id === tripForDriver.id
          ? {
              ...t,
              assignedDriverId: driverId,
              driverId,
              status: driverId ? 'accepted' : 'available',
            }
          : t
      )
    );
    setIsDriverModalOpen(false);
  };

  const handleSaveOrderDetails = async () => {
    if (!selectedOrder) return;
    try {
      setLoading(true);

      const deliveryTypeChanged = editedDeliveryType !== originalDeliveryType;
      const deliveriesChanged = JSON.stringify(editedDeliveries) !== JSON.stringify(originalDeliveries);
      const cleanDeliveries = editedDeliveries.map(({ availableAddresses, ...rest }: any) => rest);

      // 1. Si cambió el tipo de entrega o las entregas
      if (deliveryTypeChanged || (editedDeliveryType === 'domicilio' && deliveriesChanged)) {
        if (editedDeliveryType === 'domicilio') {
          for (const d of editedDeliveries) {
            if (!d.address?.placeId && !d.address?.description) {
              showAlert({ type: 'warning', title: 'Falta Dirección', message: 'Todas las entregas deben tener una dirección seleccionada.' });
              setLoading(false);
              return;
            }
            if (!d.quantity || d.quantity <= 0) {
              showAlert({ type: 'warning', title: 'Cantidad Inválida', message: 'Todas las entregas deben tener cantidad mayor a 0.' });
              setLoading(false);
              return;
            }
          }
        }

        const res = await updateOrderDeliveries(selectedOrder.id, editedDeliveryType, cleanDeliveries);
        if (!res?.success) {
          showAlert({ type: 'error', title: 'Error', message: res?.message || 'No se pudo actualizar las entregas.' });
          setLoading(false);
          return;
        }
      }

      // 2. Si hubo replanificación de viajes (split)
      if (pendingPlannedTrips && pendingPlannedTrips.length > 0) {
        const res = await splitOrderTrips(selectedOrder.id, pendingPlannedTrips);
        if (!res?.success) {
          showAlert({ type: 'error', title: 'Error', message: 'No se pudo guardar la planificación de viajes.' });
          setLoading(false);
          return;
        }
      }
      // 3. Si no hubo replanificación pero sí asignaciones de chofer
      else if (Object.keys(pendingDriverAssignments).length > 0) {
        const promises = Object.entries(pendingDriverAssignments).map(([tripId, driverId]) =>
          assignTripDriver(tripId, driverId)
        );
        await Promise.all(promises);
      }

      showAlert({ type: 'success', title: 'Éxito', message: 'Cambios de la orden guardados correctamente.' });

      // Actualizar selectedOrder inmediatamente para que el modal refleje el nuevo tipo y entregas
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
      setPendingPlannedTrips(null);
      setPendingDriverAssignments({});
      setOriginalDeliveryType(editedDeliveryType);
      setOriginalDeliveries(editedDeliveries);
      fetchOrders();
      fetchTripsForOrder(selectedOrder.id);
    } catch (err: any) {
      showAlert({
        type: 'error',
        title: 'Error',
        message: err?.response?.data?.message || err?.message || 'Error al guardar los cambios.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCompletePickup = async () => {
    if (!selectedOrder) return;
    try {
      setLoading(true);
      const res = await completePickupOrder(selectedOrder.id);
      if (res.success) {
        showAlert({ type: 'success', title: 'Éxito', message: 'Retiro en almacén completado.' });
        fetchOrders();
        closeDetailModal();
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    orders,
    loading,
    error,
    currentPage,
    setCurrentPage,
    totalPages,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    orderCounts,
    kpis,
    fetchOrders,
    users,
    drivers,
    isRejectModalOpen,
    rejectionReason,
    setRejectionReason,
    handleRejectOrder,
    confirmRejectOrder,
    setIsRejectModalOpen,
    orderToRejectId,
    isDetailModalOpen,
    selectedOrder,
    orderTrips,
    orderTracking,
    handleViewDetails,
    closeDetailModal,
    isEditingDetails,
    setIsEditingDetails,
    handleCancelEditing,
    handleSaveOrderDetails,
    editedDeliveryType,
    setEditedDeliveryType,
    editedDeliveries,
    handleUpdateDeliveryAddress,
    handleSaveNewAddressSubmit,
    handleApproveOrder,
    handleOpenReceipt,
    isReceiptModalOpen,
    receiptImageUrl,
    receiptOrderNumber,
    setIsReceiptModalOpen,
    isPlannerOpen,
    setIsPlannerOpen,
    orderForPlanning,
    setOrderForPlanning,
    handleConfirmPlan,
    isDriverModalOpen,
    setIsDriverModalOpen,
    tripForDriver,
    handleAssignDriverToTrip,
    handleSelectDriverForTrip,
    handleCompletePickup,
    isAddingNewAddress,
    setIsAddingNewAddress,
    newAddressData,
    setNewAddressData,
    alertConfig,
    closeAlert,
  };
}
