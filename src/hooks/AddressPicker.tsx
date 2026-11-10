'use client';

import React, { useState } from 'react';
import { useLoadScript } from '@react-google-maps/api';

const libraries: any = ['places'];
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

interface AddressPickerProps {
  initialValue?: string;
  onPlaceSelected: (data: {
    placeId: string;
    description: string;
    latitude: number;
    longitude: number;
  }) => void;
}

export default function AddressPicker({ onPlaceSelected, initialValue = '' }: AddressPickerProps) {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: API_KEY,
    libraries,
  });

  const [query, setQuery] = useState<string>(initialValue);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSearch = async (text: string) => {
    setQuery(text);
    if (text.length < 3) {
      setResults([]);
      return;
    }

    if (!isLoaded || !window.google?.maps?.places) {
      return;
    }

    setLoading(true);
    try {
      const placesLib = window.google.maps.places as any;

      if (placesLib.AutocompleteSuggestion?.fetchAutocompleteSuggestions) {
        const response = await placesLib.AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input: text,
          includedRegionCodes: ['do'],
        });

        const mappedSuggestions = (response.suggestions || [])
          .filter((s: any) => s.placePrediction)
          .map((s: any) => ({
            placeId: s.placePrediction.placeId,
            description: s.placePrediction.text?.toString() || '',
            rawPrediction: s.placePrediction,
          }));

        setResults(mappedSuggestions);
      } else {
        setResults([]);
      }
    } catch (err) {
      console.error('Error buscando sugerencias con Places (New):', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (item: { placeId: string; description: string; rawPrediction?: any }) => {
    setResults([]);
    setQuery(item.description);

    try {
      let lat = 0;
      let lng = 0;
      let finalAddress = item.description;

      if (item.rawPrediction?.toPlace) {
        const place = item.rawPrediction.toPlace();
        await place.fetchFields({
          fields: ['formattedAddress', 'location'],
        });

        if (place.location) {
          lat = typeof place.location.lat === 'function' ? place.location.lat() : Number(place.location.lat);
          lng = typeof place.location.lng === 'function' ? place.location.lng() : Number(place.location.lng);
        }
        if (place.formattedAddress) {
          finalAddress = place.formattedAddress;
        }
      }

      onPlaceSelected({
        placeId: item.placeId,
        description: finalAddress,
        latitude: lat,
        longitude: lng,
      });
    } catch (err) {
      console.error('Error obteniendo coordenadas de lugar con Places (New):', err);
      onPlaceSelected({
        placeId: item.placeId,
        description: item.description,
        latitude: 0,
        longitude: 0,
      });
    }
  };

  return (
    <div className="mb-4 relative">
      <input
        type="text"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Buscar dirección en República Dominicana"
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500"
      />

      {loading && (
        <div className="flex justify-center mt-2">
          <div className="w-4 h-4 rounded-full animate-spin border-2 border-solid border-orange-500 border-t-transparent"></div>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600 shadow-md max-h-48 overflow-y-auto z-50">
          {results.map((item) => (
            <button
              key={item.placeId}
              type="button"
              onClick={() => handleSelect(item)}
              className="w-full text-left p-3 hover:bg-gray-100 dark:hover:bg-gray-600 border-b border-gray-200 dark:border-gray-600 last:border-b-0 focus:outline-none"
            >
              <p className="text-gray-900 dark:text-white text-sm">
                {item.description}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
