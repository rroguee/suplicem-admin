"use client";

import React from "react";
import { Modal } from "./ui/modal";
import { CheckCircle2, XCircle, AlertTriangle, Info } from "lucide-react";

export type CustomAlertType = "success" | "error" | "confirm" | "warning" | "info";

export interface CustomAlertProps {
  isOpen: boolean;
  type: CustomAlertType;
  title: string;
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  onClose?: () => void;
  confirmText?: string;
  cancelText?: string;
}

export type AlertConfig = CustomAlertProps;

const CustomAlert: React.FC<CustomAlertProps> = ({
  isOpen,
  type,
  title,
  message,
  onConfirm,
  onCancel,
  onClose = () => {},
  confirmText = "Aceptar",
  cancelText = "Cancelar",
}) => {
  const typeConfig = {
    success: {
      icon: <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />,
      bgIcon: "bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800/40",
      btnClass: "bg-emerald-600 hover:bg-emerald-700 text-white",
    },
    error: {
      icon: <XCircle className="h-10 w-10 text-rose-600 dark:text-rose-400" />,
      bgIcon: "bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-800/40",
      btnClass: "bg-rose-600 hover:bg-rose-700 text-white",
    },
    confirm: {
      icon: <AlertTriangle className="h-10 w-10 text-amber-600 dark:text-amber-400" />,
      bgIcon: "bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-800/40",
      btnClass: "bg-brand-500 hover:bg-brand-600 text-white",
    },
    warning: {
      icon: <AlertTriangle className="h-10 w-10 text-amber-600 dark:text-amber-400" />,
      bgIcon: "bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-800/40",
      btnClass: "bg-amber-600 hover:bg-amber-700 text-white",
    },
    info: {
      icon: <Info className="h-10 w-10 text-sky-600 dark:text-sky-400" />,
      bgIcon: "bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-800/40",
      btnClass: "bg-sky-600 hover:bg-sky-700 text-white",
    },
  }[type] || {
    icon: <Info className="h-10 w-10 text-sky-600 dark:text-sky-400" />,
    bgIcon: "bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-800/40",
    btnClass: "bg-sky-600 hover:bg-sky-700 text-white",
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md p-6 sm:p-8" showCloseButton={false}>
      <div className="flex flex-col items-center text-center">
        <div className={`mb-5 flex h-16 w-16 items-center justify-center rounded-2xl ${typeConfig.bgIcon}`}>
          {typeConfig.icon}
        </div>

        <h3 className="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">
          {title}
        </h3>

        <p className="mb-6 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
          {message}
        </p>

        <div className="flex w-full justify-center gap-3">
          {type === "confirm" && (
            <button
              type="button"
              onClick={() => {
                if (onCancel) onCancel();
                onClose();
              }}
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              {cancelText}
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              if (onConfirm) onConfirm();
              if (type !== "confirm") {
                onClose();
              }
            }}
            className={`w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition ${typeConfig.btnClass}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default CustomAlert;
