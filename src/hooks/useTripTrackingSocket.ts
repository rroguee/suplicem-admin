import { useState, useEffect, useRef } from 'react';
import { socketService } from '@/services/socketService';
import { getValidToken } from '@/utils/refreshToken';

interface UseTripTrackingSocketOptions {
  tripId?: string;
  initialLocation?: { lat: number; lng: number } | null;
}

export function useTripTrackingSocket({ tripId, initialLocation }: UseTripTrackingSocketOptions) {
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(
    initialLocation || null
  );
  const [heading, setHeading] = useState<number>(0);
  const [isLive, setIsLive] = useState<boolean>(false);

  const currentPosRef = useRef<{ lat: number; lng: number } | null>(initialLocation || null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (initialLocation && !currentPosRef.current) {
      currentPosRef.current = initialLocation;
      setCurrentLocation(initialLocation);
    }
  }, [initialLocation]);

  useEffect(() => {
    if (!tripId) return;

    let isMounted = true;

    const setup = async () => {
      const token = await getValidToken();
      if (!isMounted) return;

      socketService.connect(token || undefined);
      socketService.joinTrip(tripId);

      const unsubscribe = socketService.onLocationUpdate((data) => {
        if (!isMounted || data.tripId !== tripId) return;

        setIsLive(true);
        if (data.heading !== undefined) setHeading(data.heading);

        const targetLat = (data as any).lat ?? (data as any).latitude;
        const targetLng = (data as any).lng ?? (data as any).longitude;
        const target = { lat: targetLat, lng: targetLng };
        if (!currentPosRef.current) {
          currentPosRef.current = target;
          setCurrentLocation(target);
          return;
        }

        // Interpolación fluida a 60 FPS durante el intervalo (3.5s)
        const start = { ...currentPosRef.current };
        const startTime = performance.now();
        const duration = 3500;

        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

        const step = (now: number) => {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);

          const interpolated = {
            lat: start.lat + (target.lat - start.lat) * progress,
            lng: start.lng + (target.lng - start.lng) * progress,
          };

          currentPosRef.current = interpolated;
          setCurrentLocation(interpolated);

          if (progress < 1) {
            animFrameRef.current = requestAnimationFrame(step);
          }
        };

        animFrameRef.current = requestAnimationFrame(step);
      });

      return unsubscribe;
    };

    const cleanupPromise = setup();

    return () => {
      isMounted = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      cleanupPromise.then((unsubscribe) => {
        if (unsubscribe) unsubscribe();
        socketService.leaveTrip(tripId);
      });
    };
  }, [tripId]);

  return { currentLocation, heading, isLive };
}
