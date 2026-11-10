import protectedApi from "./protectedApi";

export const createProduct = async (product: {
  name: string;
  price: number;
  lotSize?: number;
  lotPrice?: number;
  lotPrices?: Record<string, number>;
  manualLotPrices?: Record<string, number>;
  imageUrl?: string;
  imageFile?: File;
  unit: string;
  weightKg?: number;
}) => {
  if (product.imageFile) {
    const formData = new FormData();
    formData.append("image", product.imageFile);
    formData.append("name", product.name);
    formData.append("price", product.price.toString());
    formData.append("unit", product.unit);
    if (product.weightKg !== undefined && product.weightKg !== null) {
      formData.append("weightKg", product.weightKg.toString());
    }
    if (product.manualLotPrices) {
      formData.append("manualLotPrices", JSON.stringify(product.manualLotPrices));
    }
    const response = await protectedApi.post("/products", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  }
  const response = await protectedApi.post("/products", product);
  return response.data;
};

export const getProducts = async () => {
  const response = await protectedApi.get("/products");
  return response.data;
};

export const updateProduct = async (
  id: string | number,
  product: Partial<{
    name: string;
    price: number;
    lotSize?: number;
    lotPrice?: number;
    lotPrices?: Record<string, number>;
    manualLotPrices?: Record<string, number>;
    imageUrl?: string;
    imageFile?: File;
    unit: string;
    weightKg?: number;
  }>
) => {
  if (product.imageFile) {
    const formData = new FormData();
    formData.append("image", product.imageFile);
    if (product.name) formData.append("name", product.name);
    if (product.price !== undefined) formData.append("price", product.price.toString());
    if (product.unit) formData.append("unit", product.unit);
    if (product.weightKg !== undefined && product.weightKg !== null) {
      formData.append("weightKg", product.weightKg.toString());
    }
    if (product.manualLotPrices) {
      formData.append("manualLotPrices", JSON.stringify(product.manualLotPrices));
    }
    const response = await protectedApi.put(`/products/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  }
  const response = await protectedApi.put(`/products/${id}`, product);
  return response.data;
};

export const deleteProduct = async (id: string | number) => {
  const response = await protectedApi.delete(`/products/${id}`);
  return response.data;
};
