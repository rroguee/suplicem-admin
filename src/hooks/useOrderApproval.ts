import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getOrderDetail, approveOrder } from "@/services/ordersService";
import { splitOrderTrips } from "@/services/tripsService";
import { getUsers } from "@/services/usersService";
import { TruckTripItem } from "../components/orders/approval/TripTruckRow";

export interface DeliveryPlanState {
  id?: string;
  index: number;
  addressDescription: string;
  recipientName?: string;
  destinationAddress?: any;
  quantityFundas: number;
  totalTons: number;
  trucks: TruckTripItem[];
}

export function useOrderApproval(orderId: string) {
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deliveriesPlan, setDeliveriesPlan] = useState<DeliveryPlanState[]>([]);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [orderRes, usersRes] = await Promise.all([
          getOrderDetail(orderId),
          getUsers(),
        ]);

        const orderData = orderRes.order || orderRes.data || orderRes;
        setOrder(orderData);

        const allUsers = Array.isArray(usersRes) ? usersRes : usersRes.users || [];
        setDrivers(allUsers.filter((u: any) => u.userType === "driver"));

        const rawDeliveries = orderData.deliveries && orderData.deliveries.length > 0
          ? orderData.deliveries
          : [
              {
                id: "del-main",
                address: orderData.deliveryAddress,
                quantity: orderData.items?.[0]?.quantity || 0,
                unit: orderData.items?.[0]?.unit || "fundas",
              },
            ];

        const orderTotalTons = Number(orderData.totalTons || orderData.pendingBalance) || 0;
        const totalDeliveriesQty = rawDeliveries.reduce((sum: number, d: any) => sum + (Number(d.quantity) || 0), 0);

        const initialPlan: DeliveryPlanState[] = rawDeliveries.map((del: any, idx: number) => {
          const qtyFundas = Number(del.quantity) || 0;

          // Las toneladas provienen del backend (del.totalTons u orderTotalTons oficial)
          let tons = Number(del.totalTons) || 0;
          if (!tons && orderTotalTons > 0) {
            if (rawDeliveries.length === 1) {
              tons = orderTotalTons;
            } else if (totalDeliveriesQty > 0) {
              tons = Number(((orderTotalTons * qtyFundas) / totalDeliveriesQty).toFixed(2));
            }
          }

          const addressDesc = del.address?.description || "Dirección de orden";

          const truckCount = Math.max(1, Math.ceil(tons / 21));
          const tonsPerTruck = Number((tons / truckCount).toFixed(2));

          const trucks: TruckTripItem[] = Array.from({ length: truckCount }, (_, tIdx) => ({
            id: `truck-${idx}-${tIdx}-${Date.now()}`,
            totalTons:
              tIdx === truckCount - 1
                ? Number((tons - tonsPerTruck * (truckCount - 1)).toFixed(2))
                : tonsPerTruck,
            deliveryId: del.id,
          }));

          return {
            id: del.id,
            index: idx,
            addressDescription: addressDesc,
            recipientName: del.address?.recipientName,
            destinationAddress: del.address,
            quantityFundas: qtyFundas,
            totalTons: tons,
            trucks,
          };
        });

        setDeliveriesPlan(initialPlan);
      } catch (err: any) {
        console.error("Error al cargar datos de aprobación:", err);
        setErrorMessage("No se pudo cargar la información de la orden.");
      } finally {
        setLoading(false);
      }
    }

    if (orderId) loadData();
  }, [orderId]);

  const handleUpdateTruckTons = (delIdx: number, truckId: string, tons: number) => {
    setDeliveriesPlan((prev) =>
      prev.map((del, i) =>
        i !== delIdx ? del : {
          ...del,
          trucks: del.trucks.map((t) => (t.id === truckId ? { ...t, totalTons: tons } : t)),
        }
      )
    );
  };

  const handleAddTruck = (delIdx: number) => {
    setDeliveriesPlan((prev) =>
      prev.map((del, i) =>
        i !== delIdx ? del : {
          ...del,
          trucks: [...del.trucks, { id: `truck-${delIdx}-${del.trucks.length}-${Date.now()}`, totalTons: 10, deliveryId: del.id }],
        }
      )
    );
  };

  const handleRemoveTruck = (delIdx: number, truckId: string) => {
    setDeliveriesPlan((prev) =>
      prev.map((del, i) =>
        i !== delIdx || del.trucks.length <= 1 ? del : {
          ...del,
          trucks: del.trucks.filter((t) => t.id !== truckId),
        }
      )
    );
  };

  const handleSelectDriver = (delIdx: number, truckId: string, driverId: string) => {
    setDeliveriesPlan((prev) =>
      prev.map((del, i) =>
        i !== delIdx ? del : {
          ...del,
          trucks: del.trucks.map((t) =>
            t.id === truckId ? { ...t, driverId: driverId || undefined } : t
          ),
        }
      )
    );
  };

  const handleConfirmApproval = async () => {
    if (!order) return;
    setErrorMessage(null);

    for (const del of deliveriesPlan) {
      const planned = del.trucks.reduce((sum, t) => sum + (Number(t.totalTons) || 0), 0);
      if (Math.abs(planned - del.totalTons) > 0.1) {
        setErrorMessage(
          `La Entrega #${del.index + 1} tiene ${planned.toFixed(2)} t planificadas pero requiere ${del.totalTons.toFixed(2)} t. Por favor equilibra los camiones.`
        );
        return;
      }
    }

    const allTrips = deliveriesPlan.flatMap((del) =>
      del.trucks.map((truck, tIdx) => ({
        totalTons: Number(truck.totalTons.toFixed(2)),
        driverId: truck.driverId,
        deliveryId: del.id,
        destinationAddress: del.destinationAddress,
        comments: `Viaje Camión #${tIdx + 1} para Entrega #${del.index + 1} (${del.addressDescription})`,
      }))
    );

    try {
      setSaving(true);
      await approveOrder(order.id);
      await splitOrderTrips(order.id, allTrips);

      setSuccessMessage("¡Orden aprobada y viajes de camiones generados exitosamente!");
      setTimeout(() => {
        router.push("/admin");
      }, 1500);
    } catch (err: any) {
      console.error("Error al aprobar orden y generar viajes:", err);
      setErrorMessage(err.response?.data?.message || err.message || "Error al procesar la aprobación.");
    } finally {
      setSaving(false);
    }
  };

  return {
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
  };
}
