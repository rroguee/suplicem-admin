'use client';

import React, { useContext } from 'react';
import { AuthContext } from '@/context/authContext';
import { useOrdersList } from './hooks/useOrdersList';
import { OrdersListHeader } from './OrdersListHeader';
import { OrdersFilterBar } from './OrdersFilterBar';
import { OrdersTable } from './OrdersTable';
import dynamic from 'next/dynamic';
import CustomAlert from '@/components/CustomAlert';

const OrderRejectModal = dynamic(
  () => import('./modals/OrderRejectModal').then((mod) => mod.OrderRejectModal),
  { ssr: false }
);
const OrderDetailModal = dynamic(
  () => import('./modals/OrderDetailModal').then((mod) => mod.OrderDetailModal),
  { ssr: false }
);
const OrderAddAddressModal = dynamic(
  () => import('./modals/OrderAddAddressModal').then((mod) => mod.OrderAddAddressModal),
  { ssr: false }
);
const ReceiptViewerModal = dynamic(
  () => import('../logistics/ReceiptViewerModal').then((mod) => mod.ReceiptViewerModal),
  { ssr: false }
);
const DriverSelectionModal = dynamic(
  () => import('../logistics/DriverSelectionModal').then((mod) => mod.DriverSelectionModal),
  { ssr: false }
);
const OrderTripPlannerModal = dynamic(
  () => import('../logistics/OrderTripPlannerModal').then((mod) => mod.OrderTripPlannerModal),
  { ssr: false }
);

export default function OrdersListContainer() {
  const { user: authUser } = useContext(AuthContext);
  const isSeller = authUser?.userType === 'seller';

  const list = useOrdersList();

  return (
    <div className="w-full">
      {/* 1. Header con KPIs Ejecutivos (elimina títulos redundantes) */}
      <OrdersListHeader
        pendingCount={list.kpis.pendingCount}
        pendingAmount={list.kpis.pendingAmount}
        inRouteCount={list.kpis.inRouteCount}
        approvedCount={list.kpis.approvedCount}
        aiRiskCount={list.kpis.aiRiskCount}
      />

      {/* 2. Barra de Filtros y Búsqueda */}
      <OrdersFilterBar
        search={list.search}
        onSearchChange={(val) => {
          list.setSearch(val);
          list.setCurrentPage(1);
        }}
        statusFilter={list.statusFilter}
        onStatusFilterChange={(status) => {
          list.setStatusFilter(status);
          list.setCurrentPage(1);
        }}
        orderCounts={list.orderCounts}
        onRefresh={list.fetchOrders}
        loading={list.loading}
      />

      {/* 3. Tabla de Datos con Acciones Contextuales y Números Tabulares */}
      <OrdersTable
        orders={list.orders}
        loading={list.loading}
        error={list.error}
        isSeller={isSeller}
        currentPage={list.currentPage}
        totalPages={list.totalPages}
        onPageChange={list.setCurrentPage}
        onApprove={list.handleApproveOrder}
        onReject={list.handleRejectOrder}
        onViewDetails={list.handleViewDetails}
        onPlanTrips={(order) => {
          list.setOrderForPlanning(order);
          list.setIsPlannerOpen(true);
        }}
        onOpenReceipt={list.handleOpenReceipt}
      />

      {/* Modales Desacoplados */}
      <OrderRejectModal
        isOpen={list.isRejectModalOpen}
        orderNumber={list.orders.find((o) => o.id === list.orderToRejectId)?.orderNumber || ''}
        reason={list.rejectionReason}
        onReasonChange={list.setRejectionReason}
        onConfirm={list.confirmRejectOrder}
        onClose={() => list.setIsRejectModalOpen(false)}
        loading={list.loading}
      />

      <OrderDetailModal
        isOpen={list.isDetailModalOpen}
        onClose={list.closeDetailModal}
        selectedOrder={list.selectedOrder}
        orderTrips={list.orderTrips}
        drivers={list.drivers}
        isSeller={isSeller}
        isEditingDetails={list.isEditingDetails}
        setIsEditingDetails={list.setIsEditingDetails}
        editedDeliveryType={list.editedDeliveryType}
        setEditedDeliveryType={list.setEditedDeliveryType}
        editedDeliveries={list.editedDeliveries}
        onUpdateDeliveryAddress={list.handleUpdateDeliveryAddress}
        onOpenAddAddressModal={() => list.setIsAddingNewAddress(true)}
        onSaveDetails={list.handleSaveOrderDetails}
        onCancelDetails={list.handleCancelEditing}
        onEdit={() => list.setIsEditingDetails(true)}
        orderTracking={list.orderTracking}
        onOpenReceipt={list.handleOpenReceipt}
        onOpenPlanner={(order) => {
          list.setOrderForPlanning(order);
          list.setIsPlannerOpen(true);
        }}
        onAssignDriver={list.handleAssignDriverToTrip}
        onCompletePickup={list.handleCompletePickup}
        loading={list.loading}
      />

      <ReceiptViewerModal
        isOpen={list.isReceiptModalOpen}
        onClose={() => list.setIsReceiptModalOpen(false)}
        imageUrl={list.receiptImageUrl}
        orderNumber={list.receiptOrderNumber}
      />

      <DriverSelectionModal
        isOpen={list.isDriverModalOpen}
        onClose={() => list.setIsDriverModalOpen(false)}
        drivers={list.drivers}
        selectedDriverId={list.tripForDriver?.assignedDriverId || list.tripForDriver?.driverId || ''}
        onSelectDriver={list.handleSelectDriverForTrip}
        targetTons={list.tripForDriver?.totalTons}
      />

      {list.isPlannerOpen && list.orderForPlanning && (
        <OrderTripPlannerModal
          isOpen={list.isPlannerOpen}
          onClose={() => {
            list.setIsPlannerOpen(false);
            list.setOrderForPlanning(null);
          }}
          orderTotalTons={Number(list.orderForPlanning.totalTons || list.orderForPlanning.pendingBalance || 0)}
          drivers={list.drivers}
          onConfirmPlan={list.handleConfirmPlan}
          isSaving={list.loading}
        />
      )}

      {list.isAddingNewAddress && (
        <OrderAddAddressModal
          isOpen={list.isAddingNewAddress}
          onClose={() => list.setIsAddingNewAddress(false)}
          data={list.newAddressData}
          onChange={list.setNewAddressData}
          onSubmit={list.handleSaveNewAddressSubmit}
        />
      )}

      <CustomAlert
        isOpen={list.alertConfig.isOpen}
        type={list.alertConfig.type}
        title={list.alertConfig.title}
        message={list.alertConfig.message}
        onConfirm={list.alertConfig.onConfirm}
        onCancel={list.alertConfig.onCancel}
        onClose={list.closeAlert}
      />
    </div>
  );
}
