import { useState, useEffect, useMemo, useRef, RefObject } from 'react';
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

export const useTripRoute = ({ originCoords, destCoords }: UseTripRouteProps) => {
  const [fullRoutePoints, setFullRoutePoints] = useState<RouteCoordinates[]>([]);
  const [roadEstimate, setRoadEstimate] = useState<RoadEstimate | null>(null);
  const lastFetchedOrigin = useRef<RouteCoordinates | null>(null);

  useEffect(() => {
    if (!destCoords?.lat || !destCoords?.lng || !originCoords?.lat || !originCoords?.lng) {
      setFullRoutePoints([]);
      setRoadEstimate(null);
      return;
    }

    // Si ya tenemos una ruta y el camión no se ha desviado significativamente (>1km), no rehacer fetch
    if (fullRoutePoints.length > 0 && lastFetchedOrigin.current) {
      const distFromLastFetch = Math.hypot(
        originCoords.lat - lastFetchedOrigin.current.lat,
        originCoords.lng - lastFetchedOrigin.current.lng
      );
      // ~0.01 grados equivale aprox a 1 km
      if (distFromLastFetch < 0.01) {
        return;
      }
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
            setFullRoutePoints(mappedPoints);
            setRoadEstimate({ formattedDuration, formattedDistance });
            lastFetchedOrigin.current = { lat: originCoords.lat, lng: originCoords.lng };
          }
        }
      } catch (error) {
        console.warn('[useTripRoute] Fallback:', error);
      }
    };

    fetchDirections();

    return () => {
      isMounted = false;
    };
  }, [originCoords.lat, originCoords.lng, destCoords?.lat, destCoords?.lng, fullRoutePoints.length]);

  // Recorte dinámico instantáneo: la línea va desapareciendo a la par del avance del camión
  const routeCoordinates = useMemo(() => {
    if (fullRoutePoints.length === 0) return [];
    if (!originCoords?.lat || !originCoords?.lng) return fullRoutePoints;

    let closestIndex = 0;
    let minDistance = Infinity;

    for (let i = 0; i < fullRoutePoints.length; i++) {
      const pt = fullRoutePoints[i];
      const dist = Math.hypot(pt.lat - originCoords.lat, pt.lng - originCoords.lng);
      if (dist < minDistance) {
        minDistance = dist;
        closestIndex = i;
      }
    }

    // Omitir los puntos ya transitados y arrancar la línea visible desde la posición actual del camión
    const remainingRoad = fullRoutePoints.slice(closestIndex);
    return [{ lat: originCoords.lat, lng: originCoords.lng }, ...remainingRoad];
  }, [fullRoutePoints, originCoords.lat, originCoords.lng]);

  return { routeCoordinates, roadEstimate };
};
