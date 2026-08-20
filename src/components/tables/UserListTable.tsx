'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Button from '@/components/ui/button/Button';
import { PlusIcon, Briefcase, CreditCard } from 'lucide-react'; 
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Modal } from '@/components/ui/modal';
import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import Badge from '@/components/ui/badge/Badge';
import { useModal } from '@/hooks/useModal';
import Pagination from './Pagination';
import { getUsers, activeOrInactiveUser } from '@/services/usersService';
import CustomAlert from '../CustomAlert'; 


interface User {
  uid: string; 
  names: string;
  lastNames: string;
  email: string;
  userType: string; 
  identificationType: string;
  identification: string;
  status: 'active' | 'inactive' | 'pending'; 
  phone?: string;
  password?: string;
  confirmPassword?: string;
  vehicle?: {
    brand: string;
    model: string;
    year: number | string;
    tons: number | string;
  };
  createdAt?: string;
  addresses?: any[]; 
}


interface AlertConfig {
  isOpen: boolean;
  type: 'success' | 'error' | 'confirm' | 'info';
  title: string;
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

const ITEMS_PER_PAGE = 5; 

const UserListTable = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const { isOpen, openModal, closeModal } = useModal();

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
    setAlertConfig(prev => ({ ...prev, isOpen: false }));
  };

 
  const translateStatus = (status: User['status']): string => {
    switch (status) {
      case 'active':
        return 'Activo';
      case 'inactive':
        return 'Inactivo';
      case 'pending':
        return 'Pendiente';
      default:
        return status;
    }
  };


  const translateRole = (role: string): string => {
    switch (role) {
      case 'admin': 
        return 'Administrador';
      case 'driver':
        return 'Transportista';
      case 'client':
        return 'Cliente';
      case 'accountant': 
        return 'Contable';
      default:
        return role;
    }
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

  const totalPages = Math.ceil(users.length / ITEMS_PER_PAGE);
  const paginatedUsers = users.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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
            message: 'No se pudo cambiar el estado del usuario. Inténtalo de nuevo. ' + (err.response?.data?.message || err.message),
          });
        } finally {
          setLoading(false);
        }
      },
      onCancel: () => { },
    });
  };

  const handleSave = () => {
    console.log('Guardar nuevo usuario...');
    closeModal();
    showAlert({ type: 'success', title: 'Éxito', message: 'Usuario guardado con éxito.' });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          size="md"
          variant="primary"
          startIcon={<PlusIcon />}
          onClick={openModal}
        >
          Nuevo Usuario
        </Button>
      </div>

      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-[584px] p-5 lg:p-10"
      >
        <form>
          <h4 className="mb-6 text-lg font-medium text-gray-800 dark:text-white/90">
            Nuevo Usuario
          </h4>
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
            <div className="col-span-1">
              <Label>Nombre</Label>
              <Input type="text" placeholder="Nombre completo" />
            </div>
            <div className="col-span-1">
              <Label>Correo</Label>
              <Input type="email" placeholder="Correo electrónico" />
            </div>
            <div className="col-span-1">
              <Label>Rol</Label>
              <Input type="text" placeholder="Ej. Administrador" />
            </div>
            <div className="col-span-1">
              <Label>Estado</Label>
              <Input type="text" placeholder="Activo / Inactivo" />
            </div>
          </div>

          <div className="flex items-center justify-end w-full gap-3 mt-6">
            <Button size="sm" variant="outline" onClick={closeModal}>
              Cancelar
            </Button>
            <Button size="sm" onClick={handleSave}>
              Guardar
            </Button>
          </div>
        </form>
      </Modal>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[768px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs text-gray-500 dark:text-gray-400 font-medium">
                    Usuario
                  </TableCell> 
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs text-gray-500 dark:text-gray-400 font-medium">
                    Rol / Identificación
                  </TableCell> 
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs text-gray-500 dark:text-gray-400 font-medium">
                    Estado
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs text-gray-500 dark:text-gray-400 font-medium">
                    Acciones
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {loading && (
                  <TableRow>
                    <TableCell className="px-5 py-4 text-center text-gray-500 dark:text-gray-400">
                      Cargando usuarios...
                    </TableCell>
                    <TableCell>{""}</TableCell> 
                    <TableCell>{""}</TableCell> 
                    <TableCell>{""}</TableCell> 
                  </TableRow>
                )}
                {error && (
                  <TableRow>
                    <TableCell className="px-5 py-4 text-center text-red-500">
                      {error}
                    </TableCell>
                    <TableCell>{""}</TableCell> 
                    <TableCell>{""}</TableCell> 
                    <TableCell>{""}</TableCell> 
                  </TableRow>
                )}
                {!loading && !error && users.length === 0 && (
                  <TableRow>
                    <TableCell className="px-5 py-4 text-center text-gray-500 dark:text-gray-400">
                      No hay usuarios disponibles.
                    </TableCell>
                    <TableCell>{""}</TableCell> 
                    <TableCell>{""}</TableCell> 
                    <TableCell>{""}</TableCell> 
                  </TableRow>
                )}
                {!loading && !error && users.length > 0 && paginatedUsers.map((user) => (
                  <TableRow key={user.uid}> 
                    <TableCell className="px-5 py-4 text-start">
                      <div className="flex flex-col">
                        <span className="text-theme-sm font-medium text-gray-800 dark:text-white/90">
                          {user.names} {user.lastNames}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {user.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start">
                      <div className="flex items-center gap-2 mb-1">
                        <Briefcase size={18} className="text-gray-500 dark:text-gray-400" />
                        <span className="text-theme-sm text-gray-500 dark:text-gray-400">
                          {translateRole(user.userType)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CreditCard size={18} className="text-gray-500 dark:text-gray-400" />
                        <span className="text-theme-sm text-gray-500 dark:text-gray-400">
                          {user.identificationType} - {user.identification}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start">
                      <Badge
                        size="sm"
                        color={
                          user.status === 'active'
                            ? 'success'
                            : user.status === 'inactive'
                            ? 'error'
                            : 'warning' 
                        }
                      >
                        {translateStatus(user.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start">
                      {['pending', 'inactive'].includes(user.status) ? (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleStatusChange(user)}
                        >
                          Activar
                        </Button>
                      ) : user.status === 'active' ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(user)}
                        >
                          Desactivar
                        </Button>
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>

      <CustomAlert
        isOpen={alertConfig.isOpen}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        onConfirm={alertConfig.onConfirm}
        onCancel={alertConfig.onCancel}
        onClose={closeAlert}
      />
    </div>
  );
};

export default UserListTable;
