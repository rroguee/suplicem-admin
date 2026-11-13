'use client';

import { useState, useEffect, useCallback } from 'react';
import { Trip, TripFilterStatus } from '../types';
import { getAllTrips, getTripDetail, getDriverLocation } from '@/services/tripsService';

const ITEMS_PER_PAGE = 7;

export function useTripsList() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilterState] = useState<TripFilterStatus>('Todos');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTripsCount, setTotalTripsCount] = useState(0);

  const [counts, setCounts] = useState<Record<TripFilterStatus, number>>({
    Todos: 0,
    available: 0,
    accepted: 0,
    fractional: 0,
    completed: 0,
    canceled: 0,
  });

  const [kpis, setKpis] = useState({
    totalTrips: 0,
    pendingTrips: 0,
    inRouteTrips: 0,
    fractionalTrips: 0,
    completedTrips: 0,
    totalTonsInTransit: 0,
  });

  // Modales
  const [isCreateTripModalOpen, setIsCreateTripModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedTripDetail, setSelectedTripDetail] = useState<Trip | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [driverLocation, setDriverLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  const setStatusFilter = (status: TripFilterStatus) => {
    setStatusFilterState(status);
    setCurrentPage(1);
  };

  const fetchTrips = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAllTrips({
        status: statusFilter,
        search: debouncedSearch.trim() || undefined,
        page: currentPage,
        limit: ITEMS_PER_PAGE,
      });

      if (response.success) {
        setTrips(response.trips || []);
        setTotalPages(response.pagination?.totalPages || 1);
        setTotalTripsCount(response.pagination?.total ?? (response.trips || []).length);
        if (response.counts) setCounts(response.counts);
        if (response.kpis) setKpis(response.kpis);
      } else {
        setError('No se pudieron obtener los viajes.');
      }
    } catch {
      setError('Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, debouncedSearch, currentPage]);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

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

  // Polling en tiempo real para ubicación del chofer mientras el modal de viaje esté abierto
  useEffect(() => {
    if (!isDetailModalOpen || !selectedTripDetail?.assignedDriverId) return;

    const terminalStatuses = ['delivered', 'completed', 'canceled'];
    if (selectedTripDetail.status && terminalStatuses.includes(selectedTripDetail.status)) return;

    const driverId = selectedTripDetail.assignedDriverId;
    const intervalId = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        getDriverLocation(driverId)
          .then((locRes) => {
            if (locRes?.success && locRes.location) {
              setDriverLocation({ lat: locRes.location.lat, lng: locRes.location.lng });
            }
          })
          .catch(() => {});
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, [isDetailModalOpen, selectedTripDetail?.assignedDriverId, selectedTripDetail?.status]);

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedTripDetail(null);
    setDriverLocation(null);
  };

  return {
    trips,
    totalTripsCount,
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
    isDetailModalOpen,
    selectedTripDetail,
    detailLoading,
    detailError,
    driverLocation,
    handleViewTripDetail,
    closeDetailModal,
    isCreateTripModalOpen,
    setIsCreateTripModalOpen,
  };
}
