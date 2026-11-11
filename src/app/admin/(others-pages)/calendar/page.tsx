import dynamic from "next/dynamic";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

const Calendar = dynamic(() => import("@/components/calendar/Calendar"), {
  loading: () => <div className="h-[600px] w-full animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800" />,
});

export const metadata: Metadata = {
  title: "Calendario Operativo | Suplicem Admin",
  description: "Agenda y calendario de eventos, citas y despachos de Suplicem.",
};

export default function CalendarPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Calendario" />
      <Calendar />
    </div>
  );
}
