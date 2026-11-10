'use client';

import React from 'react';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';

interface OrderRejectModalProps {
  isOpen: boolean;
  orderNumber: number | string;
  reason: string;
  onReasonChange: (reason: string) => void;
  onConfirm: () => void;
  onClose: () => void;
  loading: boolean;
}

export const OrderRejectModal: React.FC<OrderRejectModalProps> = ({
  isOpen,
  orderNumber,
  reason,
  onReasonChange,
  onConfirm,
  onClose,
  loading,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-xs">
      <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg">
        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">
          Rechazar Orden #{orderNumber}
        </h2>
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
          Por favor, especifica el motivo por el cual esta orden no puede ser procesada:
        </p>
        <textarea
          className="w-full p-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-xs bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 mb-3"
          rows={3}
          placeholder="Motivo de rechazo (mínimo 5 caracteres)"
          value={reason}
          onChange={(e) => onReasonChange(e.target.value)}
          required
        />
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={reason.trim().length < 5 || loading}
            className="px-3 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-lg shadow-xs transition-all"
          >
            Confirmar Rechazo
          </button>
        </div>
      </div>
    </Modal>
  );
};
