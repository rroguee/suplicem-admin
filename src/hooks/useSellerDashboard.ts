import { useState, useEffect, useCallback, useContext, useRef } from "react";
import { AuthContext } from "@/context/authContext";
import { User } from "@/services/usersService";
import { getDashboardSummary, DashboardMetricsSummary } from "@/services/dashboardService";

const COOLDOWN_MS = 10_000;

export const useSellerDashboard = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const [metrics, setMetrics] = useState<Pick<
    DashboardMetricsSummary,
    "totalBilled" | "totalTons" | "clientsCount" | "pendingOrdersCount" | "activeDeliveriesCount"
  >>({
    totalBilled: 0,
    totalTons: 0,
    clientsCount: 0,
    pendingOrdersCount: 0,
    activeDeliveriesCount: 0,
  });
  const [clients, setClients] = useState<User[]>([]);
  const [activeTrips, setActiveTrips] = useState<any[]>([]);
  const [completedTrips, setCompletedTrips] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  const inFlightRef = useRef(false);
  const lastLoadedAtRef = useRef(0);
  const hasActiveTripsRef = useRef(false);

  const loadDashboardData = useCallback(async (silent = false, force = false) => {
    if (!user?.uid) return;
    if (inFlightRef.current) return;
    if (!force && silent && Date.now() - lastLoadedAtRef.current < COOLDOWN_MS) return;

    inFlightRef.current = true;
    if (silent) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const res = await getDashboardSummary(force);
      if (res?.success) {
        const nextActive = res.activeTrips || [];
        hasActiveTripsRef.current = nextActive.length > 0;
        setMetrics({
          totalBilled: res.metrics?.totalBilled || 0,
          totalTons: res.metrics?.totalTons || 0,
          clientsCount: res.metrics?.clientsCount || 0,
          pendingOrdersCount: res.metrics?.pendingOrdersCount || 0,
          activeDeliveriesCount: res.metrics?.activeDeliveriesCount || 0,
        });
        setClients(res.clients || []);
        setActiveTrips(nextActive);
        setCompletedTrips(res.completedTrips || []);
        setRecentOrders(res.recentOrders || []);
        setLastUpdated(new Date());
        lastLoadedAtRef.current = Date.now();
      }
    } catch (err) {
      console.error("Error al cargar datos del dashboard de vendedor:", err);
    } finally {
      inFlightRef.current = false;
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    loadDashboardData(false, true);

    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === "visible") {
        loadDashboardData(true);
      }
    };
    const handleOrderCreated = () => loadDashboardData(true, true);

    document.addEventListener("visibilitychange", handleVisibilityOrFocus);
    window.addEventListener("focus", handleVisibilityOrFocus);
    window.addEventListener("order-created", handleOrderCreated);

    let tickCount = 0;
    const intervalId = setInterval(() => {
      if (document.visibilityState !== "visible") return;
      tickCount += 1;
      // Con viajes activos refresca cada 45s; en reposo cada 90s
      if (hasActiveTripsRef.current || tickCount % 2 === 0) {
        loadDashboardData(true, false);
      }
    }, 45_000);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
      window.removeEventListener("focus", handleVisibilityOrFocus);
      window.removeEventListener("order-created", handleOrderCreated);
    };
  }, [loadDashboardData]);

  return {
    user,
    loading,
    isRefreshing,
    lastUpdated,
    metrics,
    clients,
    activeTrips,
    completedTrips,
    recentOrders,
    reload: () => loadDashboardData(false, true),
  };
};
