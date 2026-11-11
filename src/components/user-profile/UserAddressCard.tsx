"use client";
import React, { useContext } from "react";
import { AuthContext } from "@/context/authContext";

export default function UserAddressCard() {
  const { user } = useContext(AuthContext);

  const roleLabel =
    user?.userType === "admin"
      ? "Administrador General"
      : user?.userType === "seller"
      ? "Vendedor"
      : "Usuario Registrado";

  const sellerCode =
    (user as any)?.sellerCode ||
    (user?.uid ? `VEND-${user.uid.slice(0, 5).toUpperCase()}` : null);

  const primaryAddress =
    user?.addresses && user.addresses.length > 0
      ? user.addresses[0].description
      : "Oficinas Administrativas / Central de Operaciones Suplicem";

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 bg-white dark:bg-white/[0.03]">
      <div className="flex flex-col gap-6">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-5">
            Credenciales y Acceso Operativo
          </h4>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            <div>
              <p className="mb-1 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                Nivel de Permisos
              </p>
              <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
                {roleLabel}
              </p>
            </div>

            <div>
              <p className="mb-1 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                Estado de la Cuenta
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  Activa y Verificada
                </span>
              </div>
            </div>

            {user?.userType === "seller" && (
              <div>
                <p className="mb-1 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                  Código de Vendedor
                </p>
                <p className="font-mono text-sm font-semibold text-blue-600 dark:text-blue-400">
                  {sellerCode || "VEND-OFICIAL"}
                </p>
              </div>
            )}

            <div className="sm:col-span-2 lg:col-span-3">
              <p className="mb-1 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                Ubicación / Sede de Operaciones
              </p>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {primaryAddress}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
