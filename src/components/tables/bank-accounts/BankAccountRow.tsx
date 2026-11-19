'use client';

import React from 'react';
import Button from '@/components/ui/button/Button';
import { TableCell, TableRow } from '@/components/ui/table';
import { PencilIcon, TrashBinIcon } from '@/icons';
import { BankAccount } from '@/services/bankAccountsService';

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  savings: 'Ahorros',
  checking: 'Corriente',
  current: 'Cuenta Corriente',
};

interface Props {
  account: BankAccount;
  isSeller: boolean;
  onEdit: (account: BankAccount) => void;
  onDelete: (account: BankAccount) => void;
}

export const BankAccountRow: React.FC<Props> = ({
  account,
  isSeller,
  onEdit,
  onDelete,
}) => {
  return (
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
      {!isSeller && (
        <TableCell className="px-5 py-4 text-start">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              startIcon={<PencilIcon />}
              onClick={() => onEdit(account)}
            >
              Editar
            </Button>
            <Button
              size="sm"
              variant="outline"
              startIcon={<TrashBinIcon />}
              onClick={() => onDelete(account)}
            >
              Eliminar
            </Button>
          </div>
        </TableCell>
      )}
    </TableRow>
  );
};
