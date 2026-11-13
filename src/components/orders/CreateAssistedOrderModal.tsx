"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import { useAssistedOrder } from "@/hooks/useAssistedOrder";
import { formatCurrency } from "@/components/interactions/formatCurrency";

const AddressPicker = dynamic(() => import("@/hooks/AddressPicker"), {
  ssr: false,
  loading: () => <div className="h-10 w-full animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />,
});
import { User } from "@/services/usersService";
import { ShoppingCart, Plus, Minus, MapPin, AlertCircle, PlusCircle, List, X } from "lucide-react";
import { useCustomAlert } from "@/hooks/useCustomAlert";
import CustomAlert from "@/components/CustomAlert";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialClient?: User | null;
  onOrderCreated?: () => void;
}

export const CreateAssistedOrderModal: React.FC<Props> = ({
  isOpen,
  onClose,
  initialClient,
  onOrderCreated,
}) => {
  const {
    clients,
    products,
    bankAccounts,
    selectedClient,
    setSelectedClient,
    selectedAddressIndex,
    setSelectedAddressIndex,
    isCustomAddress,
    setIsCustomAddress,
    customAddressData,
    setCustomAddressData,
    items,
    setItemQuantity,
    paymentMethod,
    setPaymentMethod,
    selectedBankAccountId,
    setSelectedBankAccountId,
    creditNote,
    setCreditNote,
    transferReference,
    setTransferReference,
    deliveryNotes,
    setDeliveryNotes,
    estimatedTotal,
    totalBags,
    totalTons,
    submitting,
    errorMessage,
    submitAssistedOrder,
    isAdmin,
  } = useAssistedOrder(initialClient, () => {
    if (onOrderCreated) onOrderCreated();
    onClose();
  });

  const { alertConfig, showSuccess, showError, closeAlert } = useCustomAlert();

  const handleSend = async () => {
    const res = await submitAssistedOrder();
    if (res.success) {
      showSuccess({
        title: "¡Pedido asistido creado con éxito!",
        message: `Orden #${res.orderNumber} registrada y procesada correctamente.`,
        confirmText: "Aceptar",
        onConfirm: () => {
          if (onOrderCreated) onOrderCreated();
          onClose();
        },
      });
    } else {
      showError({
        title: "No se pudo crear el pedido",
        message: res.message || "Por favor verifica los productos y condiciones de la orden.",
      });
    }
  };

  const clientAddresses = selectedClient?.addresses || [];
  const currentAddress = clientAddresses[selectedAddressIndex] || clientAddresses[0];

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        className="max-w-2xl p-0 flex flex-col max-h-[90vh] overflow-hidden"
        showCloseButton={false}
    >
      {/* 1. Cabecera Adaptativa Fija (Diferenciada Admin / Vendedor) */}
      <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800 flex items-start justify-between gap-3 shrink-0 bg-white dark:bg-gray-900">
        <div className="flex items-start gap-3 min-w-0">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              isAdmin
                ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400"
                : "bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400"
            }`}
          >
            <ShoppingCart className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white leading-tight">
                Nuevo Pedido Asistido
              </h2>
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold whitespace-nowrap ${
                  isAdmin
                    ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
                    : "bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300"
                }`}
              >
                {isAdmin ? "Orden Administrativa" : "Venta Asistida"}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">
              {isAdmin
                ? "Emite una orden para cualquier cliente o cartera de la plataforma"
                : "Emite una orden directa para un cliente de tu cartera"}
            </p>
          </div>
        </div>

        {/* Botón de cierre integrado en flex (cero colisiones con el badge) */}
        <button
          onClick={onClose}
          className="h-8 w-8 shrink-0 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white transition"
          aria-label="Cerrar modal"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* 2. Cuerpo con Scroll Limpio Único */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-5 space-y-5 min-h-0">
        {errorMessage && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 1. Cliente y Destino */}
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

          {/* Buscador Autocomplete de Google Maps */}
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

        {/* 2. Productos y Lotes (Sin scroll interno anidado, tarjetas auto-ajustables) */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            2. Productos y Lotes
          </label>
          <div className="space-y-2">
            {products.map((p) => {
              const currentItem = items.find((it) => it.productId === p.id);
              const qty = currentItem?.quantity || 0;
              const productTons = Number(((qty * (p.weightKg || 42.5)) / 1000).toFixed(2));

              return (
                <div
                  key={p.id}
                  className="rounded-xl border border-gray-200/80 bg-white p-3 shadow-xs dark:border-gray-800 dark:bg-gray-800/40 space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-bold text-gray-900 dark:text-white">{p.name}</p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                        Precio ref: {formatCurrency(p.price || 0)} /{p.unit || "funda"}
                      </p>
                    </div>
                    {qty > 0 && (
                      <span className="rounded-lg bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 text-[11px] font-bold text-orange-600 dark:text-orange-400 shrink-0">
                        {productTons} Ton
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-gray-100 dark:border-gray-800/60">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setItemQuantity(p, Math.max(0, qty - 50))}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-700 dark:text-white"
                        title="Restar 50 fundas"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>

                      <div className="flex flex-col items-center">
                        <input
                          type="number"
                          min="0"
                          step="50"
                          value={qty === 0 ? "" : qty}
                          placeholder="0"
                          onChange={(e) => setItemQuantity(p, parseInt(e.target.value) || 0)}
                          className="w-16 h-8 rounded-lg border border-gray-200 bg-white px-1 text-center text-xs font-black text-gray-900 shadow-inner focus:border-orange-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        />
                        <span className="text-[9px] text-gray-400 -mt-0.5">fundas</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setItemQuantity(p, qty + 50)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-700 dark:text-white"
                        title="Sumar 50 fundas"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setItemQuantity(p, qty + 500)}
                      className="rounded-lg bg-orange-50 px-2.5 py-1.5 text-xs font-bold text-orange-700 transition hover:bg-orange-100 dark:bg-orange-950/40 dark:text-orange-300"
                      title="Sumar lote de 500 fundas"
                    >
                      +500 Lote
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Método de Pago */}
        <div className="space-y-3 rounded-xl border border-gray-200/80 bg-gray-50/50 p-3.5 dark:border-gray-800 dark:bg-gray-800/20">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              3. Método de Pago
            </label>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod("credit")}
                className={`rounded-xl border py-2 text-xs font-bold transition ${
                  paymentMethod === "credit"
                    ? "border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300"
                    : "border-gray-200 bg-white text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                }`}
              >
                Crédito Comercial
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("transfer")}
                className={`rounded-xl border py-2 text-xs font-bold transition ${
                  paymentMethod === "transfer"
                    ? "border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300"
                    : "border-gray-200 bg-white text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                }`}
              >
                Transferencia
              </button>
            </div>
          </div>

          {/* Opciones de Crédito */}
          {paymentMethod === "credit" && (
            <div>
              <label className="text-[11px] font-bold text-gray-600 dark:text-gray-300">
                Condiciones de Crédito
              </label>
              <input
                type="text"
                value={creditNote}
                onChange={(e) => setCreditNote(e.target.value)}
                placeholder="Ej. Plazo 30 días, autorizado por Gerencia Comercial"
                className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-800 shadow-xs focus:border-orange-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
          )}

          {/* Opciones de Transferencia */}
          {paymentMethod === "transfer" && (
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <div>
                <label className="text-[11px] font-bold text-gray-600 dark:text-gray-300">
                  Cuenta Bancaria Suplicem
                </label>
                <select
                  value={selectedBankAccountId}
                  onChange={(e) => setSelectedBankAccountId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-800 shadow-xs focus:border-orange-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  {bankAccounts.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.bankName} - {b.accountType} ({b.accountNumber})
                    </option>
                  ))}
                  {bankAccounts.length === 0 && <option value="">Cargando cuentas...</option>}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-600 dark:text-gray-300">
                  Referencia de Pago
                </label>
                <input
                  type="text"
                  value={transferReference}
                  onChange={(e) => setTransferReference(e.target.value)}
                  placeholder="Ej. Transferencia #948291"
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-800 shadow-xs focus:border-orange-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>
          )}

          {/* Notas de Despacho */}
          <div>
            <label className="text-[11px] font-bold text-gray-600 dark:text-gray-300">
              Instrucciones de Despacho en Obra (Opcional)
            </label>
            <input
              type="text"
              value={deliveryNotes}
              onChange={(e) => setDeliveryNotes(e.target.value)}
              placeholder="Ej. Descargar en torre B, recibir con el Ing. Pedro"
              className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-800 shadow-xs focus:border-orange-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* 3. Pie Sticky Seguro (Cero cortes, totales y botones garantizados) */}
      <div className="p-4 sm:p-5 border-t border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900 shrink-0 flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-xs text-gray-400 block -mb-0.5">Monto Estimado</span>
            <span className="text-xl font-black text-gray-900 dark:text-white">
              {formatCurrency(estimatedTotal)}
            </span>
          </div>
          <div className="text-right">
            <span
              className={`text-xs font-bold block ${
                isAdmin
                  ? "text-indigo-600 dark:text-indigo-400"
                  : "text-orange-600 dark:text-orange-400"
              }`}
            >
              {totalBags} Fundas
            </span>
            <span className="text-[11px] text-gray-400">({totalTons} Toneladas)</span>
          </div>
        </div>

        <p className="text-[10px] text-gray-400 leading-tight">
          * Precios por lote y flete final liquidados y confirmados por el backend.
        </p>

        <div className="grid grid-cols-2 gap-2 pt-0.5">
          <Button
            size="sm"
            variant="outline"
            onClick={onClose}
            disabled={submitting}
            className="w-full"
          >
            Cancelar
          </Button>
          <Button
            size="sm"
            onClick={handleSend}
            disabled={submitting || items.length === 0}
            className={`w-full truncate ${
              isAdmin
                ? "!bg-indigo-600 hover:!bg-indigo-700"
                : "!bg-orange-600 hover:!bg-orange-700"
            }`}
          >
            {submitting ? "Emitiendo..." : "Emitir Pedido Asistido"}
          </Button>
        </div>
      </div>
    </Modal>
    <CustomAlert {...alertConfig} onClose={closeAlert} />
  </>
  );
};
