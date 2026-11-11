export type NotificationType =
  | "order_created"
  | "order_approved"
  | "order_rejected"
  | "order_risk"
  | "trip_assigned"
  | "trip_in_transit"
  | "delivery_completed"
  | "client_assigned"
  | "credit_approved";

export type NotificationCategory = "all" | "orders" | "deliveries" | "clients" | "unread";

export interface NotificationPreview {
  badgeLabel: string;
  badgeColor: "success" | "warning" | "error" | "primary" | "info";
  orderNumber?: number;
  tripId?: string;
  totalAmount?: string;
  details?: string;
  imageUrl?: string;
  actionUrl: string;
}

export interface AppNotification {
  id: string;
  type: NotificationType;
  category: "orders" | "deliveries" | "clients";
  actorName: string;
  actorRole?: string;
  actorAvatar?: string;
  title: string;
  description: string;
  timestamp: string;
  timeAgo: string;
  isRead: boolean;
  preview?: NotificationPreview;
}
