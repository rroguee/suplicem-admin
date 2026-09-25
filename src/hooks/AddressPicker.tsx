import React, { useRef, useState } from "react";

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

interface AddressPickerProps {
  initialValue?: string;
  onPlaceSelected: (data: {
    placeId: string;
    description: string;
    latitude: number;
    longitude: number;
  }) => void;
}

interface Prediction {
  place_id: string;
  description: string;
}

export default function AddressPicker({ onPlaceSelected, initialValue = "" }: AddressPickerProps) {
  const [query, setQuery] = useState<string>(initialValue);
  const [results, setResults] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const sessionTokenRef = useRef<string>("");

  const getSessionToken = () => {
    if (!sessionTokenRef.current) {
      sessionTokenRef.current = `admin-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    }
    return sessionTokenRef.current;
  };

  const handleSearch = async (text: string) => {
    setQuery(text);
    if (text.length < 3) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      if (API_KEY && !API_KEY.includes("your_")) {
        const token = getSessionToken();
        const googleUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
          text
        )}&components=country:do&language=es&sessiontoken=${token}&key=${API_KEY}`;

        const res = await fetch(googleUrl);
        const json = await res.json();

        if (json.status === "OK" && json.predictions) {
          setResults(json.predictions);
          setLoading(false);
          return;
        }
      }

      // Fallback a OpenStreetMap Nominatim si no hay API key de Google configurada
      const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        text + ", República Dominicana"
      )}&format=json&addressdetails=1&limit=5`;

      const nomRes = await fetch(nominatimUrl, {
        headers: { "Accept-Language": "es" },
      });
      if (nomRes.ok) {
        const nomJson = await nomRes.json();
        if (Array.isArray(nomJson)) {
          setResults(
            nomJson.map((item: any) => ({
              place_id: `nom-${item.place_id}`,
              description: item.display_name,
              lat: parseFloat(item.lat),
              lng: parseFloat(item.lon),
            }))
          );
        }
      }
    } catch (error) {
      console.error("Error buscando direcciones:", error);
    }
    setLoading(false);
  };

  const handleSelect = async (prediction: any) => {
    setResults([]);
    setQuery(prediction.description);

    // Si ya viene con lat/lng de Nominatim
    if (prediction.lat && prediction.lng) {
      onPlaceSelected({
        placeId: prediction.place_id,
        description: prediction.description,
        latitude: prediction.lat,
        longitude: prediction.lng,
      });
      sessionTokenRef.current = "";
      return;
    }

    try {
      const token = getSessionToken();
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(
          prediction.place_id
        )}&fields=geometry,formatted_address&language=es&sessiontoken=${token}&key=${API_KEY}`
      );
      const json = await res.json();

      if (json.status === "OK" && json.result?.geometry?.location) {
        const loc = json.result.geometry.location;
        onPlaceSelected({
          placeId: prediction.place_id,
          description: json.result.formatted_address || prediction.description,
          latitude: loc.lat,
          longitude: loc.lng,
        });
      } else {
        // Fallback
        onPlaceSelected({
          placeId: prediction.place_id,
          description: prediction.description,
          latitude: 0,
          longitude: 0,
        });
      }
    } catch (error) {
      console.error("Error obteniendo coordenadas:", error);
      onPlaceSelected({
        placeId: prediction.place_id,
        description: prediction.description,
        latitude: 0,
        longitude: 0,
      });
    } finally {
      sessionTokenRef.current = "";
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
          <div className="w-4 h-4 rounded-full animate-spin border-2 border-solid border-purple-500 border-t-transparent"></div>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600 shadow-md max-h-48 overflow-y-auto z-50">
          {results.map((item) => (
            <button
              key={item.place_id}
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

