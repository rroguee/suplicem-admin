"use client";

import React from "react";
import { useNotificationsFeed } from "@/hooks/useNotificationsFeed";
import { NotificationsHeader } from "./NotificationsHeader";
import { NotificationCard } from "./NotificationCard";
import { NotificationEmptyState } from "./NotificationEmptyState";

export const NotificationsView: React.FC = () => {
  const {
    notifications,
    activeTab,
    setActiveTab,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
  } = useNotificationsFeed();

  return (
    <div className="mx-auto max-w-3xl min-h-[calc(100vh-140px)] rounded-2xl border border-gray-200 bg-white shadow-xs dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
      <NotificationsHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        unreadCount={unreadCount}
        onMarkAllAsRead={markAllAsRead}
      />

      {loading ? (
        <div className="divide-y divide-gray-100 p-4 dark:divide-gray-800 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-3.5 pt-4 animate-pulse">
              <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-800" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/3 rounded bg-gray-200 dark:bg-gray-800" />
                <div className="h-3 w-3/4 rounded bg-gray-100 dark:bg-gray-800/60" />
                <div className="h-16 w-full rounded-xl bg-gray-100 dark:bg-gray-800/40" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onRead={markAsRead}
              />
            ))
          ) : (
            <NotificationEmptyState tabName={activeTab} />
          )}
        </div>
      )}
    </div>
  );
};
