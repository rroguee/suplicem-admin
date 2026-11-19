'use client';

import { useState, useCallback } from 'react';
import { TripItem } from '../../logistics/OrderTripsProgressCard';
import { ServiceOrder } from '../types';
import { getTripByOrderId, assignTripDriver, splitOrderTrips } from '@/services/tripsService';

export function useOrderTripsPlanning() {
  const [orderTrips, setOrderTrips] = useState<TripItem[]>([]);
  const [originalOrderTrips, setOriginalOrderTrips] = useState<TripItem[]>([]);
  const [pendingPlannedTrips, setPendingPlannedTrips] = useState<any[] | null>(null);
  const [pendingDriverAssignments, setPendingDriverAssignments] = useState<Record<string, string>>({});

  const [isPlannerOpen, setIsPlannerOpen] = useState(false);
  const [orderForPlanning, setOrderForPlanning] = useState<ServiceOrder | null>(null);
  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);
  const [tripForDriver, setTripForDriver] = useState<TripItem | null>(null);

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

  const resetTripsState = useCallback(() => {
    setOrderTrips(originalOrderTrips);
    setPendingPlannedTrips(null);
    setPendingDriverAssignments({});
  }, [originalOrderTrips]);

  const handleConfirmPlan = (plannedTrips: any[]) => {
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

  const saveTripsOrAssignments = async (orderId: string) => {
    if (pendingPlannedTrips && pendingPlannedTrips.length > 0) {
      const res = await splitOrderTrips(orderId, pendingPlannedTrips);
      if (!res?.success) {
        throw new Error('No se pudo guardar la planificación de viajes.');
      }
    } else if (Object.keys(pendingDriverAssignments).length > 0) {
      const promises = Object.entries(pendingDriverAssignments).map(([tripId, driverId]) =>
        assignTripDriver(tripId, driverId)
      );
      await Promise.all(promises);
    }
  };

  const finalizeSavedTrips = (orderId: string) => {
    setPendingPlannedTrips(null);
    setPendingDriverAssignments({});
    fetchTripsForOrder(orderId);
  };

  return {
    orderTrips,
    isPlannerOpen,
    setIsPlannerOpen,
    orderForPlanning,
    setOrderForPlanning,
    tripForDriver,
    isDriverModalOpen,
    setIsDriverModalOpen,
    fetchTripsForOrder,
    resetTripsState,
    handleConfirmPlan,
    handleAssignDriverToTrip,
    handleSelectDriverForTrip,
    saveTripsOrAssignments,
    finalizeSavedTrips,
  };
}
