/**
 * Cálculo de distancia Haversine y tiempo aproximado de viaje para el panel Admin.
 */

export interface TripEstimate {
  distanceKm: string;
  durationMinutes: number;
  formattedText: string;
}

export const WAREHOUSE_LOCATION = {
  lat: 18.4861,
  lng: -69.9312,
  name: "Almacén Central Suplicem",
  address: "Av. John F. Kennedy, Santo Domingo",
};

export const calculateTripEstimate = (
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
): TripEstimate | null => {
  if (
    !origin ||
    !destination ||
    !origin.lat ||
    !origin.lng ||
    !destination.lat ||
    !destination.lng
  ) {
    return null;
  }

  const R = 6371; // Radio de la Tierra en km
  const dLat = ((destination.lat - origin.lat) * Math.PI) / 180;
  const dLon = ((destination.lng - origin.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((origin.lat * Math.PI) / 180) *
      Math.cos((destination.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightDistanceKm = R * c;

  const drivingDistanceKm = Math.max(0.5, straightDistanceKm * 1.35);
  const durationMinutes = Math.max(4, Math.round((drivingDistanceKm / 35) * 60));

  return {
    distanceKm: drivingDistanceKm.toFixed(1),
    durationMinutes,
    formattedText: `⏱️ ~${durationMinutes} min (${drivingDistanceKm.toFixed(1)} km)`,
  };
};
