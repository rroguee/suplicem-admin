'use client';

import React, { useContext } from 'react';
import { AuthContext } from '@/context/authContext';
import { useModal } from '@/hooks/useModal';
import Pagination from './Pagination';
import CustomAlert from '../CustomAlert';
import { CreateUserModal } from '../modals/CreateUserModal';
import { UserDetailModal } from '../modals/UserDetailModal';
import { UserListHeader } from './users/UserListHeader';
import { UserTableRow } from './users/UserTableRow';
import { UserFilterChips } from './users/UserFilterChips';
import { UserSearchBar } from './users/UserSearchBar';
import { useUserManagement } from '@/hooks/useUserManagement';

const UserListTable: React.FC = () => {
  const { user: authUser } = useContext(AuthContext);
  const isSeller = authUser?.userType === 'seller';

  const { isOpen, openModal, closeModal } = useModal();

  const {
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
    itemsPerPage,
    alertConfig,
    showAlert,
    closeAlert,
    fetchUsers,
    handleOpenDetail,
    handleCloseDetail,
    handleStatusChange,
  } = useUserManagement();

  return (
    <div className="w-full space-y-4">
      {/* 1. Header con KPIs del Directorio */}
      <UserListHeader
        totalUsers={roleCounts['all'] ?? 0}
        clientCount={roleCounts['client'] ?? 0}
        driverCount={roleCounts['driver'] ?? 0}
        sellerCount={roleCounts['seller'] ?? 0}
        onNewUser={openModal}
        isSeller={isSeller}
      />

      {/* 2. Barra de Búsqueda y Filtros de Rol/Estado */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <UserSearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>

        <UserFilterChips
          roleFilter={roleFilter}
          onRoleChange={setRoleFilter}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          roleCounts={roleCounts}
          statusCounts={statusCounts}
        />
      </div>

      {/* 3. Tabla de Usuarios */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/80 dark:border-gray-700/80 overflow-hidden shadow-xs">
        {loading && (
          <div className="p-12 text-center text-xs text-gray-500 dark:text-gray-400 flex flex-col items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            <span>Cargando directorio de usuarios...</span>
          </div>
        )}

        {error && (
          <div className="p-6 text-center text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {!loading && !error && filteredUsers.length === 0 && (
          <div className="p-12 text-center text-xs text-gray-500 dark:text-gray-400">
            No se encontraron usuarios con los filtros aplicados.
          </div>
        )}

        {!loading && !error && filteredUsers.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 dark:bg-gray-700/40 border-b border-gray-200/80 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-[11px] uppercase tracking-wider font-semibold">
                  <th className="px-4 py-3">Usuario</th>
                  <th className="px-4 py-3">Rol & Documento</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {paginatedUsers.map((user) => (
                  <UserTableRow
                    key={user.uid}
                    user={user}
                    isSeller={isSeller}
                    onStatusChange={handleStatusChange}
                    onViewDetail={handleOpenDetail}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginación y Contador */}
        {!loading && !error && filteredUsers.length > 0 && (
          <div className="p-3.5 border-t border-gray-100 dark:border-gray-700/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500 dark:text-gray-400">
            <div>
              Mostrando{' '}
              <span className="font-semibold text-gray-800 dark:text-gray-200 tabular-nums">
                {(currentPage - 1) * itemsPerPage + 1}
              </span>{' '}
              a{' '}
              <span className="font-semibold text-gray-800 dark:text-gray-200 tabular-nums">
                {Math.min(currentPage * itemsPerPage, filteredUsers.length)}
              </span>{' '}
              de{' '}
              <span className="font-semibold text-gray-800 dark:text-gray-200 tabular-nums">
                {filteredUsers.length}
              </span>{' '}
              usuarios
            </div>

            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => setCurrentPage(page)}
              />
            )}
          </div>
        )}
      </div>

      {/* Modales */}
      <CreateUserModal
        isOpen={isOpen}
        onClose={closeModal}
        onSuccess={() => {
          fetchUsers();
          showAlert({
            type: 'success',
            title: 'Éxito',
            message: isSeller
              ? 'Cliente registrado y vinculado a tu cartera con éxito.'
              : 'Usuario guardado con éxito.',
          });
        }}
      />

      <UserDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetail}
        user={selectedUser}
        onStatusChange={handleStatusChange}
      />

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
