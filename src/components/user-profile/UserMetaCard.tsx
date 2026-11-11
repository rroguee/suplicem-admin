"use client";
import React, { useContext } from "react";
import Image from "next/image";
import { AuthContext } from "@/context/authContext";

export default function UserMetaCard() {
  const { user } = useContext(AuthContext);

  const fullName = `${user?.names || ""} ${user?.lastNames || ""}`.trim() || "Usuario Suplicem";
  const roleName = user?.userType === "admin" ? "Administrador" : user?.userType === "seller" ? "Vendedor" : "Usuario";
  const sellerCode = (user as any)?.sellerCode || (user?.uid ? `VEND-${user.uid.slice(0, 5).toUpperCase()}` : null);

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 bg-white dark:bg-white/[0.03]">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col items-center gap-5 sm:flex-row text-center sm:text-left">
          <div className="relative w-20 h-20 overflow-hidden border-2 border-orange-500/20 rounded-full dark:border-gray-700 shadow-sm">
            <Image
              width={80}
              height={80}
              src="/images/user/owner.jpg"
              alt="user"
              className="object-cover w-full h-full"
            />
          </div>
          <div>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1.5">
              <h4 className="text-xl font-bold text-gray-800 dark:text-white/90">
                {fullName}
              </h4>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                user?.userType === "admin" 
                  ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                  : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
              }`}>
                {roleName}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3 text-sm text-gray-500 dark:text-gray-400">
              <p>{user?.email || "Sin correo"}</p>
              {sellerCode && user?.userType === "seller" && (
                <>
                  <span className="hidden sm:inline text-gray-300 dark:text-gray-700">•</span>
                  <p className="font-mono font-medium text-xs text-blue-600 dark:text-blue-400">
                    Credencial: {sellerCode}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center sm:justify-end">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/40 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Cuenta Activa
          </div>
        </div>
      </div>
    </div>
  );
}
