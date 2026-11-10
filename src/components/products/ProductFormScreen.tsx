"use client";

import React from "react";
import Link from "next/link";
import { parseFormattedNumber } from "@/utils/productLotUtils";
import { useProductForm } from "@/hooks/useProductForm";
import { ProductGeneralInfoCard } from "./ProductGeneralInfoCard";
import { ProductImageUploadCard } from "./ProductImageUploadCard";
import { LotPricingSection } from "./LotPricingSection";

interface Props {
  productId?: string | null;
}

export const ProductFormScreen: React.FC<Props> = ({ productId = null }) => {
  const {
    isEditing,
    name,
    setName,
    unit,
    setUnit,
    weightKg,
    setWeightKg,
    price,
    setPrice,
    imageUrl,
    setImageUrl,
    imageFile,
    setImageFile,
    manualLotPrices,
    setManualLotPrices,
    loading,
    handleSave,
    cancel,
  } = useProductForm(productId);

  const numericBasePrice = parseFormattedNumber(price);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
            <Link href="/admin/products" className="hover:text-orange-600 transition">
              Productos
            </Link>
            <span>/</span>
            <span className="text-gray-700 font-medium">
              {isEditing ? "Editar" : "Nuevo"}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            {isEditing ? "Editar Producto" : "Nuevo Producto"}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={cancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleSave}
            className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-semibold shadow-sm transition disabled:opacity-50"
          >
            {loading ? "Guardando..." : isEditing ? "Actualizar" : "Guardar Producto"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 space-y-6">
          <ProductGeneralInfoCard
            name={name}
            onChangeName={setName}
            price={price}
            onChangePrice={setPrice}
            unit={unit}
            onChangeUnit={setUnit}
            weightKg={weightKg}
            onChangeWeightKg={setWeightKg}
          />
          <ProductImageUploadCard
            imageUrl={imageUrl}
            imageFile={imageFile}
            onFileSelect={setImageFile}
            onRemoveImage={() => {
              setImageFile(undefined);
              setImageUrl("");
            }}
          />
        </div>

        <div className="lg:col-span-7">
          <LotPricingSection
            basePrice={numericBasePrice}
            manualLotPrices={manualLotPrices}
            onUpdateManualLotPrices={setManualLotPrices}
          />
        </div>
      </div>
    </div>
  );
};
