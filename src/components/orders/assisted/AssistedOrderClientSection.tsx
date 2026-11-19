import React from "react";
import dynamic from "next/dynamic";
import { User } from "@/services/usersService";
import { GooglePlaceData } from "@/hooks/useAssistedOrder";
import { List, PlusCircle, MapPin } from "lucide-react";

const AddressPicker = dynamic(() => import("@/hooks/AddressPicker"), {
  ssr: false,
  loading: () => <div className="h-10 w-full animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />,
});

interface Props {
  isAdmin: boolean;
  clients: User[];
  selectedClient: User | null;
  setSelectedClient: (client: User | null) => void;
  selectedAddressIndex: number;
  setSelectedAddressIndex: (index: number) => void;
  isCustomAddress: boolean;
  setIsCustomAddress: (val: boolean) => void;
  customAddressData: GooglePlaceData | null;
  setCustomAddressData: (data: GooglePlaceData | null) => void;
  initialClient?: User | null;
}

export const AssistedOrderClientSection: React.FC<Props> = ({
  isAdmin,
  clients,
  selectedClient,
  setSelectedClient,
  selectedAddressIndex,
  setSelectedAddressIndex,
  isCustomAddress,
  setIsCustomAddress,
  customAddressData,
  setCustomAddressData,
  initialClient,
}) => {
  const clientAddresses = selectedClient?.addresses || [];
  const currentAddress = clientAddresses[selectedAddressIndex] || clientAddresses[0];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          1. Cliente y Destino de Entrega
        </label>
        {selectedClient && (
          <button
            type="button"
            onClick={() => {
              setIsCustomAddress(!isCustomAddress);
              setCustomAddressData(null);
            }}
            className={`flex items-center gap-1 text-xs font-semibold ${
              isAdmin
                ? "text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                : "text-orange-600 hover:text-orange-700 dark:text-orange-400"
            }`}
          >
            {isCustomAddress ? (
              <>
                <List className="h-3.5 w-3.5" />
                <span>Usar obras guardadas ({clientAddresses.length})</span>
              </>
            ) : (
              <>
                <PlusCircle className="h-3.5 w-3.5" />
                <span>+ Nueva Dirección de Obra</span>
              </>
            )}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div>
          <select
            value={selectedClient?.uid || ""}
            onChange={(e) => {
              const cl = clients.find((c) => c.uid === e.target.value);
              setSelectedClient(cl || null);
              setIsCustomAddress(false);
              setCustomAddressData(null);
            }}
            disabled={Boolean(initialClient)}
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-800 shadow-xs focus:border-orange-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            <option value="">
              {isAdmin
                ? "Selecciona un cliente (Todas las carteras)..."
                : "Selecciona un cliente de tu cartera..."}
            </option>
            {clients.map((c) => (
              <option key={c.uid} value={c.uid}>
                {c.names} {c.lastNames} {c.identification ? `(${c.identification})` : ""}
              </option>
            ))}
          </select>
        </div>

        {!isCustomAddress && clientAddresses.length > 1 && (
          <div>
            <select
              value={selectedAddressIndex}
              onChange={(e) => setSelectedAddressIndex(Number(e.target.value))}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-800 shadow-xs focus:border-orange-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              {clientAddresses.map((a, idx) => (
                <option key={a.placeId || idx} value={idx}>
                  Obra #{idx + 1}: {a.description.slice(0, 32)}...
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {isCustomAddress ? (
        <div className="space-y-1">
          <AddressPicker
            initialValue=""
            onPlaceSelected={(data) => {
              setCustomAddressData({
                description: data.description,
                placeId: data.placeId,
                latitude: data.latitude,
                longitude: data.longitude,
              });
            }}
          />
          {customAddressData && (
            <div className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 font-medium">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
              <span className="truncate">Confirmada en mapa: {customAddressData.description}</span>
            </div>
          )}
        </div>
      ) : currentAddress ? (
        <div className="flex items-center gap-1.5 rounded-xl bg-gray-50 border border-gray-100 px-3 py-2 text-xs text-gray-600 dark:border-gray-800 dark:bg-gray-800/60 dark:text-gray-300">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-orange-500" />
          <span className="truncate font-medium">{currentAddress.description}</span>
        </div>
      ) : null}
    </div>
  );
};
