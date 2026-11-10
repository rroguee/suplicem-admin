import type { Metadata } from "next";
import React from "react";
import { DashboardDispatcher } from "@/components/dashboard/DashboardDispatcher";

export const metadata: Metadata = {
  title: "Panel Comercial | Suplicem Admin",
  description: "Panel de administración y gestión comercial de Suplicem",
};

export default function DashboardPage() {
  return <DashboardDispatcher />;
}
