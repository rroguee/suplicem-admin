import protectedApi from "./protectedApi";

export const getAllTrips = async () => {
    const response = await protectedApi.get("/trips");
    return response.data;
  };

  export const getTripDetail = async (id: string) => {
    const response = await protectedApi.get(`/trips/${id}`)
    return response.data;
  };

export const createTrip = async (
    tripNumber: string,
    orderIds: string[],
    totalTons: number,
    comments: string
  ) => {
    const response = await protectedApi.post("/trips", {
      tripNumber,
      orderIds,
      totalTons,
      comments,
    });
    return response.data;
  };

  export const getDriverLocation = async (driverId: string) => {
    const response = await protectedApi.get(`/location/${driverId}`);
    return response.data;
  };