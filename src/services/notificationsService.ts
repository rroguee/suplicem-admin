import protectedApi from "./protectedApi";
import { AppNotification } from "@/types/notification";
import { formatTimeAgo } from "@/utils/timeAgo";

export const notificationsService = {
  async getNotifications(limit = 50): Promise<AppNotification[]> {
    try {
      const response = await protectedApi.get("/notifications", {
        params: { limit },
      });
      const rawList = response.data?.notifications || [];

      return rawList.map((n: any) => ({
        id: n.id,
        type: n.type || "order_created",
        category: n.category || "orders",
        actorName: n.actorName || "Sistema Suplicem",
        actorRole: n.actorRole,
        actorAvatar: n.actorAvatar,
        title: n.title || "",
        description: n.description || "",
        timestamp: n.createdAt,
        timeAgo: formatTimeAgo(n.createdAt),
        isRead: !!n.isRead,
        preview: n.preview,
      }));
    } catch (error: any) {
      console.warn("[notificationsService] Error al obtener notificaciones:", error?.message || error);
      return [];
    }
  },

  async markAsRead(id: string): Promise<void> {
    try {
      await protectedApi.patch(`/notifications/${id}/read`);
    } catch (error: any) {
      console.error("[notificationsService] Error en markAsRead:", error?.message || error);
    }
  },

  async markAllAsRead(): Promise<void> {
    try {
      await protectedApi.patch("/notifications/read-all");
    } catch (error: any) {
      console.error("[notificationsService] Error en markAllAsRead:", error?.message || error);
    }
  },
};
