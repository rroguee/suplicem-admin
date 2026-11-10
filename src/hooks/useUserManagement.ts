'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { getUsers, activeOrInactiveUser, User } from '@/services/usersService';
import { UserRoleFilter, UserStatusFilter } from '@/components/tables/users/UserFilterChips';

export interface AlertConfig {
  isOpen: boolean;
  type: 'success' | 'error' | 'confirm' | 'info';
  title: string;
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

const ITEMS_PER_PAGE = 8;

export function useUserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Filtros y búsqueda
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRoleFilter>('all');
  const [statusFilter, setStatusFilter] = useState<UserStatusFilter>('all');

  // Modal de Detalle
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Alertas
  const [alertConfig, setAlertConfig] = useState<AlertConfig>({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
  });

  const showAlert = (config: Omit<AlertConfig, 'isOpen'>) => {
    setAlertConfig({ ...config, isOpen: true });
  };

  const closeAlert = () => {
    setAlertConfig((prev) => ({ ...prev, isOpen: false }));
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getUsers();
      if (response.success) {
        setUsers(response.users);
      } else {
        showAlert({
          type: 'error',
          title: 'Error al cargar',
          message: 'No se pudieron obtener los usuarios: ' + (response.message || 'Desconocido'),
        });
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      showAlert({
        type: 'error',
        title: 'Error de Conexión',
        message: 'Ocurrió un error al obtener los usuarios. Inténtalo de nuevo más tarde.',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Contadores reactivos para roles
  const roleCounts = useMemo(() => {
    const relevant = statusFilter === 'all'
      ? users
      : users.filter((u) => {
          const st = u.status?.toLowerCase();
          if (statusFilter === 'active') return st === 'active';
          if (statusFilter === 'inactive') return st === 'inactive' || st === 'pending';
          return true;
        });

    const counts: Record<string, number> = { all: relevant.length, client: 0, seller: 0, driver: 0, admin: 0 };
    relevant.forEach((u) => {
      const role = u.userType?.toLowerCase();
      if (role && counts[role] !== undefined) {
        counts[role]++;
      }
    });
    return counts;
  }, [users, statusFilter]);

  // Contadores reactivos para estado
  const statusCounts = useMemo(() => {
    const relevant = roleFilter === 'all'
      ? users
      : users.filter((u) => u.userType?.toLowerCase() === roleFilter);

    const counts: Record<string, number> = { all: relevant.length, active: 0, inactive: 0 };
    relevant.forEach((u) => {
      const st = u.status?.toLowerCase();
      if (st === 'active') counts.active++;
      else if (st === 'inactive' || st === 'pending') counts.inactive++;
    });
    return counts;
  }, [users, roleFilter]);

  // Filtrado compuesto
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      if (roleFilter !== 'all' && user.userType?.toLowerCase() !== roleFilter) {
        return false;
      }

      if (statusFilter === 'active' && user.status?.toLowerCase() !== 'active') {
        return false;
      }
      if (
        statusFilter === 'inactive' &&
        user.status?.toLowerCase() !== 'inactive' &&
        user.status?.toLowerCase() !== 'pending'
      ) {
        return false;
      }

      const query = searchQuery.toLowerCase().trim();
      if (!query) return true;

      const driverCode = user.driverCode || (user.uid ? `cond-${user.uid.slice(0, 5)}` : '');
      const sellerCode = user.sellerCode || (user.uid ? `vend-${user.uid.slice(0, 5)}` : '');

      return (
        user.names?.toLowerCase().includes(query) ||
        user.lastNames?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.identification?.toLowerCase().includes(query) ||
        driverCode.toLowerCase().includes(query) ||
        sellerCode.toLowerCase().includes(query) ||
        user.sellerName?.toLowerCase().includes(query) ||
        user.vehicle?.plateNumber?.toLowerCase().includes(query)
      );
    });
  }, [users, roleFilter, statusFilter, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [roleFilter, statusFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / ITEMS_PER_PAGE));
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleOpenDetail = (user: User) => {
    setSelectedUser(user);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailModalOpen(false);
  };

  const handleStatusChange = (user: User) => {
    if (!user.uid || user.uid.trim() === '') {
      showAlert({
        type: 'error',
        title: 'Error de Usuario',
        message: 'No se puede cambiar el estado de un usuario sin un ID (UID) válido.',
      });
      return;
    }

    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    const actionText = newStatus === 'active' ? 'activar' : 'desactivar';

    showAlert({
      type: 'confirm',
      title: `Confirmar ${actionText.charAt(0).toUpperCase() + actionText.slice(1)} Usuario`,
      message: `¿Estás seguro de que quieres ${actionText} a ${user.names} ${user.lastNames}?`,
      onConfirm: async () => {
        try {
          setLoading(true);
          const response = await activeOrInactiveUser(user.uid, newStatus);
          if (response && response.message) {
            showAlert({
              type: 'success',
              title: 'Éxito',
              message: `Usuario ${actionText === 'activar' ? 'activado' : 'desactivado'} con éxito.`,
            });
            fetchUsers();
          } else {
            showAlert({
              type: 'error',
              title: 'Error',
              message: 'Error al cambiar el estado del usuario: ' + (response?.message || 'Desconocido'),
            });
          }
        } catch (err: any) {
          console.error('Error changing user status:', err);
          showAlert({
            type: 'error',
            title: 'Error',
            message: 'No se pudo cambiar el estado del usuario. ' + (err.response?.data?.message || err.message),
          });
        } finally {
          setLoading(false);
        }
      },
      onCancel: () => {},
    });
  };

  return {
    users,
    loading,
    error,
    currentPage,
    setCurrentPage,
    searchQuery,
    setSearchQuery,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    selectedUser,
    isDetailModalOpen,
    roleCounts,
    statusCounts,
    filteredUsers,
    totalPages,
    paginatedUsers,
    itemsPerPage: ITEMS_PER_PAGE,
    alertConfig,
    showAlert,
    closeAlert,
    fetchUsers,
    handleOpenDetail,
    handleCloseDetail,
    handleStatusChange,
  };
}
