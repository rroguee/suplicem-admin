'use client';

import React, { useState } from 'react';
import { GoogleMap, Marker, InfoWindow, Polyline, useLoadScript } from '@react-google-maps/api';
import { calculateTripEstimate, WAREHOUSE_LOCATION } from '@/utils/tripEstimate';

const defaultContainerStyle = {
  width: '100%',
  height: '320px',
  borderRadius: '10px',
};
const libraries = ['places'] as any;

interface DeliveryDetails {
  clientName: string;
  clientPhone?: string;
  addressDescription: string;
  additionalInfo?: string;
  position: { lat: number; lng: number };
}

interface DeliveryAddress {
  latitude: number;
  longitude: number;
  description: string;
  additionalInfo?: string;
}

interface TripMapProps {
  driverLocation?: { lat: number; lng: number } | null;
  deliveries?: {
    address: DeliveryAddress;
    userId?: string;
    userNames?: string;
    userLastNames?: string;
    userPhone?: string;
  }[];
  driverInfo?: { names: string; phone?: string } | null;
  height?: string;
}

const TripMap: React.FC<TripMapProps> = ({
  driverLocation,
  deliveries = [],
  driverInfo,
  height,
}) => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  const [driverInfoWindowOpen, setDriverInfoWindowOpen] = useState(false);
  const [deliveryInfoWindow, setDeliveryInfoWindow] = useState<DeliveryDetails | null>(null);

  if (loadError) {
    return (
      <div
        style={{ width: '100%', height: height || '320px', borderRadius: '10px' }}
        className="flex items-center justify-center bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900"
      >
        <p className="text-center text-red-500 font-medium">Error al cargar Google Maps.</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div
        style={{ width: '100%', height: height || '320px', borderRadius: '10px' }}
        className="flex items-center justify-center bg-gray-100 dark:bg-gray-800"
      >
        <p className="text-center text-gray-500 dark:text-gray-400 animate-pulse">Cargando mapa...</p>
      </div>
    );
  }

  // Filtrar entregas válidas con coordenadas lat/lng
  const validDeliveries = deliveries?.filter(
    (d) => d?.address?.latitude && d?.address?.longitude
  ) || [];

  const firstValidDelivery = validDeliveries[0];

  const hasAnyPoints = Boolean(driverLocation || validDeliveries.length > 0);

  if (!hasAnyPoints) {
    return (
      <div
        style={{ width: '100%', height: height || '320px', borderRadius: '10px' }}
        className="flex items-center justify-center bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
      >
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          No hay coordenadas registradas para mostrar en el mapa.
        </p>
      </div>
    );
  }

  const originCoords = driverLocation || WAREHOUSE_LOCATION;
  const destCoords = firstValidDelivery
    ? {
        lat: Number(firstValidDelivery.address.latitude),
        lng: Number(firstValidDelivery.address.longitude),
      }
    : null;

  const estimate = destCoords ? calculateTripEstimate(originCoords, destCoords) : null;

  const center = originCoords;

  const handleDeliveryClick = (delivery: any) => {
    const name = delivery.userNames || delivery.userLastNames
      ? `${delivery.userNames || ''} ${delivery.userLastNames || ''}`.trim()
      : 'Cliente';

    setDeliveryInfoWindow({
      clientName: name,
      clientPhone: delivery.userPhone || '',
      addressDescription: delivery.address.description,
      additionalInfo: delivery.address.additionalInfo,
      position: {
        lat: Number(delivery.address.latitude),
        lng: Number(delivery.address.longitude),
      },
    });
  };

  const containerStyle = {
    ...defaultContainerStyle,
    height: height || defaultContainerStyle.height,
  };

  return (
    <div className="relative w-full">
      {/* Banner de Estimación de Tiempo de Viaje */}
      {estimate && (
        <div className="mb-2 p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
          <div>
            <span className="font-bold text-blue-900 dark:text-blue-300">🏢 Partida:</span>{' '}
            <span className="text-gray-700 dark:text-gray-300">
              {driverLocation ? 'Camión en camino' : WAREHOUSE_LOCATION.name}
            </span>
            <span className="mx-2 hidden sm:inline">•</span>
            <span className="font-bold text-blue-900 dark:text-blue-300">📍 Llegada:</span>{' '}
            <span className="text-gray-700 dark:text-gray-300">
              {firstValidDelivery?.address?.description || 'Destino del cliente'}
            </span>
          </div>
          <div className="font-bold text-red-600 dark:text-red-400 bg-white dark:bg-gray-800 px-2.5 py-1 rounded border border-red-200 dark:border-red-900 shadow-sm">
            {estimate.formattedText}
          </div>
        </div>
      )}

      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={13}>
        {/* Marcador de Partida / Conductor o Almacén */}
        {driverLocation ? (
          <Marker
            position={driverLocation}
            onClick={() => setDriverInfoWindowOpen(true)}
            icon={{
              url: '/images/grid-image/camion.png',
              scaledSize: new window.google.maps.Size(40, 40),
            }}
          />
        ) : (
          <Marker
            position={WAREHOUSE_LOCATION}
            title="Punto de Partida - Almacén Central"
          />
        )}

        {/* InfoWindow del Conductor */}
        {driverInfoWindowOpen && driverLocation && (
          <InfoWindow
            position={driverLocation}
            onCloseClick={() => setDriverInfoWindowOpen(false)}
          >
            <div className="p-2 max-w-xs">
              <h4 className="font-bold text-gray-900">Ubicación del Conductor</h4>
              {driverInfo?.names && (
                <p className="text-sm text-gray-700 mt-1">
                  <strong>Nombre:</strong> {driverInfo.names}
                </p>
              )}
              {driverInfo?.phone && (
                <p className="text-sm text-gray-700">
                  <strong>Teléfono:</strong> {driverInfo.phone}
                </p>
              )}
            </div>
          </InfoWindow>
        )}

        {/* Marcadores de Puntos de Entrega */}
        {validDeliveries.map((delivery, index) => (
          <Marker
            key={index}
            position={{
              lat: Number(delivery.address.latitude),
              lng: Number(delivery.address.longitude),
            }}
            title={`Punto de llegada: ${delivery.address.description}`}
            onClick={() => handleDeliveryClick(delivery)}
          />
        ))}

        {/* Línea de ruta entre Partida y Llegada */}
        {destCoords && (
          <Polyline
            path={[originCoords, destCoords]}
            options={{
              strokeColor: '#E31E24',
              strokeOpacity: 0.8,
              strokeWeight: 4,
            }}
          />
        )}

        {/* InfoWindow de la Entrega */}
        {deliveryInfoWindow && (
          <InfoWindow
            position={deliveryInfoWindow.position}
            onCloseClick={() => setDeliveryInfoWindow(null)}
          >
            <div className="p-2 max-w-xs">
              <h4 className="font-bold text-gray-900">Punto de Entrega</h4>
              {deliveryInfoWindow.clientName && (
                <p className="text-sm text-gray-700 mt-1">
                  <strong>Cliente:</strong> {deliveryInfoWindow.clientName}
                </p>
              )}
              {deliveryInfoWindow.clientPhone && (
                <p className="text-sm text-gray-700">
                  <strong>Teléfono:</strong> {deliveryInfoWindow.clientPhone}
                </p>
              )}
              <p className="text-sm text-gray-700 mt-1">
                <strong>Dirección:</strong> {deliveryInfoWindow.addressDescription}
              </p>
              {deliveryInfoWindow.additionalInfo && (
                <p className="text-sm text-blue-700 mt-1">
                  ℹ️ <strong>Referencia:</strong> {deliveryInfoWindow.additionalInfo}
                </p>
              )}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
};

export default TripMap;