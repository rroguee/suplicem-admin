'use client';

import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/button/Button';
import Pagination from './Pagination';
import { PlusIcon, PencilIcon, TrashBinIcon } from '@/icons';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Modal } from '@/components/ui/modal';
import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import FileInput from '@/components/form/input/FileInput';
import { useModal } from '@/hooks/useModal';
import { useConfirmDelete } from '../interactions/useDeleteForm';
import { formatCurrency } from '../interactions/formatCurrency';
import { getProducts, createProduct } from '@/services/prodcutsService';


interface Product {
  id: number;
  name: string;
  unit: string;
  price: string;
  image: string;
}

const ProductListTable = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    imageUrl: '',
    unit: '',
  });

  const totalPages = 1;
  const { isOpen, openModal, closeModal } = useModal();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsResponse = await getProducts();
        setProducts(productsResponse?.products || []);
        console.log('[fetchProducts] Productos cargados:', productsResponse);
      } catch (error) {
        console.error('[fetchProducts] Error al obtener productos:', error);
      }
    };

    fetchProducts();
  }, []);

  const {
    isConfirmOpen,
    itemToDelete,
    requestDelete,
    confirmDelete,
    cancelDelete,
    isDeleting,
  } = useConfirmDelete<Product>({ items: products, setItems: setProducts });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updated = { ...newProduct, [name]: value };
    console.log('[handleChange] Actualizando campo:', name, 'Valor:', value);
    setNewProduct(updated);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      console.log('[handleFileUpload] Imagen seleccionada:', imageUrl);
      setNewProduct((prev) => ({ ...prev, imageUrl }));
    }
  };

  const handleSave = async () => {
    const { name, price, unit, imageUrl } = newProduct;
  
    const productDataToSend = {
      name,
      price: Number(price),
      unit,
      ...(imageUrl && { imageUrl }), // Solo incluir si existe
    };
  
    console.log('[handleSave] Enviando producto al servicio: ', productDataToSend);
  
    try {
      const response = await createProduct(productDataToSend);
      console.log('[handleSave] Producto creado exitosamente:', response);
      closeModal();
    } catch (error) {
      console.error('[handleSave] Error al crear producto: ', error);
    }
  };
  

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          size="md"
          variant="primary"
          startIcon={<PlusIcon />}
          onClick={openModal}
        >
          Nuevo Producto
        </Button>
      </div>

      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-[584px] p-5 lg:p-10"
      >
        <form>
          <h4 className="mb-6 text-lg font-medium text-gray-800 dark:text-white/90">
            Nuevo Producto
          </h4>
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
            <div className="col-span-1">
              <Label>Nombre</Label>
              <Input
                type="text"
                name="name"
                placeholder="Nombre del producto"
                value={newProduct.name}
                onChange={handleChange}
              />
            </div>
            <div className="col-span-1">
              <Label>Unidad</Label>
              <Input
                type="text"
                name="unit"
                placeholder="Ej. Caja, Paquete"
                value={newProduct.unit}
                onChange={handleChange}
              />
            </div>
            <div className="col-span-1">
              <Label>Precio</Label>
              <Input
                type="text"
                name="price"
                placeholder="$00.00"
                value={newProduct.price}
                onChange={handleChange}
              />
            </div>
            <div className="col-span-1 sm:col-span-2">
              <Label>Imagen del producto</Label>
              <FileInput onChange={handleFileUpload} />
            </div>
          </div>

          <div className="flex items-center justify-end w-full gap-3 mt-6">
            <Button size="sm" variant="outline" onClick={closeModal}>
              Cancelar
            </Button>
            <Button size="sm" onClick={handleSave}>
              Guardar
            </Button>
          </div>
        </form>
      </Modal>

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
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs text-gray-500 dark:text-gray-400 font-medium">
                    Nombre
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs text-gray-500 dark:text-gray-400 font-medium">
                    Unidad
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs text-gray-500 dark:text-gray-400 font-medium">
                    Precio
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs text-gray-500 dark:text-gray-400 font-medium">
                    Acciones
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="px-5 py-4 text-start">
                      <span className="block text-theme-sm font-medium text-gray-800 dark:text-white/90">
                        {product.name}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                      {product.unit}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                      {formatCurrency(Number(product.price))}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          startIcon={<PencilIcon />}
                          onClick={() => console.log('Editar:', product.id)}
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
                    </TableCell>
                  </TableRow>
                ))}
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
