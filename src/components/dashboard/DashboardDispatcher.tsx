"use client";

import React, { useContext } from "react";
import { AuthContext } from "@/context/authContext";
import { SellerDashboardView } from "./seller/SellerDashboardView";
import { AdminDashboardView } from "./admin/AdminDashboardView";

export function DashboardDispatcher() {
  const { user } = useContext(AuthContext);

  // Si quien navega es un Vendedor, renderizar su Dashboard Comercial Personal
  if (user?.userType === "seller") {
    return <SellerDashboardView />;
  }

  // Si es Administrador, renderizar el Dashboard Global de Suplicem
  return <AdminDashboardView />;
}
