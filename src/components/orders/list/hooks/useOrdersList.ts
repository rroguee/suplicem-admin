'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ServiceOrder } from '../types';
import { useCustomAlert } from '@/hooks/useCustomAlert';
import { User, getUsers } from '@/services/usersService';
import { approveOrder } from '@/services/ordersService';
import { useOrderFilters } from './useOrderFilters';
import { useOrderRejectModal } from './useOrderRejectModal';
import { useOrderDetailModal } from './useOrderDetailModal';

export function useOrdersList() {
  const router = useRouter();
  const { alertConfig, showAlert, closeAlert } = useCustomAlert();

  const [users, setUsers] = useState<User[]>([]);
  const [drivers, setDrivers] = useState<User[]>([]);

  // Comprobante
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [receiptImageUrl, setReceiptImageUrl] = useState<string | null>(null);
  const [receiptOrderNumber, setReceiptOrderNumber] = useState<number | string>('');

  // 1. Hook de Filtros, Búsqueda y Paginación
  const filters = useOrderFilters();

  // 2. Hook de Rechazo de Órdenes
  const rejectModal = useOrderRejectModal({
    fetchOrders: filters.fetchOrders,
    showAlert,
    setGlobalLoading: filters.setLoading,
  });

  // 3. Hook de Detalles, Logística y Planificación de Viajes
  const detailModal = useOrderDetailModal({
    fetchOrders: filters.fetchOrders,
    showAlert,
    setGlobalLoading: filters.setLoading,
  });

  const fetchDrivers = useCallback(async () => {
    try {
      const driversRes = await getUsers({ userType: 'driver', status: 'active' });
      if (driversRes?.success) setDrivers(driversRes.users || []);
    } catch (err) {
      console.error('Error fetching drivers:', err);
    }
  }, []);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  const handleApproveOrder = async (order: ServiceOrder) => {
    if (order.deliveryType === 'almacen') {
      try {
        filters.setLoading(true);
        const res = await approveOrder(order.id);
        if (res.success) {
          showAlert({ type: 'success', title: 'Éxito', message: 'Orden de retiro en almacén aprobada.' });
          filters.fetchOrders();
        } else {
          showAlert({ type: 'error', title: 'Error', message: res.message || 'No se pudo aprobar la orden.' });
        }
      } catch {
        showAlert({ type: 'error', title: 'Error', message: 'No se pudo aprobar la orden.' });
      } finally {
        filters.setLoading(false);
      }
      return;
    }
    router.push(`/admin/orders/${order.id}/approval`);
  };

  const handleOpenReceipt = (imageUrl: string, orderNumber: number | string) => {
    setReceiptImageUrl(imageUrl);
    setReceiptOrderNumber(orderNumber);
    setIsReceiptModalOpen(true);
  };

  return {
    // Filtros & Paginación
    orders: filters.orders,
    loading: filters.loading,
    error: filters.error,
    currentPage: filters.currentPage,
    setCurrentPage: filters.setCurrentPage,
    totalPages: filters.totalPages,
    search: filters.search,
    setSearch: filters.setSearch,
    statusFilter: filters.statusFilter,
    setStatusFilter: filters.setStatusFilter,
    orderCounts: filters.orderCounts,
    kpis: filters.kpis,
    fetchOrders: filters.fetchOrders,

    // Usuarios & Choferes
    users,
    drivers,

    // Modal Rechazo
    isRejectModalOpen: rejectModal.isRejectModalOpen,
    rejectionReason: rejectModal.rejectionReason,
    setRejectionReason: rejectModal.setRejectionReason,
    handleRejectOrder: rejectModal.handleRejectOrder,
    confirmRejectOrder: rejectModal.confirmRejectOrder,
    setIsRejectModalOpen: rejectModal.setIsRejectModalOpen,
    orderToRejectId: rejectModal.orderToRejectId,

    // Modal Detalle & Viajes
    isDetailModalOpen: detailModal.isDetailModalOpen,
    selectedOrder: detailModal.selectedOrder,
    orderTrips: detailModal.orderTrips,
    orderTracking: detailModal.orderTracking,
    handleViewDetails: detailModal.handleViewDetails,
    closeDetailModal: detailModal.closeDetailModal,
    isEditingDetails: detailModal.isEditingDetails,
    setIsEditingDetails: detailModal.setIsEditingDetails,
    handleCancelEditing: detailModal.handleCancelEditing,
    handleSaveOrderDetails: detailModal.handleSaveOrderDetails,
    editedDeliveryType: detailModal.editedDeliveryType,
    setEditedDeliveryType: detailModal.setEditedDeliveryType,
    editedDeliveries: detailModal.editedDeliveries,
    handleUpdateDeliveryAddress: detailModal.handleUpdateDeliveryAddress,
    handleSaveNewAddressSubmit: detailModal.handleSaveNewAddressSubmit,
    isPlannerOpen: detailModal.isPlannerOpen,
    setIsPlannerOpen: detailModal.setIsPlannerOpen,
    orderForPlanning: detailModal.orderForPlanning,
    setOrderForPlanning: detailModal.setOrderForPlanning,
    handleConfirmPlan: detailModal.handleConfirmPlan,
    isDriverModalOpen: detailModal.isDriverModalOpen,
    setIsDriverModalOpen: detailModal.setIsDriverModalOpen,
    tripForDriver: detailModal.tripForDriver,
    handleAssignDriverToTrip: detailModal.handleAssignDriverToTrip,
    handleSelectDriverForTrip: detailModal.handleSelectDriverForTrip,
    handleCompletePickup: detailModal.handleCompletePickup,
    isAddingNewAddress: detailModal.isAddingNewAddress,
    setIsAddingNewAddress: detailModal.setIsAddingNewAddress,
    newAddressData: detailModal.newAddressData,
    setNewAddressData: detailModal.setNewAddressData,

    // Comprobante
    handleOpenReceipt,
    isReceiptModalOpen,
    receiptImageUrl,
    receiptOrderNumber,
    setIsReceiptModalOpen,

    // Acciones y Alertas
    handleApproveOrder,
    alertConfig,
    closeAlert,
  };
}
