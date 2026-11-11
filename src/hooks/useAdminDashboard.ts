import { useState, useEffect, useCallback, useContext, useRef } from "react";
import { AuthContext } from "@/context/authContext";
import { User } from "@/services/usersService";
import { getDashboardSummary, DashboardMetricsSummary } from "@/services/dashboardService";

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

const INITIAL_METRICS: DashboardMetricsSummary = {
  totalBilled: 0,
  totalTons: 0,
  pendingOrdersCount: 0,
  activeTripsCount: 0,
  activeDeliveriesCount: 0,
  clientsCount: 0,
  driversCount: 0,
  sellersCount: 0,
  pendingUsersCount: 0,
  aiRiskCount: 0,
};

const COOLDOWN_MS = 10_000;

export const useAdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const [metrics, setMetrics] = useState<DashboardMetricsSummary>(INITIAL_METRICS);
  const [activeTrips, setActiveTrips] = useState<any[]>([]);
  const [completedTrips, setCompletedTrips] = useState<any[]>([]);
  const [clients, setClients] = useState<User[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [topSellers, setTopSellers] = useState<TopSellerSummary[]>([]);
  const [driversSummary, setDriversSummary] = useState<DriverSummary[]>([]);

  const inFlightRef = useRef(false);
  const lastLoadedAtRef = useRef(0);
  const hasActiveTripsRef = useRef(false);

  const loadData = useCallback(async (silent = false, force = false) => {
    if (inFlightRef.current) return;
    if (!force && silent && Date.now() - lastLoadedAtRef.current < COOLDOWN_MS) return;

    inFlightRef.current = true;
    if (silent) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const res = await getDashboardSummary();
      if (res?.success) {
        setMetrics(res.metrics || INITIAL_METRICS);
        const nextActive = res.activeTrips || [];
        hasActiveTripsRef.current = nextActive.some((t: any) =>
          ["started", "in_progress", "accepted"].includes(t.status)
        );
        setActiveTrips(nextActive);
        setCompletedTrips(res.completedTrips || []);
        setClients(res.clients || []);
        setRecentOrders(res.recentOrders || []);
        setPendingOrders(res.pendingOrders || []);
        setPendingUsers(res.pendingUsers || []);
        setTopSellers(res.topSellers || []);
        setDriversSummary(res.driversSummary || []);
        setLastUpdated(new Date());
        lastLoadedAtRef.current = Date.now();
      }
    } catch (err) {
      console.error("Error al cargar datos del dashboard administrativo:", err);
    } finally {
      inFlightRef.current = false;
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData(false, true);

    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === "visible") {
        loadData(true);
      }
    };
    const handleOrderCreated = () => loadData(true, true);

    document.addEventListener("visibilitychange", handleVisibilityOrFocus);
    window.addEventListener("focus", handleVisibilityOrFocus);
    window.addEventListener("order-created", handleOrderCreated);

    let tickCount = 0;
    const intervalId = setInterval(() => {
      if (document.visibilityState !== "visible") return;
      tickCount += 1;
      // Con viajes en ruta refresca cada 15s; en reposo cada 30s (cada 2 ticks)
      if (hasActiveTripsRef.current || tickCount % 2 === 0) {
        loadData(true);
      }
    }, 15_000);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
      window.removeEventListener("focus", handleVisibilityOrFocus);
      window.removeEventListener("order-created", handleOrderCreated);
    };
  }, [loadData]);

  return {
    user,
    loading,
    isRefreshing,
    lastUpdated,
    metrics,
    activeTrips,
    completedTrips,
    clients,
    pendingOrders,
    pendingUsers,
    topSellers,
    driversSummary,
    recentOrders,
    reload: () => loadData(true, true),
  };
};
