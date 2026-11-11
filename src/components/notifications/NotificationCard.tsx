import React from "react";
import Image from "next/image";
import Link from "next/link";
import { AppNotification } from "@/types/notification";
import { getNotificationTheme } from "./notificationTheme";
import { NotificationPreviewCard } from "./NotificationPreviewCard";

interface Props {
  notification: AppNotification;
  onRead: (id: string) => void;
  variant?: "default" | "compact";
  onNavigate?: () => void;
}

export const NotificationCard: React.FC<Props> = ({
  notification,
  onRead,
  variant = "default",
  onNavigate,
}) => {
  const isCompact = variant === "compact";
  const theme = getNotificationTheme(notification.type);
  const IconComponent = theme.icon;

  const containerClassName = `group relative flex transition ${theme.accentBorder} ${
    !notification.isRead ? theme.unreadBg : ""
  } ${
    isCompact
      ? "gap-3 rounded-xl border-l-[3px] p-2.5 hover:bg-gray-50 dark:hover:bg-white/5"
      : "cursor-pointer gap-3.5 border-b border-l-4 border-gray-100 p-4 hover:bg-gray-50/80 dark:border-gray-800 dark:hover:bg-white/[0.02]"
  }`;

  const cardBody = (
    <>
      <div className="flex flex-col items-center pt-0.5">
        <span className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${theme.iconBg}`}>
          <IconComponent className={`${isCompact ? "h-3.5 w-3.5" : "h-4 w-4"} ${theme.iconColor}`} />
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            {!isCompact && notification.actorAvatar && (
              <Image
                src={notification.actorAvatar}
                alt={notification.actorName}
                width={28}
                height={28}
                className="rounded-full object-cover"
              />
            )}
            <p className={`${isCompact ? "text-xs leading-tight" : "text-sm"} text-gray-800 dark:text-gray-200`}>
              <span className="font-bold text-gray-900 dark:text-white">
                {notification.actorName}
              </span>
              {!isCompact && notification.actorRole && (
                <span className="hidden text-xs text-gray-500 dark:text-gray-400 sm:inline">
                  {" "}• {notification.actorRole}
                </span>
              )}{" "}
              <span>{notification.title}</span>
            </p>
          </div>

          <div className="flex flex-shrink-0 items-center gap-2">
            <span className={`${isCompact ? "text-[11px]" : "text-xs"} text-gray-400 dark:text-gray-400`}>
              {notification.timeAgo}
            </span>
            {!notification.isRead && (
              <span
                className={`rounded-full ${theme.dotColor} ${
                  isCompact ? "h-1.5 w-1.5" : "h-2 w-2 ring-2 ring-white dark:ring-gray-900"
                }`}
              />
            )}
          </div>
        </div>

        {!isCompact && notification.description && (
          <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
            {notification.description}
          </p>
        )}

        {!isCompact && notification.preview && (
          <NotificationPreviewCard preview={notification.preview} />
        )}
      </div>
    </>
  );

  if (isCompact) {
    return (
      <Link
        href={notification.preview?.actionUrl || "/admin/notifications"}
        onClick={() => {
          onRead(notification.id);
          onNavigate?.();
        }}
        className={containerClassName}
      >
        {cardBody}
      </Link>
    );
  }

  return (
    <article onClick={() => onRead(notification.id)} className={containerClassName}>
      {cardBody}
    </article>
  );
};
