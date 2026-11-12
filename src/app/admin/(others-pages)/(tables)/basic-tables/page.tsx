import OrderListTable from "@/components/tables/OrderListTable";
import { Metadata } from "next";
import React, { Suspense } from "react";

export const metadata: Metadata = {
  title: "Gestión de Órdenes | Suplicem Admin",
  description:
    "Panel de gestión, aprobación y logística de órdenes de compra Suplicem.",
};

export default function OrderListPage() {
  return (
    <div className="space-y-4">
      <Suspense fallback={null}>
        <OrderListTable />
      </Suspense>
    </div>
  );
}
