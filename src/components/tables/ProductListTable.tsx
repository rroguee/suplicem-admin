"use client";

import React, { useState, useEffect, useCallback, useContext } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/authContext";
import Button from "@/components/ui/button/Button";
import Pagination from "./Pagination";
import { PlusIcon, PencilIcon, TrashBinIcon } from "@/icons";
import { Package } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Modal } from "@/components/ui/modal";
import { useConfirmDelete } from "../interactions/useDeleteForm";
import { formatCurrency } from "../interactions/formatCurrency";
import { getProducts } from "@/services/prodcutsService";

interface Product {
  id: string | number;
  name: string;
  unit: string;
  price: number | string;
  lotSize?: number;
  lotPrice?: number;
  lotPrices?: Record<string, number>;
  image?: string;
  imageUrl?: string;
}

const ProductListTable = () => {
  const router = useRouter();
  const { user: authUser } = useContext(AuthContext);
  const isSeller = authUser?.userType === "seller";

  const [products, setProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 1;

  const fetchProducts = useCallback(async () => {
    try {
      const productsResponse = await getProducts();
      setProducts(productsResponse?.products || []);
    } catch (error) {
      console.error("[fetchProducts] Error al obtener productos:", error);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const {
    isConfirmOpen,
    requestDelete,
    confirmDelete,
    cancelDelete,
  } = useConfirmDelete<Product>({ items: products, setItems: setProducts });

  return (
    <div className="space-y-4">
      {!isSeller && (
        <div className="flex justify-end">
          <Button
            size="md"
            variant="primary"
            startIcon={<PlusIcon />}
            onClick={() => router.push("/admin/products/form")}
          >
            Nuevo Producto
          </Button>
        </div>
      )}

      <Modal
        isOpen={isConfirmOpen}
        onClose={cancelDelete}
        className="max-w-md p-4"
      >
        <div>
          <h4 className="text-lg font-semibold mb-4">¿Eliminar producto?</h4>
          <p className="mb-6 text-sm text-gray-600 dark:text-gray-300">
            Esta acción no se puede deshacer.
          </p>
          <div className="flex justify-end gap-3">
            <Button size="sm" variant="outline" onClick={cancelDelete}>
              Cancelar
            </Button>
            <Button size="sm" variant="outline" onClick={confirmDelete}>
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[768px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs text-gray-500 font-medium">
                    Nombre
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs text-gray-500 font-medium">
                    Unidad
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs text-gray-500 font-medium">
                    Precio Unitario
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs text-gray-500 font-medium">
                    Acciones
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {products.map((product) => {
                  const unitPrice = Number(product.price) || 0;
                  return (
                    <TableRow key={product.id}>
                      <TableCell className="px-5 py-4 text-start">
                        <div className="flex items-center gap-3.5">
                          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50 p-1 flex items-center justify-center dark:border-gray-800 dark:bg-gray-800/50">
                            {product.imageUrl || product.image ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img
                                src={product.imageUrl || product.image}
                                alt={product.name}
                                className="h-full w-full object-contain"
                              />
                            ) : (
                              <Package className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <span className="block text-theme-sm font-semibold text-gray-800 dark:text-white/90">
                              {product.name}
                            </span>
                            <span className="text-[11px] text-gray-400">ID: {String(product.id).slice(0, 6)}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500">
                        <span className="font-medium text-gray-700 dark:text-gray-300">{product.unit}</span>
                        {(product as any).weightKg ? (
                          <span className="block text-xs text-gray-400">{(product as any).weightKg} kg/u</span>
                        ) : null}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500">
                        {formatCurrency(unitPrice)}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        {isSeller ? (
                          <span className="text-xs text-gray-400">Solo lectura</span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              startIcon={<PencilIcon />}
                              onClick={() => router.push(`/admin/products/form?id=${product.id}`)}
                            >
                              Editar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              startIcon={<TrashBinIcon />}
                              onClick={() => requestDelete(product)}
                            >
                              Eliminar
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>
    </div>
  );
};

export default ProductListTable;
