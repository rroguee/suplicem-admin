import React, { useState } from "react";
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

interface AddressPickerProps {
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

export default function AddressPicker({ onPlaceSelected }: AddressPickerProps) {
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSearch = async (text: string) => {
    setQuery(text);
    if (text.length < 3) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
    //   const res = await fetch(
    //     `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
    //       text
    //     )}&types=address&components=country:do&language=es&key=${API_KEY}`
    //   );
    //   const json = await res.json();

    const json = {
        "predictions": [
            {
                "description": "Alto Cerro, Constanza, República Dominicana",
                "matched_substrings": [
                    {
                        "length": 4,
                        "offset": 0
                    }
                ],
                "place_id": "EixBbHRvIENlcnJvLCBDb25zdGFuemEsIFJlcMO6YmxpY2EgRG9taW5pY2FuYSIuKiwKFAoSCUmTGrACPrCOEbiYY-QTttDCEhQKEgmvBgaEjRWwjhGjxAWBtEkUog",
                "reference": "EixBbHRvIENlcnJvLCBDb25zdGFuemEsIFJlcMO6YmxpY2EgRG9taW5pY2FuYSIuKiwKFAoSCUmTGrACPrCOEbiYY-QTttDCEhQKEgmvBgaEjRWwjhGjxAWBtEkUog",
                "structured_formatting": {
                    "main_text": "Alto Cerro",
                    "main_text_matched_substrings": [
                        {
                            "length": 4,
                            "offset": 0
                        }
                    ],
                    "secondary_text": "Constanza, República Dominicana"
                },
                "terms": [
                    {
                        "offset": 0,
                        "value": "Alto Cerro"
                    },
                    {
                        "offset": 12,
                        "value": "Constanza"
                    },
                    {
                        "offset": 23,
                        "value": "República Dominicana"
                    }
                ],
                "types": [
                    "geocode",
                    "route"
                ]
            },
            {
                "description": "Alto Cerro 2, Constanza, República Dominicana",
                "matched_substrings": [
                    {
                        "length": 4,
                        "offset": 0
                    }
                ],
                "place_id": "Ei5BbHRvIENlcnJvIDIsIENvbnN0YW56YSwgUmVww7pibGljYSBEb21pbmljYW5hIi4qLAoUChIJ6aq2bgI-sI4R385sgjwhlh0SFAoSCa8GBoSNFbCOEaPEBYG0SRSi",
                "reference": "Ei5BbHRvIENlcnJvIDIsIENvbnN0YW56YSwgUmVww7pibGljYSBEb21pbmljYW5hIi4qLAoUChIJ6aq2bgI-sI4R385sgjwhlh0SFAoSCa8GBoSNFbCOEaPEBYG0SRSi",
                "structured_formatting": {
                    "main_text": "Alto Cerro 2",
                    "main_text_matched_substrings": [
                        {
                            "length": 4,
                            "offset": 0
                        }
                    ],
                    "secondary_text": "Constanza, República Dominicana"
                },
                "terms": [
                    {
                        "offset": 0,
                        "value": "Alto Cerro 2"
                    },
                    {
                        "offset": 14,
                        "value": "Constanza"
                    },
                    {
                        "offset": 25,
                        "value": "República Dominicana"
                    }
                ],
                "types": [
                    "geocode",
                    "route"
                ]
            },
            {
                "description": "Alto Cerro 6, Constanza, República Dominicana",
                "matched_substrings": [
                    {
                        "length": 4,
                        "offset": 0
                    }
                ],
                "place_id": "Ei5BbHRvIENlcnJvIDYsIENvbnN0YW56YSwgUmVww7pibGljYSBEb21pbmljYW5hIi4qLAoUChIJFQ_dCQI-sI4Ryl9CTfl6o9QSFAoSCa8GBoSNFbCOEaPEBYG0SRSi",
                "reference": "Ei5BbHRvIENlcnJvIDYsIENvbnN0YW56YSwgUmVww7pibGljYSBEb21pbmljYW5hIi4qLAoUChIJFQ_dCQI-sI4Ryl9CTfl6o9QSFAoSCa8GBoSNFbCOEaPEBYG0SRSi",
                "structured_formatting": {
                    "main_text": "Alto Cerro 6",
                    "main_text_matched_substrings": [
                        {
                            "length": 4,
                            "offset": 0
                        }
                    ],
                    "secondary_text": "Constanza, República Dominicana"
                },
                "terms": [
                    {
                        "offset": 0,
                        "value": "Alto Cerro 6"
                    },
                    {
                        "offset": 14,
                        "value": "Constanza"
                    },
                    {
                        "offset": 25,
                        "value": "República Dominicana"
                    }
                ],
                "types": [
                    "geocode",
                    "route"
                ]
            },
            {
                "description": "Calle Altos Los Yona, Santo Domingo, República Dominicana",
                "matched_substrings": [
                    {
                        "length": 4,
                        "offset": 6
                    }
                ],
                "place_id": "EjpDYWxsZSBBbHRvcyBMb3MgWW9uYSwgU2FudG8gRG9taW5nbywgUmVww7pibGljYSBEb21pbmljYW5hIi4qLAoUChIJFfXLQcVhpY4RzMp7pKcRvoISFAoSCaulfhDxia-OEWTBFSe4h8XW",
                "reference": "EjpDYWxsZSBBbHRvcyBMb3MgWW9uYSwgU2FudG8gRG9taW5nbywgUmVww7pibGljYSBEb21pbmljYW5hIi4qLAoUChIJFfXLQcVhpY4RzMp7pKcRvoISFAoSCaulfhDxia-OEWTBFSe4h8XW",
                "structured_formatting": {
                    "main_text": "Calle Altos Los Yona",
                    "main_text_matched_substrings": [
                        {
                            "length": 4,
                            "offset": 6
                        }
                    ],
                    "secondary_text": "Santo Domingo, República Dominicana"
                },
                "terms": [
                    {
                        "offset": 0,
                        "value": "Calle Altos Los Yona"
                    },
                    {
                        "offset": 22,
                        "value": "Santo Domingo"
                    },
                    {
                        "offset": 37,
                        "value": "República Dominicana"
                    }
                ],
                "types": [
                    "geocode",
                    "route"
                ]
            },
            {
                "description": "Camino a Los Altos de Los Mangos, Bajabonico, República Dominicana",
                "matched_substrings": [
                    {
                        "length": 4,
                        "offset": 13
                    }
                ],
                "place_id": "EkNDYW1pbm8gYSBMb3MgQWx0b3MgZGUgTG9zIE1hbmdvcywgQmFqYWJvbmljbywgUmVww7pibGljYSBEb21pbmljYW5hIi4qLAoUChIJh_y-4cWUsY4R2OjY050l5j4SFAoSCQlBslAz67GOEVeAQET-0ely",
                "reference": "EkNDYW1pbm8gYSBMb3MgQWx0b3MgZGUgTG9zIE1hbmdvcywgQmFqYWJvbmljbywgUmVww7pibGljYSBEb21pbmljYW5hIi4qLAoUChIJh_y-4cWUsY4R2OjY050l5j4SFAoSCQlBslAz67GOEVeAQET-0ely",
                "structured_formatting": {
                    "main_text": "Camino a Los Altos de Los Mangos",
                    "main_text_matched_substrings": [
                        {
                            "length": 4,
                            "offset": 13
                        }
                    ],
                    "secondary_text": "Bajabonico, República Dominicana"
                },
                "terms": [
                    {
                        "offset": 0,
                        "value": "Camino a Los Altos de Los Mangos"
                    },
                    {
                        "offset": 34,
                        "value": "Bajabonico"
                    },
                    {
                        "offset": 46,
                        "value": "República Dominicana"
                    }
                ],
                "types": [
                    "geocode",
                    "route"
                ]
            }
        ],
        "status": "OK"
    };

      setResults(json.predictions || []);
    } catch (error) {
      console.error("Error buscando direcciones:", error);
    }
    setLoading(false);
  };

