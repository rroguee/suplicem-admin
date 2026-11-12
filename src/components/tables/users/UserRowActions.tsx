'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Users, Check, PowerOff, ShoppingBag } from 'lucide-react';
import { User } from '@/services/usersService';

interface UserRowActionsProps {
  user: User;
  isSeller: boolean;
  onStatusChange: (user: User) => void;
  onViewDetail?: (user: User) => void;
}

export const UserRowActions: React.FC<UserRowActionsProps> = ({
  user,
  isSeller,
  onStatusChange,
  onViewDetail,
}) => {
  const router = useRouter();
  const isActive = user.status === 'active';

  return (
    <div className="flex items-center gap-1.5 justify-end">
      {/* Botón Cartera para Vendedores */}
      {!isSeller && user.userType === 'seller' && (
        <button
          type="button"
          onClick={() => router.push(`/admin/user/seller?id=${user.uid}`)}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-900/50 border border-sky-200 dark:border-sky-800 rounded-lg transition-all"
          title="Ver Cartera de Clientes"
        >
          <Users className="w-3.5 h-3.5" />
          <span>Cartera</span>
        </button>
      )}

      {/* Botón Ver Detalle */}
      {onViewDetail && (
        <button
          type="button"
          onClick={() => onViewDetail(user)}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg transition-all"
          title="Ver Detalle del Usuario"
        >
          <Eye className="w-3.5 h-3.5 text-gray-500" />
          <span className="hidden sm:inline">Detalle</span>
        </button>
      )}

      {/* Toggle Activar / Desactivar */}
      {!isSeller && (
        isActive ? (
          <button
            type="button"
            onClick={() => onStatusChange(user)}
            className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg transition-all"
            title="Desactivar Cuenta"
          >
            <PowerOff className="w-3.5 h-3.5 text-gray-400" />
            <span className="hidden sm:inline">Desactivar</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onStatusChange(user)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800 rounded-lg transition-all"
            title="Activar Cuenta"
          >
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Activar</span>
          </button>
        )
      )}

      {user.userType === 'client' && isActive && (
        <button
          type="button"
          onClick={() => router.push(`/admin/orders/create?clientId=${user.uid}`)}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-950/40 hover:bg-orange-100 dark:hover:bg-orange-900/50 border border-orange-200 dark:border-orange-800 rounded-lg transition-all"
          title="Crear Orden Asistida para este cliente"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Orden Asistida</span>
        </button>
      )}
    </div>
  );
};
