'use client';

import React from 'react';

export type UserRoleFilter = 'all' | 'client' | 'seller' | 'driver' | 'admin';
export type UserStatusFilter = 'all' | 'active' | 'inactive';

interface FilterOption<T> {
  id: T;
  label: string;
}

const ROLE_OPTIONS: FilterOption<UserRoleFilter>[] = [
  { id: 'all', label: 'Todos los roles' },
  { id: 'client', label: 'Clientes' },
  { id: 'seller', label: 'Vendedores' },
  { id: 'driver', label: 'Conductores' },
  { id: 'admin', label: 'Administradores' },
];

const STATUS_OPTIONS: FilterOption<UserStatusFilter>[] = [
  { id: 'all', label: 'Todos' },
  { id: 'active', label: 'Activos' },
  { id: 'inactive', label: 'Inactivos' },
];

interface UserFilterChipsProps {
  roleFilter: UserRoleFilter;
  onRoleChange: (role: UserRoleFilter) => void;
  statusFilter: UserStatusFilter;
  onStatusChange: (status: UserStatusFilter) => void;
  roleCounts: Record<string, number>;
  statusCounts: Record<string, number>;
  isSeller?: boolean;
}

export const UserFilterChips: React.FC<UserFilterChipsProps> = ({
  roleFilter,
  onRoleChange,
  statusFilter,
  onStatusChange,
  roleCounts,
  statusCounts,
  isSeller = false,
}) => {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center ${isSeller ? 'justify-end' : 'justify-between'} gap-3 pt-1`}>
      {/* Tabs por Rol - Solo visible para administradores */}
      {!isSeller && (
        <div className="flex flex-wrap items-center gap-1.5">
          {ROLE_OPTIONS.map((opt) => {
            const isActive = roleFilter === opt.id;
            const count = roleCounts[opt.id] ?? 0;

            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onRoleChange(opt.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 border ${
                  isActive
                    ? 'bg-gray-900 text-white border-gray-900 shadow-xs dark:bg-white dark:text-gray-900 dark:border-white'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/60'
                }`}
              >
                <span>{opt.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] tabular-nums ${
                    isActive
                      ? 'bg-white/20 text-white dark:bg-black/10 dark:text-gray-900'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Segmented Control por Estado */}
      <div className="inline-flex items-center bg-gray-100/80 dark:bg-gray-800/80 p-1 rounded-lg border border-gray-200/80 dark:border-gray-700/80 shrink-0">
        {STATUS_OPTIONS.map((opt) => {
          const isActive = statusFilter === opt.id;
          const count = statusCounts[opt.id] ?? 0;

          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onStatusChange(opt.id)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                isActive
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-xs font-semibold'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <span>{opt.label}</span>
              <span
                className={`text-[10px] tabular-nums font-bold ${
                  opt.id === 'active'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : opt.id === 'inactive'
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-gray-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
