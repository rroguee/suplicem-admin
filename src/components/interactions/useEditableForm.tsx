import { useState } from 'react';

export interface FormData {
  [key: string]: string | number;
}

export function useEditableForm<T extends { id: number }>(
  initialData: T[],
  setData: React.Dispatch<React.SetStateAction<T[]>>,
  onCloseModal?: () => void
) {
  const [formData, setFormData] = useState<FormData>({});
  const [editingId, setEditingId] = useState<number | null>(null);

  const startEdit = (id: number) => {
    const item = initialData.find((d) => d.id === id);
    if (item) {
      setEditingId(id);
      setFormData({ ...item });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const save = () => {
    if (
      'name' in formData || // Validación mínima
      'nombre' in formData
    ) {
      const updated = editingId
        ? initialData.map((item) =>
            item.id === editingId ? { ...item, ...formData } : item
          )
        : [...initialData, { ...formData, id: initialData.length + 1 } as T];

      setData(updated);
      clear();
      onCloseModal?.();
    }
  };

  const clear = () => {
    setFormData({});
    setEditingId(null);
  };

  return {
    formData,
    handleChange,
    startEdit,
    save,
    clear,
    editingId,
  };
}
