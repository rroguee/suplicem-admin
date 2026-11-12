'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ServiceOrder, EditableDelivery, AlertConfig } from '../types';
import { FilterStatus } from '../../logistics/OrderFilterChips';
import { TripItem } from '../../logistics/OrderTripsProgressCard';
import { User, getUsers } from '@/services/usersService';
import {
  getOrders,
  approveOrder,
  rejectedOrder,
  getOrderTracking,
  completePickupOrder,
} from '@/services/ordersService';
import { getTripByOrderId, assignTripDriver, splitOrderTrips } from '@/services/tripsService';
import { NewAddressFormState } from '../modals/OrderAddAddressModal';

const ITEMS_PER_PAGE = 7;

export function useOrdersList() {
  const router = useRouter();

  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
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
  const [editedDeliveries, setEditedDeliveries] = useState<EditableDelivery[]>([]);
  const [orderTracking, setOrderTracking] = useState<any>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [receiptImageUrl, setReceiptImageUrl] = useState<string | null>(null);
  const [receiptOrderNumber, setReceiptOrderNumber] = useState<number | string>('');
  const [isPlannerOpen, setIsPlannerOpen] = useState(false);
  const [orderForPlanning, setOrderForPlanning] = useState<ServiceOrder | null>(null);
  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);
  const [tripForDriver, setTripForDriver] = useState<TripItem | null>(null);
  const [orderTrips, setOrderTrips] = useState<TripItem[]>([]);
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

  const [alertConfig, setAlertConfig] = useState<AlertConfig>({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
  });

  const showAlert = (config: Omit<AlertConfig, 'isOpen'>) => {
    setAlertConfig({ ...config, isOpen: true });
  };

  const closeAlert = () => {
    setAlertConfig((prev) => ({ ...prev, isOpen: false }));
  };

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

  const fetchUsers = useCallback(async () => {
    try {
      const [clientsRes, driversRes] = await Promise.all([
        getUsers({ userType: 'client' }),
        getUsers({ userType: 'driver' }),
      ]);
      if (clientsRes?.success) setUsers(clientsRes.users || []);
      if (driversRes?.success) setDrivers(driversRes.users || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  }, []);

  const fetchTripsForOrder = useCallback(async (orderId: string) => {
    try {
      const response = await getTripByOrderId(orderId);
      if (response?.success && Array.isArray(response?.trips)) {
        setOrderTrips(response.trips);
      } else if (response?.trip) {
        setOrderTrips([response.trip]);
      } else {
        setOrderTrips([]);
      }
    } catch (err) {
      console.error('Error fetching trips for order:', err);
      setOrderTrips([]);
    }
  }, []);

  const fetchOrderTrackingData = useCallback(async (orderId: string) => {
    try {
      const res = await getOrderTracking(orderId);
      if (res?.success) setOrderTracking(res);
    } catch (err) {
      console.error('Error fetching order tracking:', err);
    }
  }, []);

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
    fetchUsers();
  }, [fetchUsers]);

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

  const handleViewDetails = (order: ServiceOrder) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
    fetchOrderTrackingData(order.id);
    fetchTripsForOrder(order.id);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedOrder(null);
  };

  const handleConfirmPlan = async (plannedTrips: any[]) => {
    if (!orderForPlanning) return;
    try {
      setLoading(true);
      const res = await splitOrderTrips(orderForPlanning.id, plannedTrips);
      if (res.success) {
        showAlert({ type: 'success', title: 'Éxito', message: 'Viajes planificados correctamente.' });
        setIsPlannerOpen(false);
        fetchOrders();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAssignDriverToTrip = (trip: TripItem) => {
    setTripForDriver(trip);
    setIsDriverModalOpen(true);
  };

  const handleSelectDriverForTrip = async (driverId: string) => {
    if (!tripForDriver) return;
    try {
      setLoading(true);
      const res = await assignTripDriver(tripForDriver.id, driverId);
      if (res.success) {
        showAlert({ type: 'success', title: 'Éxito', message: 'Conductor asignado.' });
        if (selectedOrder) fetchTripsForOrder(selectedOrder.id);
      }
    } finally {
      setLoading(false);
      setIsDriverModalOpen(false);
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
    editedDeliveryType,
    setEditedDeliveryType,
    editedDeliveries,
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
