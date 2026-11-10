import { useState, useEffect, useCallback } from "react";
import { getUsers, assignClientSeller, User } from "@/services/usersService";
import { getOrders } from "@/services/ordersService";

export const useSellerProfile = (sellerId: string | null) => {
  const [seller, setSeller] = useState<User | null>(null);
  const [allSellers, setAllSellers] = useState<User[]>([]);
  const [clients, setClients] = useState<User[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!sellerId) {
      setError("ID de vendedor no proporcionado.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [usersRes, ordersRes] = await Promise.all([getUsers(), getOrders()]);

      const allUsersList: User[] = usersRes?.users || [];
      const currentSeller = allUsersList.find(
        (u) => u.uid === sellerId && u.userType === "seller"
      );

      if (!currentSeller) {
        setError("Vendedor no encontrado.");
        setLoading(false);
        return;
      }

      setSeller(currentSeller);
      setAllSellers(
        allUsersList.filter(
          (u) => u.userType === "seller" && u.status === "active"
        )
      );
      setClients(
        allUsersList.filter(
          (u) => u.userType === "client" && u.sellerId === sellerId
        )
      );

      const allOrdersList: any[] = ordersRes?.orders || ordersRes || [];
      const assistedOrders = allOrdersList.filter(
        (o) => o.createdBySellerId === sellerId || o.sellerId === sellerId
      );
      setOrders(assistedOrders);
    } catch (err: any) {
      console.error("Error al cargar perfil de vendedor:", err);
      setError("Error al cargar la información del vendedor.");
    } finally {
      setLoading(false);
    }
  }, [sellerId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Métricas acumuladas del vendedor
  const validOrders = orders.filter(
    (o) => o.status !== "cancelled" && o.status !== "rejected"
  );

  const totalBilled = validOrders.reduce((acc, o) => {
    const orderSum = (o.items || []).reduce(
      (sum: number, it: any) =>
        sum + (it.subtotal || it.quantity * it.unitPrice || 0),
      0
    );
    return acc + orderSum;
  }, 0);

  const totalTons = validOrders.reduce((acc, o) => {
    if (typeof o.totalTons === "number") return acc + o.totalTons;
    const cementBags = (o.items || [])
      .filter(
        (it: any) =>
          it.unit === "fundas" ||
          (it.name || "").toLowerCase().includes("cemento")
      )
      .reduce((s: number, it: any) => s + (it.quantity || 0), 0);
    return acc + Number((cementBags * 0.0425).toFixed(2));
  }, 0);

  const handleReassignClient = async (
    clientUid: string,
    targetSellerId: string | null
  ) => {
    try {
      await assignClientSeller(clientUid, targetSellerId);
      await loadData();
      return { success: true };
    } catch (e: any) {
      return {
        success: false,
        message: e?.response?.data?.message || e.message || "Error al reasignar",
      };
    }
  };

  return {
    seller,
    allSellers,
    clients,
    orders,
    loading,
    error,
    metrics: {
      totalBilled,
      totalTons: Number(totalTons.toFixed(2)),
      clientsCount: clients.length,
      ordersCount: orders.length,
    },
    handleReassignClient,
    reload: loadData,
  };
};
