'use client';

import { useMemo } from 'react';
import { Trip, TripFilterStatus, isTripFractional } from '../types';

interface UseTripFiltersParams {
  trips: Trip[];
  search: string;
  statusFilter: TripFilterStatus;
  currentPage: number;
  itemsPerPage: number;
}

export function useTripFilters({
  trips,
  search,
  statusFilter,
  currentPage,
  itemsPerPage,
}: UseTripFiltersParams) {
  return useMemo(() => {
    const counts: Record<TripFilterStatus, number> = {
      Todos: trips.length,
      available: 0,
      accepted: 0,
      fractional: 0,
      completed: 0,
      canceled: 0,
    };

    let totalTonsInTransit = 0;

    trips.forEach((t) => {
      let status = t.status || 'default';
      if (status === 'started' || status === 'in_progress') {
        status = 'accepted';
      }
      if (status === 'assigned') {
        status = 'available';
      }
      if (counts[status as TripFilterStatus] !== undefined) {
        counts[status as TripFilterStatus] = (counts[status as TripFilterStatus] || 0) + 1;
      }
      if (isTripFractional(t.tripNumber)) {
        counts.fractional = (counts.fractional || 0) + 1;
      }
      if (['available', 'accepted', 'started', 'in_progress'].includes(t.status || '')) {
        totalTonsInTransit += Number(t.totalTons) || 0;
      }
    });

    const filtered = trips.filter((trip) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        q === '' ||
        trip.tripNumber?.toLowerCase().includes(q) ||
        trip.comments?.toLowerCase().includes(q) ||
        trip.orderIds?.some((id) => id.toLowerCase().includes(q));

      const matchesStatus =
        statusFilter === 'Todos' ||
        (statusFilter === 'fractional' && isTripFractional(trip.tripNumber)) ||
        trip.status === statusFilter ||
        (statusFilter === 'available' && trip.status === 'assigned') ||
        (statusFilter === 'accepted' &&
          (trip.status === 'started' || trip.status === 'in_progress'));

      return matchesSearch && matchesStatus;
    });

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const start = (currentPage - 1) * itemsPerPage;
    const paginatedTrips = filtered.slice(start, start + itemsPerPage);

    return {
      filteredTrips: filtered,
      paginatedTrips,
      counts,
      totalPages,
      kpis: {
        totalTrips: trips.length,
        pendingTrips: counts.available,
        inRouteTrips: counts.accepted,
        fractionalTrips: counts.fractional,
        completedTrips: counts.completed,
        totalTonsInTransit,
      },
    };
  }, [trips, search, statusFilter, currentPage, itemsPerPage]);
}
