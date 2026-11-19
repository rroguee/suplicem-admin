'use client';

import { useState } from 'react';
import { rejectedOrder } from '@/services/ordersService';

interface UseOrderRejectModalProps {
  fetchOrders: () => Promise<void>;
  showAlert: (config: any) => void;
  setGlobalLoading?: (loading: boolean) => void;
}

export function useOrderRejectModal({
  fetchOrders,
  showAlert,
  setGlobalLoading,
}: UseOrderRejectModalProps) {
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [orderToRejectId, setOrderToRejectId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const handleRejectOrder = (orderId: string) => {
    setOrderToRejectId(orderId);
    setRejectionReason('');
    setIsRejectModalOpen(true);
  };

  const confirmRejectOrder = async () => {
    if (!orderToRejectId || !rejectionReason.trim()) return;
    try {
      if (setGlobalLoading) setGlobalLoading(true);
      const res = await rejectedOrder(orderToRejectId, rejectionReason);
      if (res.success) {
        showAlert({ type: 'success', title: 'Éxito', message: 'Orden rechazada correctamente.' });
        fetchOrders();
        setIsRejectModalOpen(false);
      }
    } catch {
      showAlert({ type: 'error', title: 'Error', message: 'No se pudo rechazar la orden.' });
    } finally {
      if (setGlobalLoading) setGlobalLoading(false);
    }
  };

  return {
    isRejectModalOpen,
    setIsRejectModalOpen,
    orderToRejectId,
    rejectionReason,
    setRejectionReason,
    handleRejectOrder,
    confirmRejectOrder,
  };
}
