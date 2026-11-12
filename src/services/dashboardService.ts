import protectedApi from "./protectedApi";

export interface DashboardMetricsSummary {
  totalBilled: number;
  totalTons: number;
  pendingOrdersCount: number;
  activeTripsCount: number;
  activeDeliveriesCount: number;
  clientsCount: number;
  driversCount: number;
  sellersCount: number;
  pendingUsersCount: number;
  aiRiskCount: number;
}

export interface DashboardSummaryResponse {
  success: boolean;
  metrics: DashboardMetricsSummary;
  activeTrips: any[];
  completedTrips: any[];
  clients: any[];
  recentOrders: any[];
  pendingOrders: any[];
  pendingUsers: any[];
  topSellers: any[];
  driversSummary: any[];
}

export const getDashboardSummary = async (force = false): Promise<DashboardSummaryResponse> => {
  const response = await protectedApi.get("/dashboard/summary", {
    params: force ? { force: "true" } : {},
  });
  return response.data;
};