  const handleSelect = async (placeId: string, description: string) => {
    setResults([]);
    setQuery(description);

    try {
    //   const res = await fetch(
    //     `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(
    //       placeId
    //     )}&fields=geometry,formatted_address&language=es&key=${API_KEY}`
    //   );
    //   const json = await res.json();

    const json = {
        "html_attributions": [],
        "result": {
            "formatted_address": "Alto Cerro, 41000 Constanza, República Dominicana",
            "geometry": {
                "location": {
                    "lat": 18.9116916,
                    "lng": -70.7282531
                },
                "viewport": {
                    "northeast": {
                        "lat": 18.91588250000002,
                        "lng": -70.72671866970849
                    },
                    "southwest": {
                        "lat": 18.90741429999997,
                        "lng": -70.7294166302915
                    }
                }
            }
        },
        "status": "OK"
    };
      
    const loc = json.result.geometry.location;

      onPlaceSelected({
        placeId,
        description: json.result.formatted_address,
        latitude: loc.lat,
        longitude: loc.lng,
      });
    } catch (error) {
      console.error("Error obteniendo coordenadas:", error);
    }
  };

  return (
    <div className="mb-4">
      <input
        type="text"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Buscar dirección"
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500"
      />

      {loading && (
        <div className="flex justify-center mt-2">
          <div className="w-4 h-4 rounded-full animate-spin border-2 border-solid border-purple-500 border-t-transparent"></div>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="mt-2 bg-white dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600 shadow-md max-h-48 overflow-y-auto z-10">
          {results.map((item) => (
            <button
              key={item.place_id}
              onClick={() => handleSelect(item.place_id, item.description)}
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
