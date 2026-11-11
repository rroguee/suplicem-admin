import {
  ShoppingCart,
  CheckCircle2,
  Truck,
  PackageCheck,
  AlertTriangle,
  UserPlus,
  BadgeDollarSign,
  LucideIcon,
} from "lucide-react";
import { NotificationType } from "@/types/notification";

export interface NotificationTheme {
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  accentBorder: string;
  unreadBg: string;
  dotColor: string;
}

const DEFAULT_THEME: NotificationTheme = {
  icon: CheckCircle2,
  iconColor: "text-gray-600 dark:text-gray-400",
  iconBg: "bg-gray-100 ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-gray-700",
  accentBorder: "border-l-gray-400",
  unreadBg: "bg-gray-50/60 dark:bg-white/[0.03]",
  dotColor: "bg-gray-500",
};

export const NOTIFICATION_THEME_MAP: Record<NotificationType, NotificationTheme> = {
  order_created: {
    icon: ShoppingCart,
    iconColor: "text-orange-600 dark:text-orange-400",
    iconBg: "bg-orange-50 ring-1 ring-orange-200/80 dark:bg-orange-500/15 dark:ring-orange-500/30",
    accentBorder: "border-l-orange-500",
    unreadBg: "bg-orange-50/40 dark:bg-orange-950/15",
    dotColor: "bg-orange-500",
  },
  order_approved: {
    icon: CheckCircle2,
    iconColor: "text-emerald-600 dark:text-emerald-400",
    iconBg: "bg-emerald-50 ring-1 ring-emerald-200/80 dark:bg-emerald-500/15 dark:ring-emerald-500/30",
    accentBorder: "border-l-emerald-500",
    unreadBg: "bg-emerald-50/40 dark:bg-emerald-950/15",
    dotColor: "bg-emerald-500",
  },
  order_rejected: {
    icon: AlertTriangle,
    iconColor: "text-rose-600 dark:text-rose-400",
    iconBg: "bg-rose-50 ring-1 ring-rose-200/80 dark:bg-rose-500/15 dark:ring-rose-500/30",
    accentBorder: "border-l-rose-500",
    unreadBg: "bg-rose-50/40 dark:bg-rose-950/15",
    dotColor: "bg-rose-500",
  },
  order_risk: {
    icon: AlertTriangle,
    iconColor: "text-rose-600 dark:text-rose-400",
    iconBg: "bg-rose-50 ring-1 ring-rose-200/80 dark:bg-rose-500/15 dark:ring-rose-500/30",
    accentBorder: "border-l-rose-500",
    unreadBg: "bg-rose-50/40 dark:bg-rose-950/15",
    dotColor: "bg-rose-500",
  },
  trip_assigned: {
    icon: Truck,
    iconColor: "text-sky-600 dark:text-sky-400",
    iconBg: "bg-sky-50 ring-1 ring-sky-200/80 dark:bg-sky-500/15 dark:ring-sky-500/30",
    accentBorder: "border-l-sky-500",
    unreadBg: "bg-sky-50/40 dark:bg-sky-950/15",
    dotColor: "bg-sky-500",
  },
  trip_in_transit: {
    icon: Truck,
    iconColor: "text-sky-600 dark:text-sky-400",
    iconBg: "bg-sky-50 ring-1 ring-sky-200/80 dark:bg-sky-500/15 dark:ring-sky-500/30",
    accentBorder: "border-l-sky-500",
    unreadBg: "bg-sky-50/40 dark:bg-sky-950/15",
    dotColor: "bg-sky-500",
  },
  delivery_completed: {
    icon: PackageCheck,
    iconColor: "text-blue-600 dark:text-blue-400",
    iconBg: "bg-blue-50 ring-1 ring-blue-200/80 dark:bg-blue-500/15 dark:ring-blue-500/30",
    accentBorder: "border-l-blue-500",
    unreadBg: "bg-blue-50/40 dark:bg-blue-950/15",
    dotColor: "bg-blue-500",
  },
  client_assigned: {
    icon: UserPlus,
    iconColor: "text-purple-600 dark:text-purple-400",
    iconBg: "bg-purple-50 ring-1 ring-purple-200/80 dark:bg-purple-500/15 dark:ring-purple-500/30",
    accentBorder: "border-l-purple-500",
    unreadBg: "bg-purple-50/40 dark:bg-purple-950/15",
    dotColor: "bg-purple-500",
  },
  credit_approved: {
    icon: BadgeDollarSign,
    iconColor: "text-amber-600 dark:text-amber-400",
    iconBg: "bg-amber-50 ring-1 ring-amber-200/80 dark:bg-amber-500/15 dark:ring-amber-500/30",
    accentBorder: "border-l-amber-500",
    unreadBg: "bg-amber-50/40 dark:bg-amber-950/15",
    dotColor: "bg-amber-500",
  },
};

export const getNotificationTheme = (type: NotificationType): NotificationTheme =>
  NOTIFICATION_THEME_MAP[type] || DEFAULT_THEME;
