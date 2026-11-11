import { useState, useEffect, useCallback, useContext, useRef } from "react";
import { AuthContext } from "@/context/authContext";
import { getOrders } from "@/services/ordersService";
import { getUsers, User } from "@/services/usersService";
import { getAllTrips } from "@/services/tripsService";

export const useSellerDashboard = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [orders, setOrders] = useState<any[]>([]);
  const [clients, setClients] = useState<User[]>([]);
  const [activeTrips, setActiveTrips] = useState<any[]>([]);
  const [completedTrips, setCompletedTrips] = useState<any[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const loadDashboardData = useCallback(async (silent = false) => {
    if (!user?.uid) return;
    if (silent) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const [ordersResult, usersResult, tripsResult] = await Promise.allSettled([
        getOrders(),
        getUsers(),
        getAllTrips(),
      ]);

      const ordersRes = ordersResult.status === "fulfilled" ? ordersResult.value : null;
      const usersRes = usersResult.status === "fulfilled" ? usersResult.value : null;
      const tripsRes = tripsResult.status === "fulfilled" ? tripsResult.value : null;

      if (ordersResult.status === "rejected") {
        console.error("Error al cargar órdenes en dashboard de vendedor:", ordersResult.reason);
      }
      if (usersResult.status === "rejected") {
        console.error("Error al cargar clientes en dashboard de vendedor:", usersResult.reason);
      }
      if (tripsResult.status === "rejected") {
        console.error("Error al cargar viajes en dashboard de vendedor:", tripsResult.reason);
      }

      const allOrders: any[] = ordersRes?.orders || ordersRes || [];
      const myOrders = allOrders.filter(
        (o) => o.createdBySellerId === user.uid || o.sellerId === user.uid
      );
      setOrders(myOrders);

      const allUsers: User[] = usersRes?.users || [];
      const myClients = allUsers.filter(
        (u) => u.userType === "client" && u.sellerId === user.uid
      );
      setClients(myClients);

      const allTrips: any[] = tripsRes?.trips || [];
      const inTransit = allTrips.filter(
        (t) => ["started", "accepted", "in_progress"].includes(t.status)
      );
      setActiveTrips(inTransit);

      // Filtrar viajes completados de los últimos 7 días vinculados a clientes del vendedor
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const finished = allTrips
        .filter((t) => {
          if (t.status !== "completed") return false;
          const tDate = new Date(t.completedAt || t.updatedAt || t.createdAt || 0);
          return tDate >= sevenDaysAgo;
        })
        .map((t) => {
          const matchedOrder = myOrders.find((o) =>
            (t.orderIds || []).includes(o.id) || (t.orderIds || []).includes(String(o.orderNumber))
          );
          const matchedDriver = allUsers.find(
            (u) => u.uid === t.assignedDriverId || u.uid === t.driverId
          );
          return {
            ...t,
            clientName: matchedOrder
              ? `${matchedOrder.userNames} ${matchedOrder.userLastNames || ""}`.trim()
              : undefined,
            driverName: matchedDriver
              ? `${matchedDriver.names} ${matchedDriver.lastNames || ""}`.trim()
              : t.driver?.names || undefined,
          };
        });

      setCompletedTrips(finished);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Error al cargar datos del dashboard de vendedor:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [user?.uid]);

  // Carga inicial y listeners de ventana (Visibilidad y Foco)
  useEffect(() => {
    loadDashboardData(false);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadDashboardData(true);
      }
    };

    const handleWindowFocus = () => {
      loadDashboardData(true);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleWindowFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, [loadDashboardData]);

  // Polling dinámico adaptativo
  useEffect(() => {
    // Si hay camiones en ruta: actualizar cada 10 seg; de lo contrario cada 25 seg
    const intervalTime = activeTrips.length > 0 ? 10000 : 25000;

    timerRef.current = setInterval(() => {
      // Solo consultar si la pestaña del navegador está visible para el vendedor
      if (document.visibilityState === "visible") {
        loadDashboardData(true);
      }
    }, intervalTime);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeTrips.length, loadDashboardData]);

  // Cálculos de Negocio
  const validOrders = orders.filter((o) => o.status !== "cancelled" && o.status !== "rejected");
  const totalBilled = validOrders.reduce((acc, o) => {
    const sum = (o.items || []).reduce((s: number, it: any) => s + (it.subtotal || it.quantity * it.unitPrice || 0), 0);
    return acc + sum;
  }, 0);

  const totalTons = validOrders.reduce((acc, o) => {
    if (typeof o.totalTons === "number") return acc + o.totalTons;
    const bags = (o.items || [])
      .filter((it: any) => (it.name || "").toLowerCase().includes("cemento"))
      .reduce((s: number, it: any) => s + (it.quantity || 0), 0);
    return acc + Number((bags * 0.0425).toFixed(2));
  }, 0);

  const pendingApprovalCount = orders.filter((o) => o.status === "pending").length;

  return {
    user,
    loading,
    isRefreshing,
    lastUpdated,
    metrics: {
      totalBilled,
      totalTons: Number(totalTons.toFixed(2)),
      clientsCount: clients.length,
      pendingOrdersCount: pendingApprovalCount,
      activeDeliveriesCount: activeTrips.length,
    },
    clients,
    activeTrips,
    completedTrips,
    recentOrders: orders.slice(0, 5),
    reload: () => loadDashboardData(true),
  };
};
