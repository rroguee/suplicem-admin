"use client";

import React from "react";
import dynamic from "next/dynamic";
import { UseAssistedOrderReturn } from "@/hooks/useAssistedOrder";
import { MapPin, PlusCircle, List, User as UserIcon } from "lucide-react";

const AddressPicker = dynamic(() => import("@/hooks/AddressPicker"), {
  ssr: false,
  loading: () => <div className="h-10 w-full animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />,
});

interface Props {
  state: UseAssistedOrderReturn;
}

export const AssistedOrderClientSection: React.FC<Props> = ({ state }) => {
  const {
    clients,
    selectedClient,
    setSelectedClient,
    selectedAddressIndex,
    setSelectedAddressIndex,
    isCustomAddress,
    setIsCustomAddress,
    customAddressData,
    setCustomAddressData,
    isAdmin,
  } = state;

  const clientAddresses = selectedClient?.addresses || [];
  const currentAddress = clientAddresses[selectedAddressIndex] || clientAddresses[0];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-800 dark:bg-gray-900 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-700 dark:bg-orange-950/60 dark:text-orange-300">
            1
          </span>
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200">
            Cliente y Destino de Obra
          </h2>
        </div>

        {selectedClient && (
          <button
            type="button"
            onClick={() => {
              setIsCustomAddress(!isCustomAddress);
              setCustomAddressData(null);
            }}
            className="flex items-center gap-1 text-xs font-semibold text-orange-600 hover:text-orange-700 dark:text-orange-400"
          >
            {isCustomAddress ? (
              <>
                <List className="h-3.5 w-3.5" />
                <span>Usar obras registradas ({clientAddresses.length})</span>
              </>
            ) : (
              <>
                <PlusCircle className="h-3.5 w-3.5" />
                <span>+ Nueva Dirección con Mapa</span>
              </>
            )}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            {isAdmin ? "Cliente (Visión Global Admin)" : "Cliente en Cartera"}
          </label>
          <select
            value={selectedClient?.uid || ""}
            onChange={(e) => {
              const cl = clients.find((c) => c.uid === e.target.value);
              setSelectedClient(cl || null);
              setIsCustomAddress(false);
              setCustomAddressData(null);
            }}
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs font-medium text-gray-800 shadow-xs focus:border-orange-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            <option value="">
              {isAdmin ? "Selecciona un cliente de la plataforma..." : "Selecciona un cliente de tu cartera..."}
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
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Dirección de Obra Asignada
            </label>
            <select
              value={selectedAddressIndex}
              onChange={(e) => setSelectedAddressIndex(Number(e.target.value))}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs font-medium text-gray-800 shadow-xs focus:border-orange-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              {clientAddresses.map((a, idx) => (
                <option key={a.placeId || idx} value={idx}>
                  Obra #{idx + 1}: {a.description.slice(0, 36)}...
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Autocomplete de Google Maps */}
      {isCustomAddress ? (
        <div className="space-y-1.5 pt-1">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">
            Buscar dirección exacta en Google Maps
          </label>
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
            <div className="flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3.5 py-2 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
              <MapPin className="h-4 w-4 shrink-0 text-emerald-600" />
              <span className="truncate">Confirmada en mapa: {customAddressData.description}</span>
            </div>
          )}
        </div>
      ) : currentAddress ? (
        <div className="flex items-center gap-2 rounded-xl bg-gray-50 border border-gray-100 px-3.5 py-2.5 text-xs text-gray-700 dark:border-gray-800 dark:bg-gray-800/60 dark:text-gray-300">
          <MapPin className="h-4 w-4 shrink-0 text-orange-500" />
          <span className="truncate font-medium">{currentAddress.description}</span>
        </div>
      ) : null}
    </div>
  );
};
