import UserListTable from "@/components/tables/UserListTable";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Gestión de Usuarios | Suplicem Admin",
  description:
    "Directorio corporativo, clientes, transportistas y equipo comercial de Suplicem.",
};

export default function UserListPage() {
  return (
    <div className="space-y-4">
      <UserListTable />
    </div>
  );
}
