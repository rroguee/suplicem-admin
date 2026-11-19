'use client';

import React from 'react';
import { Modal } from '@/components/ui/modal';
import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import Button from '@/components/ui/button/Button';
import { CreateBankAccountPayload } from '@/services/bankAccountsService';

interface Props {
  isOpen: boolean;
  isEditing: boolean;
  isSaving: boolean;
  formData: CreateBankAccountPayload;
  onClose: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const BankAccountFormModal: React.FC<Props> = ({
  isOpen,
  isEditing,
  isSaving,
  formData,
  onClose,
  onChange,
  onSubmit,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[550px] p-5 lg:p-7"
    >
      <h4 className="font-semibold text-gray-800 text-title-sm dark:text-white/90 mb-6">
        {isEditing ? 'Editar Cuenta Bancaria' : 'Nueva Cuenta Bancaria'}
      </h4>

      <form onSubmit={onSubmit}>
        <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          <div className="col-span-1 sm:col-span-2">
            <Label>Nombre del Banco *</Label>
            <Input
              type="text"
              name="bankName"
              placeholder="Ej. Banco Santander"
              value={formData.bankName}
              onChange={onChange}
            />
          </div>

          <div className="col-span-1">
            <Label>Titular de la cuenta *</Label>
            <Input
              type="text"
              name="accountHolder"
              placeholder="Nombre del titular"
              value={formData.accountHolder}
              onChange={onChange}
            />
          </div>

          <div className="col-span-1">
            <Label>Número de cuenta *</Label>
            <Input
              type="text"
              name="accountNumber"
              placeholder="Ej. 0001234567890"
              value={formData.accountNumber}
              onChange={onChange}
            />
          </div>

          <div className="col-span-1">
            <Label>Tipo de cuenta *</Label>
            <select
              name="accountType"
              value={formData.accountType}
              onChange={onChange}
              className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs outline-none transition focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
            >
              <option value="savings">Ahorros</option>
              <option value="checking">Corriente</option>
              <option value="current">Cuenta Corriente</option>
            </select>
          </div>

          <div className="col-span-1">
            <Label>Moneda</Label>
            <Input
              type="text"
              name="currency"
              placeholder="Ej. USD, COP, VES"
              value={formData.currency}
              onChange={onChange}
            />
          </div>

          <div className="col-span-1">
            <Label>Número de enrutamiento</Label>
            <Input
              type="text"
              name="routingNumber"
              placeholder="Opcional"
              value={formData.routingNumber || ''}
              onChange={onChange}
            />
          </div>

          <div className="col-span-1 sm:col-span-2">
            <Label>Código SWIFT / BIC</Label>
            <Input
              type="text"
              name="swiftCode"
              placeholder="Opcional"
              value={formData.swiftCode || ''}
              onChange={onChange}
            />
          </div>
        </div>

        <div className="flex items-center justify-end w-full gap-3 mt-6">
          <Button size="sm" variant="outline" onClick={onClose} type="button">
            Cancelar
          </Button>
          <Button size="sm" type="submit" disabled={isSaving}>
            {isSaving ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
