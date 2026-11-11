import { useState, useEffect, useMemo, useCallback } from "react";
import { AppNotification, NotificationCategory } from "@/types/notification";
import { notificationsService } from "@/services/notificationsService";

export const useNotificationsFeed = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [activeTab, setActiveTab] = useState<NotificationCategory>("all");
  const [loading, setLoading] = useState<boolean>(true);

  const fetchNotifications = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const data = await notificationsService.getNotifications(60);
      setNotifications(data);
    } finally {
      if (isInitial) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications(true);

    const intervalId = setInterval(() => {
      fetchNotifications(false);
    }, 30000);

    return () => clearInterval(intervalId);
  }, [fetchNotifications]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  const filteredNotifications = useMemo(() => {
    switch (activeTab) {
      case "orders":
        return notifications.filter((n) => n.category === "orders");
      case "deliveries":
        return notifications.filter((n) => n.category === "deliveries");
      case "clients":
        return notifications.filter((n) => n.category === "clients");
      case "unread":
        return notifications.filter((n) => !n.isRead);
      case "all":
      default:
        return notifications;
    }
  }, [notifications, activeTab]);

  const markAsRead = async (id: string) => {
    // Optimistic UI update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    await notificationsService.markAsRead(id);
  };

  const markAllAsRead = async () => {
    // Optimistic UI update
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    await notificationsService.markAllAsRead();
  };

  return {
    notifications: filteredNotifications,
    activeTab,
    setActiveTab,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refresh: () => fetchNotifications(false),
  };
};
