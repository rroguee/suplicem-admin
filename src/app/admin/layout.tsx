"use client";

import { useSidebar, useSidebarHover } from "@/context/SidebarContext";
import { AuthContext } from "@/context/authContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { useRouter } from "next/navigation";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import React, { useContext, useEffect } from "react";

function AdminMainArea({ children }: { children: React.ReactNode }) {
  const { isExpanded, isMobileOpen } = useSidebar();
  const { isHovered } = useSidebarHover();

  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[290px]"
    : "lg:ml-[90px]";

  return (
    <div
      className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}
    >
      <AppHeader />
      <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">{children}</div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoggedIn, isReady, user, logOut } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (!isReady) return;

    // 1. Si no hay sesión iniciada, redirigir al login
    if (!isLoggedIn || !user) {
      router.replace("/signin");
      return;
    }

    // 2. Si el usuario no es ni Administrador ni Vendedor, rechazar acceso
    if (user.userType !== "admin" && user.userType !== "seller") {
      logOut();
      router.replace("/signin");
    }
  }, [isReady, isLoggedIn, user, router, logOut]);

  // Pantalla de carga mientras se verifica la sesión en localStorage/Firebase
  if (!isReady || !isLoggedIn || !user || (user.userType !== "admin" && user.userType !== "seller")) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-600 border-t-transparent" />
          <p className="text-xs text-gray-500">Verificando credenciales de acceso...</p>
        </div>
      </div>
    );
  }

  return (
    <NotificationProvider>
      <div className="min-h-screen xl:flex">
        {/* Sidebar and Backdrop */}
        <AppSidebar />
        <Backdrop />
        {/* Main Content Area isolated from hover state */}
        <AdminMainArea>{children}</AdminMainArea>
      </div>
    </NotificationProvider>
  );
}
