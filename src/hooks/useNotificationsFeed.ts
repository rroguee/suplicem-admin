import { useState, useMemo } from "react";
import { NotificationCategory } from "@/types/notification";
import { useNotificationContext } from "@/context/NotificationContext";

export const useNotificationsFeed = () => {
  const ctx = useNotificationContext();
  const [activeTab, setActiveTab] = useState<NotificationCategory>("all");

  const allNotifications = ctx?.notifications ?? [];

  const filteredNotifications = useMemo(() => {
    switch (activeTab) {
      case "orders":
        return allNotifications.filter((n) => n.category === "orders");
      case "deliveries":
        return allNotifications.filter((n) => n.category === "deliveries");
      case "clients":
        return allNotifications.filter((n) => n.category === "clients");
      case "unread":
        return allNotifications.filter((n) => !n.isRead);
      case "all":
      default:
        return allNotifications;
    }
  }, [allNotifications, activeTab]);

  return {
    notifications: filteredNotifications,
    activeTab,
    setActiveTab,
    unreadCount: ctx?.unreadCount ?? 0,
    loading: ctx?.loading ?? false,
    markAsRead: ctx?.markAsRead ?? (async () => {}),
    markAllAsRead: ctx?.markAllAsRead ?? (async () => {}),
    refresh: ctx?.refresh ?? (async () => {}),
  };
};
