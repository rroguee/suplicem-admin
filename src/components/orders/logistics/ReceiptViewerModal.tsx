'use client';

import React from 'react';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';

interface ReceiptViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl?: string | null;
  orderNumber?: number | string;
}

export const ReceiptViewerModal: React.FC<ReceiptViewerModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  orderNumber,
}) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-3xl">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl">
        <div className="flex justify-between items-center mb-4 border-b pb-3 pr-10 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Comprobante de Pago — Orden #{orderNumber || 'N/A'}
          </h3>
        </div>

        <div className="flex flex-col items-center justify-center min-h-[300px] max-h-[70vh] overflow-auto bg-gray-50 dark:bg-gray-900 rounded-lg p-2">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Comprobante de pago"
              className="max-h-[65vh] max-w-full object-contain rounded shadow"
            />
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No hay imagen de comprobante adjunta.</p>
          )}
        </div>

        <div className="mt-4 flex justify-between items-center">
          {imageUrl && (
            <a
              href={imageUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Abrir imagen en pestaña nueva ↗
            </a>
          )}
          <Button variant="outline" size="sm" onClick={onClose} className="ml-auto">
            Cerrar
          </Button>
        </div>
      </div>
    </Modal>
  );
};
