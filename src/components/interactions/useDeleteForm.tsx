import { useState } from 'react';

type UseConfirmDeleteProps<T> = {
  items: T[];
  setItems: React.Dispatch<React.SetStateAction<T[]>>;
  getId?: (item: T) => number | string;
  onDelete?: (item: T) => Promise<void> | void;
};

export function useConfirmDelete<T>({
  items,
  setItems,
  getId = (item) => (item as any).id,
  onDelete,
}: UseConfirmDeleteProps<T>) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<T | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const requestDelete = (item: T) => {
    setItemToDelete(item);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    setIsDeleting(true);

    try {
      if (onDelete) {
        await onDelete(itemToDelete);
      }

      const id = getId(itemToDelete);
      setItems((prev) => prev.filter((i) => getId(i) !== id));
    } catch (error) {
      console.error('Error eliminando el item:', error);
    } finally {
      setIsDeleting(false);
      setIsConfirmOpen(false);
      setItemToDelete(null);
    }
  };

  const cancelDelete = () => {
    setIsConfirmOpen(false);
    setItemToDelete(null);
  };

  return {
    isConfirmOpen,
    itemToDelete,
    requestDelete,
    confirmDelete,
    cancelDelete,
    isDeleting,
  };
}
