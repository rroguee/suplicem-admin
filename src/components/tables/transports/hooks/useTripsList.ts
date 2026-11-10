'use client';

import { useState, useEffect, useCallback } from 'react';
import { Trip, TripFilterStatus } from '../types';
import { useTripFilters } from './useTripFilters';
import { getAllTrips, getTripDetail, getDriverLocation } from '@/services/tripsService';

const ITEMS_PER_PAGE = 7;

export function useTripsList() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TripFilterStatus>('Todos');
  const [currentPage, setCurrentPage] = useState(1);

  // Modales
  const [isCreateTripModalOpen, setIsCreateTripModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedTripDetail, setSelectedTripDetail] = useState<Trip | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [driverLocation, setDriverLocation] = useState<{ lat: number; lng: number } | null>(null);

  const fetchTrips = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAllTrips();
      if (response.success) {
        // Ordenar con viajes activos primero, luego pendientes
        const sorted = (response.trips || []).sort((a: Trip, b: Trip) => {
          const priority: Record<string, number> = {
            started: 1,
            in_progress: 1,
            accepted: 2,
            available: 3,
            completed: 4,
            canceled: 5,
          };
          const pA = priority[a.status || ''] || 99;
          const pB = priority[b.status || ''] || 99;
          if (pA !== pB) return pA - pB;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        setTrips(sorted);
      } else {
        setError('No se pudieron obtener los viajes.');
      }
    } catch (err) {
      setError('Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const { filteredTrips, paginatedTrips, counts, totalPages, kpis } = useTripFilters({
    trips,
    search,
    statusFilter,
    currentPage,
    itemsPerPage: ITEMS_PER_PAGE,
  });

  const handleViewTripDetail = async (tripId: string) => {
    setIsDetailModalOpen(true);
    setDetailLoading(true);
    setDetailError(null);
    setSelectedTripDetail(null);
    setDriverLocation(null);

    try {
      const response = await getTripDetail(tripId);
      if (response.success && response.trip) {
        setSelectedTripDetail(response.trip);
        if (response.trip.assignedDriverId) {
          getDriverLocation(response.trip.assignedDriverId)
            .then((locRes) => {
              if (locRes?.success && locRes.location) {
                setDriverLocation({ lat: locRes.location.lat, lng: locRes.location.lng });
              }
            })
            .catch(() => {});
        }
      } else {
        setDetailError(response.message || 'No se pudo cargar el detalle del viaje.');
      }
    } catch {
      setDetailError('Error de conexión al cargar el viaje.');
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedTripDetail(null);
    setDriverLocation(null);
  };

  return {
    trips: paginatedTrips,
    totalTripsCount: filteredTrips.length,
    loading,
    error,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    currentPage,
    setCurrentPage,
    totalPages,
    counts,
    kpis,
    fetchTrips,
    // Detalle
    isDetailModalOpen,
    selectedTripDetail,
    detailLoading,
    detailError,
    driverLocation,
    handleViewTripDetail,
    closeDetailModal,
    // Crear viaje
    isCreateTripModalOpen,
    setIsCreateTripModalOpen,
  };
}
