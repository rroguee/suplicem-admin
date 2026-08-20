import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import OrderListTable from "@/components/tables/OrderListTable";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Lista de Órdenes | TailAdmin - Next.js Dashboard Template",
  description:
    "Esta es la página de lista de órdenes del panel de administración TailAdmin.",
};

export default function OrderListPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Órdenes" />
      <div className="space-y-6">
        <ComponentCard title="Órdenes">
          <OrderListTable />
        </ComponentCard>
      </div>
    </div>
  );
}
