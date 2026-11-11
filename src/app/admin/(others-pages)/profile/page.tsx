import UserAddressCard from "@/components/user-profile/UserAddressCard";
import UserInfoCard from "@/components/user-profile/UserInfoCard";
import UserMetaCard from "@/components/user-profile/UserMetaCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Configuración de Cuenta | Suplicem Admin",
  description:
    "Gestiona la información de perfil, credenciales y contacto de tu cuenta en Suplicem.",
};

export default function Profile() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Configuración de Cuenta" />
      <div className="space-y-6">
        <UserMetaCard />
        <UserInfoCard />
        <UserAddressCard />
      </div>
    </div>
  );
}
