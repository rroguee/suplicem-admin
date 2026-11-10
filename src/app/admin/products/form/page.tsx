"use client";

import React, { Suspense, useContext, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AuthContext } from "@/context/authContext";
import { ProductFormScreen } from "@/components/products/ProductFormScreen";

function ProductFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const id = searchParams.get("id") || undefined;

  useEffect(() => {
    // 🛡️ Si quien intenta entrar al formulario es un vendedor, redirigir al catálogo de solo lectura
    if (user?.userType === "seller") {
      router.replace("/admin/products");
    }
  }, [user, router]);

  if (user?.userType === "seller") {
    return null;
  }

  return <ProductFormScreen productId={id} />;
}

export default function ProductFormPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Cargando formulario...</div>}>
      <ProductFormContent />
    </Suspense>
  );
}
