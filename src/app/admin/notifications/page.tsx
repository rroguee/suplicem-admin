import { Metadata } from "next";
import { NotificationsView } from "@/components/notifications/NotificationsView";

export const metadata: Metadata = {
  title: "Notificaciones | Suplicem Admin",
  description: "Centro de notificaciones y alertas comerciales de Suplicem",
};

export default function NotificationsPage() {
  return <NotificationsView />;
}
