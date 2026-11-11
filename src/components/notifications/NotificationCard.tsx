import React from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  ShoppingCart, 
  CheckCircle2, 
  Truck, 
  AlertTriangle, 
  UserPlus, 
  ArrowUpRight 
} from "lucide-react";
import Badge from "@/components/ui/badge/Badge";
import { AppNotification } from "@/types/notification";

interface Props {
  notification: AppNotification;
  onRead: (id: string) => void;
}

export const NotificationCard: React.FC<Props> = ({ notification, onRead }) => {
  const renderIcon = () => {
    switch (notification.type) {
      case "order_created":
        return <ShoppingCart className="h-4 w-4 text-orange-600 dark:text-orange-400" />;
      case "order_approved":
        return <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
      case "delivery_completed":
      case "trip_assigned":
      case "trip_in_transit":
        return <Truck className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
      case "order_risk":
      case "order_rejected":
        return <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400" />;
      case "client_assigned":
      case "credit_approved":
        return <UserPlus className="h-4 w-4 text-purple-600 dark:text-purple-400" />;
      default:
        return <CheckCircle2 className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <article
      onClick={() => onRead(notification.id)}
      className={`group relative flex gap-3.5 border-b border-gray-100 p-4 transition hover:bg-gray-50/80 dark:border-gray-800 dark:hover:bg-white/[0.02] cursor-pointer ${
        !notification.isRead ? "bg-orange-50/20 dark:bg-orange-950/10" : ""
      }`}
    >
      <div className="flex flex-col items-center pt-0.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
          {renderIcon()}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {notification.actorAvatar ? (
              <Image
                src={notification.actorAvatar}
                alt={notification.actorName}
                width={28}
                height={28}
                className="rounded-full object-cover"
              />
            ) : null}
            <span className="truncate text-sm font-bold text-gray-900 dark:text-white">
              {notification.actorName}
            </span>
            {notification.actorRole && (
              <span className="hidden sm:inline text-xs text-gray-500 dark:text-gray-400">
                • {notification.actorRole}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {notification.timeAgo}
            </span>
            {!notification.isRead && (
              <span className="h-2 w-2 rounded-full bg-orange-500 ring-2 ring-white dark:ring-gray-900" />
            )}
          </div>
        </div>

        <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
          <span className="font-semibold text-gray-900 dark:text-white">
            {notification.title}:
          </span>{" "}
          {notification.description}
        </p>

        {notification.preview && (
          <Link
            href={notification.preview.actionUrl}
            onClick={(e) => e.stopPropagation()}
            className="mt-3 block rounded-xl border border-gray-200 bg-white p-3 shadow-xs transition hover:border-orange-300 hover:shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:hover:border-orange-500/40"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Badge
                  size="sm"
                  variant="light"
                  color={notification.preview.badgeColor}
                >
                  {notification.preview.badgeLabel}
                </Badge>
                {notification.preview.orderNumber && (
                  <span className="text-xs font-bold text-gray-900 dark:text-white">
                    Pedido #{notification.preview.orderNumber}
                  </span>
                )}
                {notification.preview.tripId && (
                  <span className="text-xs font-bold text-gray-900 dark:text-white">
                    {notification.preview.tripId}
                  </span>
                )}
              </div>
              {notification.preview.totalAmount && (
                <span className="text-xs font-bold text-gray-900 dark:text-white">
                  {notification.preview.totalAmount}
                </span>
              )}
            </div>
            {notification.preview.details && (
              <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400 truncate">
                {notification.preview.details}
              </p>
            )}
            <div className="mt-2 flex items-center justify-end text-[11px] font-semibold text-orange-600 dark:text-orange-400 gap-0.5">
              <span>Ver detalle</span>
              <ArrowUpRight className="h-3 w-3" />
            </div>
          </Link>
        )}
      </div>
    </article>
  );
};
