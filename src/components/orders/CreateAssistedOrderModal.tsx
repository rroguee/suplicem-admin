"use client";

import React from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import { useAssistedOrder } from "@/hooks/useAssistedOrder";
import { formatCurrency } from "@/components/interactions/formatCurrency";
import { User } from "@/services/usersService";
import { ShoppingCart, AlertCircle, X } from "lucide-react";
import { useCustomAlert } from "@/hooks/useCustomAlert";
import CustomAlert from "@/components/CustomAlert";
import { AssistedOrderClientSection } from "./assisted/AssistedOrderClientSection";
import { AssistedOrderProductRow } from "./assisted/AssistedOrderProductRow";
import { AssistedOrderPaymentSection } from "./assisted/AssistedOrderPaymentSection";

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

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        className="max-w-2xl p-0 flex flex-col max-h-[90vh] overflow-hidden"
        showCloseButton={false}
      >
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

          <button
            onClick={onClose}
            className="h-8 w-8 shrink-0 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white transition"
            aria-label="Cerrar modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-5 space-y-5 min-h-0">
          {errorMessage && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <AssistedOrderClientSection
            isAdmin={isAdmin}
            clients={clients}
            selectedClient={selectedClient}
            setSelectedClient={setSelectedClient}
            selectedAddressIndex={selectedAddressIndex}
            setSelectedAddressIndex={setSelectedAddressIndex}
            isCustomAddress={isCustomAddress}
            setIsCustomAddress={setIsCustomAddress}
            customAddressData={customAddressData}
            setCustomAddressData={setCustomAddressData}
            initialClient={initialClient}
          />

          <div className="space-y-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              2. Productos y Lotes
            </label>
            <div className="space-y-2">
              {products.map((p) => {
                const currentItem = items.find((it) => it.productId === p.id);
                return (
                  <AssistedOrderProductRow
                    key={p.id}
                    product={p}
                    quantity={currentItem?.quantity || 0}
                    onSetQuantity={setItemQuantity}
                  />
                );
              })}
            </div>
          </div>

          <AssistedOrderPaymentSection
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            bankAccounts={bankAccounts}
            selectedBankAccountId={selectedBankAccountId}
            setSelectedBankAccountId={setSelectedBankAccountId}
            transferReference={transferReference}
            setTransferReference={setTransferReference}
            creditNote={creditNote}
            setCreditNote={setCreditNote}
            deliveryNotes={deliveryNotes}
            setDeliveryNotes={setDeliveryNotes}
          />
        </div>

        <div className="p-4 sm:p-5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-left w-full sm:w-auto">
            <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Total Estimado • {totalBags} fundas ({totalTons} Ton)
            </p>
            <p className="text-lg sm:text-xl font-extrabold text-gray-900 dark:text-white">
              {formatCurrency(estimatedTotal)}
            </p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 sm:flex-initial"
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={handleSend}
              disabled={submitting || totalBags === 0 || !selectedClient}
              className={`flex-1 sm:flex-initial ${
                isAdmin
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                  : "bg-orange-500 hover:bg-orange-600 text-white"
              }`}
            >
              {submitting ? "Creando..." : "Emitir Pedido"}
            </Button>
          </div>
        </div>
      </Modal>

      {alertConfig && (
        <CustomAlert
          isOpen={alertConfig.isOpen}
          title={alertConfig.title}
          message={alertConfig.message}
          type={alertConfig.type}
          confirmText={alertConfig.confirmText}
          cancelText={alertConfig.cancelText}
          onConfirm={alertConfig.onConfirm}
          onCancel={closeAlert}
        />
      )}
    </>
  );
};

export default CreateAssistedOrderModal;
