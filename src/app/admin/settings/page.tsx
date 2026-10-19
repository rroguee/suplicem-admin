import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import BankAccountListTable from "@/components/tables/BankAccountListTable";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Configuración | Suplicem Admin",
  description:
    "Gestiona la configuración del sistema, incluyendo las cuentas bancarias registradas.",
};

export default function SettingsPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Configuración" />
      <div className="space-y-6">
        <ComponentCard
          title="Cuentas Bancarias"
          desc="Administra las cuentas bancarias del sistema. Puedes crear, editar y eliminar cuentas."
        >
          <BankAccountListTable />
        </ComponentCard>
      </div>
    </div>
  );
}
