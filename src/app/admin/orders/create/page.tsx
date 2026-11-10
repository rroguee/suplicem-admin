import type { Metadata } from "next";
import React, { Suspense } from "react";
import { CreateAssistedOrderView } from "@/components/orders/CreateAssistedOrderView";

export const metadata: Metadata = {
  title: "Nuevo Pedido Asistido | Suplicem Admin",
  description: "Emisión de pedidos comerciales y administrativos asistidos",
};

export default function CreateAssistedOrderPage() {
  return (
    <Suspense fallback={<div className="p-6 text-xs text-gray-500">Cargando formulario de pedido...</div>}>
      <CreateAssistedOrderView />
    </Suspense>
  );
}
