'use client';

import { useState, useEffect, useCallback } from 'react';
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
  const [activeSellers, setActiveSellers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  const [roleCounts, setRoleCounts] = useState<Record<string, number>>({
    all: 0,
    client: 0,
    seller: 0,
    driver: 0,
    admin: 0,
  });
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({
    all: 0,
    active: 0,
    inactive: 0,
  });

  // Filtros y búsqueda
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilterState] = useState<UserRoleFilter>('all');
  const [statusFilter, setStatusFilterState] = useState<UserStatusFilter>('all');

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

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const setRoleFilter = (role: UserRoleFilter) => {
    setRoleFilterState(role);
    setCurrentPage(1);
  };

  const setStatusFilter = (status: UserStatusFilter) => {
    setStatusFilterState(status);
    setCurrentPage(1);
  };

  const fetchActiveSellers = useCallback(async () => {
    try {
      const response = await getUsers({ userType: 'seller', status: 'active' });
      if (response?.success) {
        setActiveSellers(response.users || []);
      }
    } catch {
      // Silenciar fallo secundario al cargar lista de vendedores para asignación
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getUsers({
        userType: roleFilter === 'all' ? undefined : roleFilter,
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: debouncedSearch.trim() || undefined,
        page: currentPage,
        limit: ITEMS_PER_PAGE,
      });

      if (response.success) {
        setUsers(response.users || []);
        setTotalPages(response.pagination?.totalPages || 1);
        setTotalUsers(response.pagination?.total ?? (response.users || []).length);
        if (response.roleCounts) setRoleCounts(response.roleCounts);
        if (response.statusCounts) setStatusCounts(response.statusCounts);
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
  }, [roleFilter, statusFilter, debouncedSearch, currentPage]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchActiveSellers();
  }, [fetchActiveSellers]);

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
    activeSellers,
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
    filteredUsers: users,
    totalUsers,
    totalPages,
    paginatedUsers: users,
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
