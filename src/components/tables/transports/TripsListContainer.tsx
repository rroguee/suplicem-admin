'use client';

import React, { useContext } from 'react';
import { AuthContext } from '@/context/authContext';
import { useTripsList } from './hooks/useTripsList';
import { TripListHeader } from './TripListHeader';
import { TripFilterBar } from './TripFilterBar';
import { TripTable } from './TripTable';
import { CreateTripModal } from './modals/CreateTripModal';
import { TripDetailModal } from './modals/TripDetailModal';

export default function TripsListContainer() {
  const { user: authUser } = useContext(AuthContext);
  const isSeller = authUser?.userType === 'seller';

  const list = useTripsList();

  return (
    <div className="w-full">
      {/* 1. Header con KPIs de Flota */}
      <TripListHeader
        totalTrips={list.kpis.totalTrips}
        pendingTrips={list.kpis.pendingTrips}
        inRouteTrips={list.kpis.inRouteTrips}
        fractionalTrips={list.kpis.fractionalTrips}
        totalTons={list.kpis.totalTonsInTransit}
        onNewTrip={() => list.setIsCreateTripModalOpen(true)}
        isSeller={isSeller}
      />

      {/* 2. Barra de Búsqueda y Filtros con Paridad 1:1 con Suplicem Go */}
      <TripFilterBar
        search={list.search}
        onSearchChange={(val) => {
          list.setSearch(val);
          list.setCurrentPage(1);
        }}
        statusFilter={list.statusFilter}
        onStatusChange={(status) => {
          list.setStatusFilter(status);
          list.setCurrentPage(1);
        }}
        counts={list.counts}
        onRefresh={list.fetchTrips}
        loading={list.loading}
      />

      {/* 3. Tabla Logística de Viajes */}
      <TripTable
        trips={list.trips}
        loading={list.loading}
        error={list.error}
        currentPage={list.currentPage}
        totalPages={list.totalPages}
        onPageChange={list.setCurrentPage}
        onViewDetail={list.handleViewTripDetail}
      />

      {/* Modales Desacoplados */}
      <CreateTripModal
        isOpen={list.isCreateTripModalOpen}
        onClose={() => list.setIsCreateTripModalOpen(false)}
        onSuccess={list.fetchTrips}
      />

      <TripDetailModal
        isOpen={list.isDetailModalOpen}
        onClose={list.closeDetailModal}
        trip={list.selectedTripDetail}
        driverLocation={list.driverLocation}
        loading={list.detailLoading}
        error={list.detailError}
      />
    </div>
  );
}
