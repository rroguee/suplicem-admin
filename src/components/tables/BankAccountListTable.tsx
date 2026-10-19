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
import { useModal } from '@/hooks/useModal';
import CustomAlert from '../CustomAlert';
import {
  getBankAccounts,
  createBankAccount,
  updateBankAccount,
  deleteBankAccount,
  BankAccount,
  CreateBankAccountPayload,
} from '@/services/bankAccountsService';

interface AlertConfig {
  isOpen: boolean;
  type: 'success' | 'error' | 'confirm' | 'info';
  title: string;
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

const ITEMS_PER_PAGE = 5;

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  savings: 'Ahorros',
  checking: 'Corriente',
  current: 'Cuenta Corriente',
};

const emptyForm: CreateBankAccountPayload = {
  bankName: '',
  accountHolder: '',
  accountNumber: '',
  accountType: 'savings',
  currency: 'USD',
  routingNumber: '',
  swiftCode: '',
};

const BankAccountListTable = () => {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState<CreateBankAccountPayload>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { isOpen, openModal, closeModal } = useModal();

  const [alertConfig, setAlertConfig] = useState<AlertConfig>({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
  });

  const showAlert = (config: Omit<AlertConfig, 'isOpen'>) => {
    setAlertConfig({ ...config, isOpen: true });
  };

  const closeAlert = () => {
    setAlertConfig((prev) => ({ ...prev, isOpen: false }));
  };

  const totalPages = Math.ceil(accounts.length / ITEMS_PER_PAGE);
  const paginatedAccounts = accounts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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
      type: 'confirm',
      title: '¿Eliminar cuenta?',
      message: `¿Estás seguro de que deseas eliminar la cuenta de ${account.bankName}? Esta acción no se puede deshacer.`,
      onConfirm: () => handleConfirmDelete(account.id),
      onCancel: closeAlert,
    });
  };

  const handleConfirmDelete = async (id: string) => {
    closeAlert();
    try {
      await deleteBankAccount(id);
      setAccounts((prev) => prev.filter((a) => a.id !== id));
      showAlert({
        type: 'success',
        title: 'Cuenta eliminada',
        message: 'La cuenta bancaria fue eliminada exitosamente.',
      });
    } catch (error) {
      console.error('[handleConfirmDelete] Error:', error);
      showAlert({
        type: 'error',
        title: 'Error',
        message: 'No se pudo eliminar la cuenta bancaria.',
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Alert */}
      <CustomAlert
        isOpen={alertConfig.isOpen}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={closeAlert}
        onConfirm={alertConfig.onConfirm}
        onCancel={alertConfig.onCancel}
      />

      {/* Header */}
      <div className="flex justify-end">
        <Button
          size="md"
          variant="primary"
          startIcon={<PlusIcon />}
          onClick={handleOpenCreate}
        >
          Nueva Cuenta Bancaria
        </Button>
      </div>

      {/* Create / Edit Modal */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[600px] p-5 lg:p-10">
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          <h4 className="mb-6 text-lg font-medium text-gray-800 dark:text-white/90">
            {editingId ? 'Editar Cuenta Bancaria' : 'Nueva Cuenta Bancaria'}
          </h4>

          <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
            {/* Banco */}
            <div className="col-span-1">
              <Label>Banco *</Label>
              <Input
                type="text"
                name="bankName"
                placeholder="Ej. Banco Nacional"
                value={formData.bankName}
                onChange={handleChange}
              />
            </div>

            {/* Titular */}
            <div className="col-span-1">
              <Label>Titular de la cuenta *</Label>
              <Input
                type="text"
                name="accountHolder"
                placeholder="Nombre del titular"
                value={formData.accountHolder}
                onChange={handleChange}
              />
            </div>

            {/* Número de cuenta */}
            <div className="col-span-1">
              <Label>Número de cuenta *</Label>
              <Input
                type="text"
                name="accountNumber"
                placeholder="Ej. 0001234567890"
                value={formData.accountNumber}
                onChange={handleChange}
              />
            </div>

            {/* Tipo de cuenta */}
            <div className="col-span-1">
              <Label>Tipo de cuenta *</Label>
              <select
                name="accountType"
                value={formData.accountType}
                onChange={handleChange}
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs outline-none transition focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
              >
                <option value="savings">Ahorros</option>
                <option value="checking">Corriente</option>
                <option value="current">Cuenta Corriente</option>
              </select>
            </div>

            {/* Moneda */}
            <div className="col-span-1">
              <Label>Moneda</Label>
              <Input
                type="text"
                name="currency"
                placeholder="Ej. USD, COP, VES"
                value={formData.currency}
                onChange={handleChange}
              />
            </div>

            {/* Routing Number */}
            <div className="col-span-1">
              <Label>Número de enrutamiento</Label>
              <Input
                type="text"
                name="routingNumber"
                placeholder="Opcional"
                value={formData.routingNumber || ''}
                onChange={handleChange}
              />
            </div>

            {/* SWIFT */}
            <div className="col-span-1 sm:col-span-2">
              <Label>Código SWIFT / BIC</Label>
              <Input
                type="text"
                name="swiftCode"
                placeholder="Opcional"
                value={formData.swiftCode || ''}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="flex items-center justify-end w-full gap-3 mt-6">
            <Button size="sm" variant="outline" onClick={closeModal} type="button">
              Cancelar
            </Button>
            <Button size="sm" type="submit" disabled={isSaving}>
              {isSaving ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[800px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs text-gray-500 dark:text-gray-400 font-medium">
                    Banco
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs text-gray-500 dark:text-gray-400 font-medium">
                    Titular
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs text-gray-500 dark:text-gray-400 font-medium">
                    Número de cuenta
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs text-gray-500 dark:text-gray-400 font-medium">
                    Tipo
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs text-gray-500 dark:text-gray-400 font-medium">
                    Moneda
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs text-gray-500 dark:text-gray-400 font-medium">
                    Estado
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs text-gray-500 dark:text-gray-400 font-medium">
                    Acciones
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {loading ? (
                  <TableRow>
                    <td colSpan={7} className="px-5 py-8 text-center text-gray-400 text-sm">
                      Cargando cuentas bancarias...
                    </td>
                  </TableRow>
                ) : paginatedAccounts.length === 0 ? (
                  <TableRow>
                    <td colSpan={7} className="px-5 py-8 text-center text-gray-400 text-sm">
                      No hay cuentas bancarias registradas.
                    </td>
                  </TableRow>
                ) : (
                  paginatedAccounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell className="px-5 py-4 text-start">
                        <span className="block text-theme-sm font-medium text-gray-800 dark:text-white/90">
                          {account.bankName}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                        {account.accountHolder}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400 font-mono">
                        {account.accountNumber}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                        {ACCOUNT_TYPE_LABELS[account.accountType] ?? account.accountType}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                        {account.currency}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-start">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            account.isActive
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                          }`}
                        >
                          {account.isActive ? 'Activa' : 'Inactiva'}
                        </span>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            startIcon={<PencilIcon />}
                            onClick={() => handleOpenEdit(account)}
                          >
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            startIcon={<TrashBinIcon />}
                            onClick={() => handleRequestDelete(account)}
                          >
                            Eliminar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex justify-end pt-4">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages || 1}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>
    </div>
  );
};

export default BankAccountListTable;
