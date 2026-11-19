'use client';

import { useState, useEffect } from 'react';
import { useModal } from '@/hooks/useModal';
import { useCustomAlert } from '@/hooks/useCustomAlert';
import {
  getBankAccounts,
  createBankAccount,
  updateBankAccount,
  deleteBankAccount,
  BankAccount,
  CreateBankAccountPayload,
} from '@/services/bankAccountsService';

const emptyForm: CreateBankAccountPayload = {
  bankName: '',
  accountHolder: '',
  accountNumber: '',
  accountType: 'savings',
  currency: 'USD',
  routingNumber: '',
  swiftCode: '',
};

export const useBankAccounts = () => {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<CreateBankAccountPayload>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { isOpen, openModal, closeModal } = useModal();
  const { alertConfig, showAlert, closeAlert } = useCustomAlert();

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const data = await getBankAccounts();
      setAccounts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('[fetchAccounts] Error:', error);
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData(emptyForm);
    openModal();
  };

  const handleOpenEdit = (account: BankAccount) => {
    setEditingId(account.id);
    setFormData({
      bankName: account.bankName,
      accountHolder: account.accountHolder,
      accountNumber: account.accountNumber,
      accountType: account.accountType,
      currency: account.currency,
      routingNumber: account.routingNumber || '',
      swiftCode: account.swiftCode || '',
    });
    openModal();
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!formData.bankName || !formData.accountHolder || !formData.accountNumber) {
      showAlert({
        type: 'error',
        title: 'Campos requeridos',
        message: 'Por favor completa el nombre del banco, titular y número de cuenta.',
      });
      return;
    }

    setIsSaving(true);
    try {
      if (editingId) {
        const updated = await updateBankAccount(editingId, formData);
        setAccounts((prev) =>
          prev.map((a) => (a.id === editingId ? { ...a, ...updated } : a))
        );
        showAlert({
          type: 'success',
          title: 'Cuenta actualizada',
          message: 'La cuenta bancaria fue actualizada exitosamente.',
        });
      } else {
        const created = await createBankAccount(formData);
        setAccounts((prev) => [created, ...prev]);
        showAlert({
          type: 'success',
          title: 'Cuenta creada',
          message: 'La cuenta bancaria fue creada exitosamente.',
        });
      }
      closeModal();
    } catch (error) {
      console.error('[handleSave] Error:', error);
      showAlert({
        type: 'error',
        title: 'Error',
        message: 'Ocurrió un error al guardar la cuenta bancaria.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRequestDelete = (account: BankAccount) => {
    showAlert({
      type: 'warning',
      title: '¿Eliminar cuenta bancaria?',
      message: `¿Estás seguro de que deseas eliminar la cuenta de ${account.bankName} (${account.accountNumber})? Esta acción no se puede deshacer.`,
      onConfirm: async () => {
        try {
          await deleteBankAccount(account.id);
          setAccounts((prev) => prev.filter((a) => a.id !== account.id));
          closeAlert();
        } catch (error) {
          console.error('[handleDelete] Error:', error);
          showAlert({
            type: 'error',
            title: 'Error',
            message: 'No se pudo eliminar la cuenta bancaria. Intenta de nuevo.',
          });
        }
      },
      onCancel: () => closeAlert(),
    });
  };

  return {
    accounts,
    loading,
    formData,
    editingId,
    isSaving,
    isOpen,
    alertConfig,
    closeAlert,
    closeModal,
    handleOpenCreate,
    handleOpenEdit,
    handleChange,
    handleSave,
    handleRequestDelete,
  };
};
