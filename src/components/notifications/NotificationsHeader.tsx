import React from "react";
import { CheckCheck } from "lucide-react";
import { NotificationCategory } from "@/types/notification";

interface Props {
  activeTab: NotificationCategory;
  onTabChange: (tab: NotificationCategory) => void;
  unreadCount: number;
  onMarkAllAsRead: () => void;
}

export const NotificationsHeader: React.FC<Props> = ({
  activeTab,
  onTabChange,
  unreadCount,
  onMarkAllAsRead,
}) => {
  const tabs: { id: NotificationCategory; label: string; count?: number }[] = [
    { id: "all", label: "Todas" },
    { id: "orders", label: "Pedidos" },
    { id: "deliveries", label: "Entregas" },
    { id: "clients", label: "Cartera" },
    { id: "unread", label: "No leídas", count: unreadCount },
  ];

  return (
    <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/90 backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/90">
      <div className="flex items-center justify-between px-4 py-3.5 sm:px-6">
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Notificaciones
          </h1>
          {unreadCount > 0 && (
            <span className="flex h-5 items-center justify-center rounded-full bg-orange-600 px-2 text-xs font-semibold text-white">
              {unreadCount} nuevas
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllAsRead}
            className="flex items-center gap-1.5 text-xs font-semibold text-orange-600 hover:text-orange-700 transition dark:text-orange-400"
          >
            <CheckCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Marcar todas como leídas</span>
          </button>
        )}
      </div>

      <nav className="flex overflow-x-auto no-scrollbar border-t border-gray-100 dark:border-gray-800/60">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex items-center justify-center px-5 py-3 text-sm font-medium transition hover:bg-gray-50 dark:hover:bg-gray-800/40 whitespace-nowrap ${
                isActive
                  ? "font-bold text-gray-950 dark:text-white"
                  : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              <span>{tab.label}</span>
              {typeof tab.count === "number" && tab.count > 0 && (
                <span className="ml-1.5 rounded-full bg-gray-200 px-1.5 py-0.2 text-[10px] font-bold text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                  {tab.count}
                </span>
              )}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-1 rounded-full bg-orange-500" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
