"use client";

import React from "react";
import { ArrowLeft, Mail, Phone, CreditCard, ShieldCheck } from "lucide-react";
import Badge from "@/components/ui/badge/Badge";
import { User } from "@/services/usersService";

interface Props {
  seller: User;
  onBack: () => void;
}

export const SellerHeaderCard: React.FC<Props> = ({ seller, onBack }) => {
  const sellerCode =
    seller.sellerCode ||
    (seller.uid ? `VEND-${seller.uid.slice(0, 5).toUpperCase()}` : "VEND-XXXX");

  const initials = `${seller.names?.[0] || ""}${seller.lastNames?.[0] || ""}`.toUpperCase();

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            title="Volver a Usuarios"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 font-bold text-white text-xl shadow-md">
            {initials || "VD"}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
                {seller.names} {seller.lastNames}
              </h1>
              <Badge size="sm" color="info">
                {sellerCode}
              </Badge>
              <Badge
                size="sm"
                color={seller.status === "active" ? "success" : "error"}
              >
                {seller.status === "active" ? "Activo" : "Inactivo"}
              </Badge>
            </div>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              Vendedor Comercial Autorizado de Suplicem
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 dark:text-gray-300 sm:justify-end">
          <div className="flex items-center gap-1.5 rounded-lg bg-gray-50 px-3 py-1.5 dark:bg-gray-800/60">
            <Mail className="h-4 w-4 text-gray-400" />
            <span>{seller.email}</span>
          </div>

          {seller.phone && (
            <div className="flex items-center gap-1.5 rounded-lg bg-gray-50 px-3 py-1.5 dark:bg-gray-800/60">
              <Phone className="h-4 w-4 text-gray-400" />
              <span>{seller.phone}</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 rounded-lg bg-gray-50 px-3 py-1.5 dark:bg-gray-800/60">
            <CreditCard className="h-4 w-4 text-gray-400" />
            <span>
              {seller.identificationType} - {seller.identification}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
