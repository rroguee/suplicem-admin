import protectedApi from "./protectedApi";

export const getAllTrips = async () => {
  const response = await protectedApi.get("/trips");
  return response.data;
};

export const getTripDetail = async (id: string) => {
  const response = await protectedApi.get(`/trips/${id}`);
  return response.data;
};

export const getTripByOrderId = async (orderId: string) => {
  try {
    const response = await protectedApi.get(`/trips/order/${orderId}`);
    return response.data;
  } catch (error: any) {
    if (error?.response?.status === 404) {
      // Es un estado normal para órdenes pendientes o sin viaje programado
      return { success: false, trip: null, trips: [], message: "Sin viajes asignados" };
    }
    return { success: false, trip: null, trips: [], message: error?.message || "Error al obtener viajes" };
  }
};

export const createTrip = async (
  tripNumber: string,
  orderIds: string[],
  totalTons: number,
  comments: string,
  driverId?: string
) => {
  const payload: Record<string, any> = {
    tripNumber,
    orderIds,
    totalTons,
    comments,
  };
  if (driverId && driverId.trim() !== "") {
    payload.driverId = driverId;
  }
  const response = await protectedApi.post("/trips", payload);
  return response.data;
};

export const assignTripDriver = async (tripId: string, driverId: string) => {
  const response = await protectedApi.patch(`/trips/${tripId}/assign`, { driverId });
  return response.data;
};

export const splitOrderTrips = async (
  orderId: string,
  trips: Array<{
    totalTons: number;
    driverId?: string;
    comments?: string;
    deliveryId?: string;
    destinationAddress?: any;
  }>
) => {
  const response = await protectedApi.post(`/trips/order/${orderId}/split-plan`, { trips });
  return response.data;
};

export const splitSingleTrip = async (
  tripId: string,
  trips: Array<{ totalTons: number; driverId?: string; comments?: string }>
) => {
  const response = await protectedApi.post(`/trips/${tripId}/split`, { trips });
  return response.data;
};

export const updateTripStatus = async (
  tripId: string,
  status: string,
  reason?: string
) => {
  const response = await protectedApi.patch(`/trips/${tripId}/status`, {
    tripId,
    status,
    targetStatus: status,
    reason,
  });
  return response.data;
};

export const getDriverLocation = async (driverId: string) => {
  const response = await protectedApi.get(`/location/${driverId}`);
  return response.data;
};
