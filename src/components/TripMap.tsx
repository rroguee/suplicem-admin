// src/components/TripMap.tsx
'use client';

import React, { useState } from 'react';
import { GoogleMap, Marker, InfoWindow, useLoadScript } from '@react-google-maps/api';

const mapContainerStyle = {
  width: '100%',
  height: '300px',
  borderRadius: '10px',
};
const libraries = ['places'] as any;

// 👈 Define la interfaz para los datos del cliente que se mostrarán
interface DeliveryDetails {
  clientName: string;
  clientPhone: string;
  addressDescription: string;
  position: { lat: number; lng: number };
}

interface DeliveryAddress {
  latitude: number;
  longitude: number;
  description: string;
}

interface TripMapProps {
  driverLocation: { lat: number; lng: number } | null;
  deliveries: { address: DeliveryAddress; userId: string; userNames: string; userLastNames: string; userPhone: string }[];
  driverInfo?: { names: string; phone: string } | null;
}

const TripMap: React.FC<TripMapProps> = ({ driverLocation, deliveries, driverInfo }) => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });
  const [driverInfoWindowOpen, setDriverInfoWindowOpen] = useState(false);
  
  // 👈 Nuevo estado para la InfoWindow de las entregas
  const [deliveryInfoWindow, setDeliveryInfoWindow] = useState<DeliveryDetails | null>(null);

  if (loadError) {
    return <p className="text-center text-red-500">Error al cargar el mapa.</p>;
  }
  if (!isLoaded) {
    return <p className="text-center text-gray-500 dark:text-gray-400">Cargando mapa...</p>;
  }

  if (!driverLocation) {
    return (
      <div style={mapContainerStyle} className="flex items-center justify-center bg-gray-200 dark:bg-gray-700">
        <p className="text-gray-500 dark:text-gray-400">No hay ubicación del conductor disponible.</p>
      </div>
    );
  }

  // 👈 Función para manejar el clic en un marcador de entrega
  const handleDeliveryClick = (delivery: any) => {
    setDeliveryInfoWindow({
      clientName: `${delivery.userNames} ${delivery.userLastNames}`,
      clientPhone: delivery.userPhone,
      addressDescription: delivery.address.description,
      position: { lat: delivery.address.latitude, lng: delivery.address.longitude },
    });
  };

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={driverLocation} 
      zoom={15}
    >
      {/* Marcador del conductor */}
      <Marker
        position={driverLocation}
        onClick={() => setDriverInfoWindowOpen(true)}
        icon={{
          url: '/images/grid-image/camion.png',
          scaledSize: new window.google.maps.Size(40, 40),
        }}
      />
      {/* InfoWindow del conductor */}
      {driverInfoWindowOpen && driverLocation && (
        <InfoWindow
          position={driverLocation}
          onCloseClick={() => setDriverInfoWindowOpen(false)}
        >
          <div className="p-2">
            <h4 className="font-bold">Datos del Conductor</h4>
            <p><strong>Nombre:</strong> {driverInfo?.names}</p>
            <p><strong>Teléfono:</strong> {driverInfo?.phone}</p>
          </div>
        </InfoWindow>
      )}

      {/* Marcadores de los puntos de entrega */}
      {deliveries?.map((delivery, index) =>
        delivery?.address?.latitude && delivery?.address?.longitude ? (
          <Marker
            key={index}
            position={{ lat: delivery.address.latitude, lng: delivery.address.longitude }}
            title={`Punto de entrega ${index + 1}`}
            // 👈 Evento onClick para el marcador de entrega
            onClick={() => handleDeliveryClick(delivery)}
          />
        ) : null
      )}
      
      {/* InfoWindow de la entrega */}
      {deliveryInfoWindow && (
        <InfoWindow
          position={deliveryInfoWindow.position}
          onCloseClick={() => setDeliveryInfoWindow(null)}
        >
          <div className="p-2">
            <h4 className="font-bold">Datos del Cliente</h4>
            <p><strong>Nombre:</strong> {deliveryInfoWindow.clientName}</p>
            <p><strong>Teléfono:</strong> {deliveryInfoWindow.clientPhone}</p>
            <p><strong>Dirección:</strong> {deliveryInfoWindow.addressDescription}</p>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
};

export default TripMap;