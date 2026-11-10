import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getProducts, createProduct, updateProduct } from "@/services/prodcutsService";
import { parseFormattedNumber, formatNumberInput } from "@/utils/productLotUtils";

export const useProductForm = (productId: string | null) => {
  const router = useRouter();
  const isEditing = Boolean(productId);

  const [name, setName] = useState("");
  const [unit, setUnit] = useState("fundas");
  const [weightKg, setWeightKg] = useState("42.5");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | undefined>(undefined);
  const [manualLotPrices, setManualLotPrices] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (productId) {
      getProducts().then((res: any) => {
        const prod = (res.products || []).find((p: any) => String(p.id) === String(productId));
        if (prod) {
          setName(prod.name || "");
          setUnit(prod.unit || "fundas");
          setWeightKg(prod.weightKg !== undefined ? String(prod.weightKg) : "42.5");
          const basePriceNum = Number(prod.price) || 0;
          setPrice(prod.price ? formatNumberInput(prod.price) : "");
          setImageUrl(prod.imageUrl || prod.image || "");

          const realManualLots: Record<string, number> = {};
          if (prod.manualLotPrices) {
            for (const [key, val] of Object.entries(prod.manualLotPrices)) {
              const lotCount = Number(key);
              const customVal = Number(val);
              const propVal = basePriceNum * lotCount;
              if (Math.abs(customVal - propVal) > 0.01) {
                realManualLots[key] = customVal;
              }
            }
          }
          setManualLotPrices(realManualLots);
        }
      });
    }
  }, [productId]);

  const handleSave = async () => {
    const numPrice = parseFormattedNumber(price);
    if (!name.trim() || numPrice <= 0) {
      alert("Por favor ingresa un nombre y precio base válidos.");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name: name.trim(),
        unit: unit.trim() || "fundas",
        weightKg: parseFloat(weightKg) || 42.5,
        price: numPrice,
        manualLotPrices,
        imageUrl,
        imageFile,
      };

      if (isEditing && productId) {
        await updateProduct(productId, payload);
      } else {
        await createProduct(payload);
      }
      router.push("/admin/products");
    } catch (e: any) {
      alert("Error al guardar: " + (e.message || "Error desconocido"));
    } finally {
      setLoading(false);
    }
  };

  return {
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
    cancel: () => router.push("/admin/products"),
  };
};
