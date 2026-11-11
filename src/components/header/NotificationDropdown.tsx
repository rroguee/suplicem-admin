"use client";

import Link from "next/link";
import React, { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { NotificationCard } from "../notifications/NotificationCard";
import { useNotificationsFeed } from "@/hooks/useNotificationsFeed";
import { Bell, CheckCheck } from "lucide-react";

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationsFeed();

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  return (
    <div className="relative">
      <button
        className="relative dropdown-toggle flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full hover:text-gray-700 h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        onClick={toggleDropdown}
        aria-label="Notificaciones"
      >
        {unreadCount > 0 && (
          <span className="absolute right-0 top-0.5 z-10 flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-orange-500" />
          </span>
        )}
        <Bell className="h-5 w-5" />
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute -right-[240px] mt-[17px] flex h-[480px] w-[350px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark sm:w-[361px] lg:right-0 z-50"
      >
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <h5 className="text-base font-bold text-gray-900 dark:text-white">
              Notificaciones
            </h5>
            {unreadCount > 0 && (
              <span className="flex h-5 items-center justify-center rounded-full bg-orange-600 px-1.5 text-[11px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1 text-[11px] font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400"
              title="Marcar todas como leídas"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              <span>Leídas</span>
            </button>
          )}
        </div>

        <ul className="flex flex-col flex-1 gap-1 overflow-y-auto custom-scrollbar divide-y divide-gray-100 dark:divide-gray-800/60">
          {notifications.length > 0 ? (
            notifications.slice(0, 5).map((n) => (
              <li key={n.id}>
                <NotificationCard
                  notification={n}
                  variant="compact"
                  onRead={markAsRead}
                  onNavigate={closeDropdown}
                />
              </li>
            ))
          ) : (
            <li className="flex flex-col items-center justify-center py-10 text-center">
              <p className="text-xs text-gray-400">No hay notificaciones pendientes</p>
            </li>
          )}
        </ul>

        <Link
          href="/admin/notifications"
          onClick={closeDropdown}
          className="block px-4 py-2 mt-2 text-xs font-semibold text-center text-gray-700 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          Ver todas las notificaciones
        </Link>
      </Dropdown>
    </div>
  );
}
