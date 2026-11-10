'use client';

import { useState, useEffect, useCallback, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/context/authContext';
import { getUsers, activeOrInactiveUser, User } from '@/services/usersService';

export interface AlertState {
  isOpen: boolean;
  type: 'success' | 'error' | 'confirm' | 'info';
  title: string;
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export type VerificationTab = 'pending' | 'ai_alerts';

export function useUserVerifications() {
  const { user } = useContext(AuthContext);
  const router = useRouter();

  // 🛡️ Proteger pantalla contra acceso no autorizado de vendedores
  useEffect(() => {
    if (user?.userType === 'seller') {
      router.replace('/admin/user');
    }
  }, [user, router]);

  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [aiAlertUsers, setAiAlertUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<VerificationTab>('pending');
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const [alertConfig, setAlertConfig] = useState<AlertState>({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
  });

  const showAlert = (config: Omit<AlertState, 'isOpen'>) => {
    setAlertConfig({ ...config, isOpen: true });
  };

  const closeAlert = () => {
    setAlertConfig((prev) => ({ ...prev, isOpen: false }));
  };

  const fetchRequests = useCallback(async () => {
    if (user?.userType === 'seller') return;
    setLoading(true);
    try {
      const [pendingRes, aiRes] = await Promise.all([
        getUsers({ status: 'pending' }),
        getUsers({ aiRiskFlag: true }),
      ]);

      if (pendingRes?.success && Array.isArray(pendingRes.users)) {
        setPendingUsers(pendingRes.users);
      }
      if (aiRes?.success && Array.isArray(aiRes.users)) {
        setAiAlertUsers(aiRes.users);
      }
    } catch (err: any) {
      console.error('Error fetching verification requests:', err);
      showAlert({
        type: 'error',
        title: 'Error de Conexión',
        message: 'No se pudieron cargar las solicitudes de verificación.',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleUpdateStatus = (user: User, newStatus: 'active' | 'rejected') => {
    const isApprove = newStatus === 'active';
    const actionText = isApprove ? 'Aprobar' : 'Rechazar';

    showAlert({
      type: 'confirm',
      title: `${actionText} Registro`,
      message: `¿Estás seguro de que deseas ${actionText.toLowerCase()} a ${user.names} ${user.lastNames}? ${
        isApprove
          ? 'El usuario quedará activo y se le enviará un correo de bienvenida.'
          : 'La cuenta quedará rechazada y se le revocará el acceso.'
      }`,
      onConfirm: async () => {
        try {
          setLoading(true);
          const res = await activeOrInactiveUser(user.uid, newStatus);
          if (res?.message || res?.success) {
            showAlert({
              type: 'success',
              title: isApprove ? 'Cuenta Aprobada' : 'Cuenta Rechazada',
              message: `El usuario ha sido ${isApprove ? 'aprobado' : 'rechazado'} con éxito.`,
            });
            // Remover de pendientes y refrescar
            setPendingUsers((prev) => prev.filter((u) => u.uid !== user.uid));
            setAiAlertUsers((prev) =>
              prev.map((u) => (u.uid === user.uid ? { ...u, status: newStatus } : u))
            );
          }
        } catch (error: any) {
          showAlert({
            type: 'error',
            title: 'Error al actualizar',
            message: error?.response?.data?.message || error.message || 'No se pudo actualizar el estado.',
          });
        } finally {
          setLoading(false);
        }
      },
      onCancel: () => {},
    });
  };

  const currentUsers = activeTab === 'pending' ? pendingUsers : aiAlertUsers;

  return {
    pendingUsers,
    aiAlertUsers,
    currentUsers,
    activeTab,
    setActiveTab,
    loading,
    selectedImage,
    setSelectedImage,
    alertConfig,
    closeAlert,
    fetchRequests,
    handleUpdateStatus,
  };
}
