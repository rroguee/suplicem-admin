import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ProductListTable from "@/components/tables/ProductListTable";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Productos | TailAdmin - Next.js Dashboard Template",
  description:
    "Esta es la página de lista de productos del panel de administración TailAdmin.",
};

export default function ProductListPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Productos" />
      <div className="space-y-6">
        <ComponentCard title="Productos">
          <ProductListTable />
        </ComponentCard>
      </div>
    </div>
  );
}
