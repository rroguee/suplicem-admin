"use client";

import { useState, useCallback } from "react";
import { CustomAlertType, CustomAlertProps } from "@/components/CustomAlert";

export interface CustomAlertOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export type CustomAlertState = CustomAlertProps;

export function useCustomAlert() {
  const [alertConfig, setAlertConfig] = useState<CustomAlertState>({
    isOpen: false,
    type: "info",
    title: "",
    message: "",
    onClose: () => {},
  });

  const showAlert = useCallback(
    (config: Omit<CustomAlertProps, "isOpen" | "onClose"> & { onClose?: () => void }) => {
      setAlertConfig({
        ...config,
        isOpen: true,
        onClose: config.onClose || (() => setAlertConfig((prev) => ({ ...prev, isOpen: false }))),
      });
    },
    []
  );

  const showSuccess = useCallback((options: CustomAlertOptions) => {
    setAlertConfig((prev) => ({
      ...options,
      isOpen: true,
      type: "success",
      onClose: () => setAlertConfig((p) => ({ ...p, isOpen: false })),
    }));
  }, []);

  const showError = useCallback((options: CustomAlertOptions) => {
    setAlertConfig((prev) => ({
      ...options,
      isOpen: true,
      type: "error",
      onClose: () => setAlertConfig((p) => ({ ...p, isOpen: false })),
    }));
  }, []);

  const showConfirm = useCallback((options: CustomAlertOptions) => {
    setAlertConfig((prev) => ({
      ...options,
      isOpen: true,
      type: "confirm",
      onClose: () => setAlertConfig((p) => ({ ...p, isOpen: false })),
    }));
  }, []);

  const showWarning = useCallback((options: CustomAlertOptions) => {
    setAlertConfig((prev) => ({
      ...options,
      isOpen: true,
      type: "warning",
      onClose: () => setAlertConfig((p) => ({ ...p, isOpen: false })),
    }));
  }, []);

  const closeAlert = useCallback(() => {
    setAlertConfig((prev) => ({ ...prev, isOpen: false }));
  }, []);

  return {
    alertConfig,
    showAlert,
    showSuccess,
    showError,
    showConfirm,
    showWarning,
    closeAlert,
  };
}
