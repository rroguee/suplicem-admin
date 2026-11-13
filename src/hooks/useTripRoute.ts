import { useState, useEffect, useMemo, RefObject } from 'react';
import protectedApi from '@/services/protectedApi';

export interface RouteCoordinates {
  lat: number;
  lng: number;
}

export interface RoadEstimate {
  formattedDuration: string;
  formattedDistance: string;
}

interface UseTripRouteProps {
  originCoords: RouteCoordinates;
  destCoords: RouteCoordinates | null;
  mapRef: RefObject<google.maps.Map | null>;
}

export const useTripRoute = ({ originCoords, destCoords, mapRef }: UseTripRouteProps) => {
  const [routePoints, setRoutePoints] = useState<RouteCoordinates[]>([]);
  const [roadEstimate, setRoadEstimate] = useState<RoadEstimate | null>(null);

  useEffect(() => {
    if (!destCoords || !destCoords.lat || !destCoords.lng || !originCoords || !originCoords.lat || !originCoords.lng) {
      setRoutePoints([]);
      setRoadEstimate(null);
      return;
    }

    let isMounted = true;
    const fetchDirections = async () => {
      try {
        const response = await protectedApi.get('/trips/directions', {
          params: {
            originLat: originCoords.lat,
            originLng: originCoords.lng,
            destLat: destCoords.lat,
            destLng: destCoords.lng,
          },
        });

        if (isMounted && response.data?.success && response.data?.data) {
          const { points, formattedDuration, formattedDistance } = response.data.data;
          if (Array.isArray(points) && points.length > 0) {
            const mappedPoints: RouteCoordinates[] = points.map((p: any) => ({
              lat: p.latitude,
              lng: p.longitude,
            }));
            setRoutePoints(mappedPoints);
            setRoadEstimate({ formattedDuration, formattedDistance });

            if (mapRef.current && window.google?.maps) {
              const bounds = new window.google.maps.LatLngBounds();
              mappedPoints.forEach((pt) => bounds.extend(pt));
              mapRef.current.fitBounds(bounds, { top: 40, right: 40, bottom: 40, left: 40 });
            }
          }
        }
      } catch (error) {
        console.warn('[useTripRoute] Fallback a trazado directo:', error);
      }
    };

    fetchDirections();

    return () => {
      isMounted = false;
    };
  }, [originCoords.lat, originCoords.lng, destCoords?.lat, destCoords?.lng, mapRef]);

  const routeCoordinates = useMemo(() => {
    // Retornar únicamente los puntos de la ruta vial por calles una vez calculada
    return routePoints;
  }, [routePoints]);

  return { routeCoordinates, roadEstimate };
};
