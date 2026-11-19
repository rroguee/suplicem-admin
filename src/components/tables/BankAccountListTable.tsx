'use client';

import React, { useState, useContext } from 'react';
import { AuthContext } from '@/context/authContext';
import Button from '@/components/ui/button/Button';
import Pagination from './Pagination';
import { PlusIcon } from '@/icons';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import CustomAlert from '../CustomAlert';
import { BankAccountFormModal } from './bank-accounts/BankAccountFormModal';
import { BankAccountRow } from './bank-accounts/BankAccountRow';
import { useBankAccounts } from './bank-accounts/useBankAccounts';

const ITEMS_PER_PAGE = 5;

const BankAccountListTable = () => {
  const { user: authUser } = useContext(AuthContext);
  const isSeller = authUser?.userType === 'seller';
  const [currentPage, setCurrentPage] = useState(1);

  const {
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
  } = useBankAccounts();

  const totalPages = Math.ceil(accounts.length / ITEMS_PER_PAGE);
  const paginatedAccounts = accounts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-6">
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
      {!isSeller && (
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
      )}

      {/* Create / Edit Modal */}
      <BankAccountFormModal
        isOpen={isOpen}
        isEditing={!!editingId}
        isSaving={isSaving}
        formData={formData}
        onClose={closeModal}
        onChange={handleChange}
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
      />

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
                  {!isSeller && (
                    <TableCell isHeader className="px-5 py-3 text-start text-theme-xs text-gray-500 dark:text-gray-400 font-medium">
                      Acciones
                    </TableCell>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {loading ? (
                  <TableRow>
                    <td colSpan={isSeller ? 5 : 6} className="px-5 py-8 text-center text-gray-400 text-sm">
                      Cargando cuentas bancarias...
                    </td>
                  </TableRow>
                ) : paginatedAccounts.length === 0 ? (
                  <TableRow>
                    <td colSpan={isSeller ? 5 : 6} className="px-5 py-8 text-center text-gray-400 text-sm">
                      No hay cuentas bancarias registradas.
                    </td>
                  </TableRow>
                ) : (
                  paginatedAccounts.map((account) => (
                    <BankAccountRow
                      key={account.id}
                      account={account}
                      isSeller={isSeller}
                      onEdit={handleOpenEdit}
                      onDelete={handleRequestDelete}
                    />
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
