import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import UserListTable from "@/components/tables/UserListTable";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Usuarios | TailAdmin - Next.js Dashboard Template",
  description:
    "Esta es la página de lista de usuarios del panel de administración TailAdmin.",
};

export default function UserListPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Usuarios" />
      <div className="space-y-6">
        <ComponentCard title="Usuarios">
          <UserListTable />
        </ComponentCard>
      </div>
    </div>
  );
}
