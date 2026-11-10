"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SellerProfileScreen } from "@/components/seller/SellerProfileScreen";

function SellerProfileContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  return <SellerProfileScreen sellerId={id} />;
}

export default function SellerProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[300px] items-center justify-center p-8 text-center text-sm text-gray-500">
          Cargando perfil del vendedor...
        </div>
      }
    >
      <SellerProfileContent />
    </Suspense>
  );
}
