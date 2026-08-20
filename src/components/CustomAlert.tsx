import React from 'react';
// Importa tu componente Modal
import { Modal } from './ui/modal';

interface CustomAlertProps {
  isOpen: boolean;
  type: 'success' | 'error' | 'confirm' | 'info';
  title: string;
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  onClose: () => void; // Para cerrar la alerta (ej. después de un mensaje de éxito/error)
  confirmText?: string;
  cancelText?: string;
}

const CustomAlert: React.FC<CustomAlertProps> = ({
  isOpen,
  type,
  title,
  message,
  onConfirm,
  onCancel,
  onClose,
  confirmText = 'Aceptar',
  cancelText = 'Cancelar',
}) => {
  // Define colores y iconos basados en el tipo de alerta
  let bgColor = 'bg-blue-500';
  let textColor = 'text-blue-800';
  let icon = 'ℹ️'; // Icono por defecto

  switch (type) {
    case 'success':
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      icon = '✅';
      break;
    case 'error':
      bgColor = 'bg-red-100';
      textColor = 'text-red-800';
      icon = '❌';
      break;
    case 'confirm':
      bgColor = 'bg-yellow-100';
      textColor = 'text-yellow-800';
      icon = '⚠️';
      break;
    case 'info':
    default:
      bgColor = 'bg-blue-100';
      textColor = 'text-blue-800';
      icon = 'ℹ️';
      break;
  }

  return (
   
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-xs" showCloseButton={false}> 
      <div className={`relative ${bgColor} p-6 rounded-lg shadow-xl w-full border border-gray-200 dark:border-gray-700`}>
        <div className="flex items-center mb-4">
          <span className="text-2xl mr-3">{icon}</span>
          <h3 className={`text-lg font-bold ${textColor}`}>{title}</h3>
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-6">{message}</p>

        <div className="flex justify-end gap-3">
          {type === 'confirm' && (
            <button
              className="px-4 py-2 text-sm font-semibold rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              onClick={() => {
                onCancel && onCancel();
                onClose();
              }}
            >
              {cancelText}
            </button>
          )}
          <button
            className={`px-4 py-2 text-sm font-semibold rounded-md ${
              type === 'error' ? 'bg-red-600 hover:bg-red-700' : 
              type === 'success' ? 'bg-green-600 hover:bg-green-700' : 
              'bg-blue-600 hover:bg-blue-700'
            } text-white transition-colors`}
            onClick={() => {
              onConfirm && onConfirm();
              if (type !== 'confirm') {
                onClose();
              }
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default CustomAlert;
