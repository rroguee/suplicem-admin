import { useState, useEffect, useCallback, useContext, useRef } from "react";
import { AuthContext } from "@/context/authContext";
import { getOrders } from "@/services/ordersService";
import { getUsers, User } from "@/services/usersService";
import { getAllTrips } from "@/services/tripsService";

export interface TopSellerSummary {
  uid: string;
  names: string;
  lastNames: string;
  sellerCode: string;
  phone?: string;
  totalBilled: number;
  totalTons: number;
  clientsCount: number;
  ordersCount: number;
}

export interface DriverSummary {
  uid: string;
  names: string;
  lastNames: string;
  phone?: string;
  vehicle?: {
    brand?: string;
    model?: string;
    tons?: string | number;
    year?: string | number;
    plateNumber?: string;
  };
  isOnRoute: boolean;
  completedTripsCount: number;
  totalDeliveredTons: number;
}

export const useAdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [trips, setTrips] = useState<any[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const loadData = useCallback(async (silent = false) => {
    if (silent) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const [ordersRes, usersRes, tripsRes] = await Promise.all([
        getOrders(),
        getUsers(),
        getAllTrips(),
      ]);

      const allOrders: any[] = ordersRes?.orders || ordersRes || [];
      const allUsers: User[] = usersRes?.users || [];
      const allTrips: any[] = tripsRes?.trips || [];

      setOrders(allOrders);
      setUsers(allUsers);
      setTrips(allTrips);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Error al cargar datos del dashboard administrativo:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData(false);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadData(true);
      }
    };

    const handleFocus = () => loadData(true);
    const handleOrderCreated = () => loadData(true);

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("order-created", handleOrderCreated);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("order-created", handleOrderCreated);
    };
  }, [loadData]);

  // Polling adaptativo
  useEffect(() => {
    const hasActiveTrips = trips.some((t) =>
      ["started", "in_progress", "accepted"].includes(t.status)
    );
    const intervalTime = hasActiveTrips ? 15000 : 30000;

    timerRef.current = setInterval(() => {
      if (document.visibilityState === "visible") {
        loadData(true);
      }
    }, intervalTime);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [trips, loadData]);

  // Cálculos de Negocio Globales
  const validOrders = orders.filter((o) => o.status !== "cancelled" && o.status !== "rejected");

  const totalBilled = validOrders.reduce((acc, o) => {
    const sum = (o.items || []).reduce(
      (s: number, it: any) => s + (it.subtotal || it.quantity * (it.unitPrice || 0) || 0),
      0
    );
    return acc + sum;
  }, 0);

  const totalTons = validOrders.reduce((acc, o) => {
    if (typeof o.totalTons === "number") return acc + o.totalTons;
    const bags = (o.items || [])
      .filter((it: any) => (it.name || "").toLowerCase().includes("cemento"))
      .reduce((s: number, it: any) => s + (it.quantity || 0), 0);
    return acc + Number((bags * 0.0425).toFixed(2));
  }, 0);

  const pendingOrders = orders.filter((o) => o.status === "pending");
  const pendingApprovalCount = pendingOrders.length;

  const clients = users.filter((u) => u.userType === "client");
  const drivers = users.filter((u) => u.userType === "driver" && u.status === "active");
  const sellers = users.filter((u) => u.userType === "seller");
  const pendingUsers = users.filter((u) => u.status === "pending");
  const aiRiskUsers = users.filter((u) => (u as any).aiRiskFlag === true);

  const activeTrips = trips.filter((t) =>
    ["started", "in_progress", "accepted", "assigned"].includes(t.status)
  ).map((t) => {
    const matchedDriver = users.find(
      (u) => u.uid === t.assignedDriverId || u.uid === t.driverId
    );
    return {
      ...t,
      driver: t.driver || (matchedDriver ? { names: matchedDriver.names, lastNames: matchedDriver.lastNames, phone: matchedDriver.phone } : undefined),
      driverName: matchedDriver
        ? `${matchedDriver.names} ${matchedDriver.lastNames || ""}`.trim()
        : t.driver?.names || "Conductor por asignar",
      driverPhone: matchedDriver?.phone,
    };
  });

  // Filtrar viajes completados de los últimos 7 días
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const completedTrips = trips
    .filter((t) => {
      if (t.status !== "completed") return false;
      const tDate = new Date(t.completedAt || t.updatedAt || t.createdAt || 0);
      return tDate >= sevenDaysAgo;
    })
    .map((t) => {
      const matchedOrder = orders.find((o) =>
        (t.orderIds || []).includes(o.id) || (t.orderIds || []).includes(String(o.orderNumber))
      );
      const matchedDriver = users.find(
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

  // Cartera de Vendedores organizada por órdenes de clientes (app + asistidas)
  const topSellers: TopSellerSummary[] = sellers
    .map((s) => {
      const sellerClients = clients.filter((c) => c.sellerId === s.uid);
      const sellerClientIds = new Set(sellerClients.map((c) => c.uid));

      // Órdenes de sus clientes en la app + órdenes asistidas creadas por el vendedor
      const sellerOrders = validOrders.filter(
        (o) =>
          o.sellerId === s.uid ||
          o.createdBySellerId === s.uid ||
          (o.userId && sellerClientIds.has(o.userId))
      );

      const billed = sellerOrders.reduce((acc, o) => {
        const sum = (o.items || []).reduce(
          (sub: number, it: any) => sub + (it.subtotal || it.quantity * (it.unitPrice || 0) || 0),
          0
        );
        return acc + sum;
      }, 0);
      const tons = sellerOrders.reduce((acc, o) => acc + (Number(o.totalTons) || 0), 0);
      const code = s.sellerCode || (s.uid ? `VEND-${s.uid.slice(0, 5).toUpperCase()}` : "VEND-XXXX");

      return {
        uid: s.uid,
        names: s.names,
        lastNames: s.lastNames || "",
        sellerCode: code,
        phone: s.phone,
        totalBilled: billed,
        totalTons: Number(tons.toFixed(2)),
        clientsCount: sellerClients.length,
        ordersCount: sellerOrders.length,
      };
    })
    .sort((a, b) => b.ordersCount - a.ordersCount);

  // Cartera de Conductores (Flota, camiones, estado y viajes)
  const driversSummary: DriverSummary[] = drivers.map((d) => {
    const activeTrip = trips.find(
      (t) =>
        (t.assignedDriverId === d.uid || t.driverId === d.uid) &&
        ["started", "in_progress"].includes(t.status)
    );
    const driverCompletedTrips = trips.filter(
      (t) =>
        (t.assignedDriverId === d.uid || t.driverId === d.uid) &&
        t.status === "completed"
    );
    const deliveredTons = driverCompletedTrips.reduce(
      (acc, t) => acc + (Number(t.totalTons) || 0),
      0
    );

    return {
      uid: d.uid,
      names: d.names,
      lastNames: d.lastNames || "",
      phone: d.phone,
      vehicle: d.vehicle,
      isOnRoute: !!activeTrip,
      completedTripsCount: driverCompletedTrips.length,
      totalDeliveredTons: Number(deliveredTons.toFixed(2)),
    };
  });

  return {
    user,
    loading,
    isRefreshing,
    lastUpdated,
    metrics: {
      totalBilled,
      totalTons: Number(totalTons.toFixed(2)),
      pendingOrdersCount: pendingApprovalCount,
      activeTripsCount: activeTrips.length,
      clientsCount: clients.length,
      driversCount: drivers.length,
      sellersCount: sellers.length,
      pendingUsersCount: pendingUsers.length,
      aiRiskCount: aiRiskUsers.length,
    },
    activeTrips,
    completedTrips,
    clients,
    pendingOrders: pendingOrders.slice(0, 5),
    pendingUsers: pendingUsers.slice(0, 5),
    topSellers: topSellers.slice(0, 6),
    driversSummary: driversSummary.slice(0, 6),
    recentOrders: orders.slice(0, 6),
    reload: () => loadData(true),
  };
};
