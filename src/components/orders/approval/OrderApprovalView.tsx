"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useOrderApproval } from "@/hooks/useOrderApproval";
import { OrderApprovalVerificationCard } from "./OrderApprovalVerificationCard";
import { DeliveryApprovalCard } from "./DeliveryApprovalCard";
import { OrderApprovalSummaryFooter } from "./OrderApprovalSummaryFooter";
import { ReceiptViewerModal } from "../logistics/ReceiptViewerModal";

interface Props {
  orderId: string;
}

export const OrderApprovalView: React.FC<Props> = ({ orderId }) => {
  const router = useRouter();
  const {
    order,
    drivers,
    loading,
    saving,
    errorMessage,
    successMessage,
    deliveriesPlan,
    isReceiptModalOpen,
    setIsReceiptModalOpen,
    handleAddTruck,
    handleRemoveTruck,
    handleUpdateTruckTons,
    handleSelectDriver,
    handleConfirmApproval,
  } = useOrderApproval(orderId);

  if (loading || !order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-500 text-sm">Cargando planificación de orden...</p>
      </div>
    );
  }

  const isPickup = order.deliveryType === "almacen";
  const totalOrderTons = Number(order.totalTons || order.pendingBalance) || 0;
  const totalPlannedTons = deliveriesPlan.reduce(
    (acc, del) => acc + del.trucks.reduce((sum, t) => sum + (Number(t.totalTons) || 0), 0),
    0
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          ← Volver
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Aprobación y Despacho Logístico
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isPickup
              ? "Verifica la orden de retiro en almacén antes de aprobarla"
              : "Verifica la orden y fracciona la carga de cada destino en viajes para los conductores"}
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 mb-6 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300">
          ⚠️ {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="p-4 mb-6 rounded-lg bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800 text-sm text-green-700 dark:text-green-300">
          ✅ {successMessage}
        </div>
      )}

      <OrderApprovalVerificationCard
        order={order}
        onViewReceipt={() => setIsReceiptModalOpen(true)}
      />

      {!isPickup && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
            Planificación de Entregas y Camiones
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Ajusta el tonelaje de cada camión y asigna el chofer correspondiente para cada destino:
          </p>

          {deliveriesPlan.map((del, idx) => (
            <DeliveryApprovalCard
              key={del.id || `plan-del-${idx}`}
              delivery={del}
              drivers={drivers}
              onAddTruck={() => handleAddTruck(idx)}
              onUpdateTruckTons={(truckId, tons) => handleUpdateTruckTons(idx, truckId, tons)}
              onSelectDriver={(truckId, driverId) => handleSelectDriver(idx, truckId, driverId)}
              onRemoveTruck={(truckId) => handleRemoveTruck(idx, truckId)}
            />
          ))}
        </div>
      )}

      <OrderApprovalSummaryFooter
        totalOrderTons={totalOrderTons}
        totalPlannedTons={totalPlannedTons}
        onConfirm={handleConfirmApproval}
        saving={saving}
        isPickup={isPickup}
      />

      {isReceiptModalOpen && (
        <ReceiptViewerModal
          isOpen={isReceiptModalOpen}
          onClose={() => setIsReceiptModalOpen(false)}
          imageUrl={order.receiptUrl || order.transferReceipt || order.receiptImage}
          orderNumber={order.orderNumber}
        />
      )}
    </div>
  );
};
