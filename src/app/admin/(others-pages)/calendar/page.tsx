import Calendar from "@/components/calendar/Calendar";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

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
