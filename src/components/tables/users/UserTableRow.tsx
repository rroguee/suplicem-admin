'use client';

import React from 'react';
import { User } from '@/services/usersService';
import { UserRowActions } from './UserRowActions';

export const translateStatus = (status?: string): string => {
  return status === 'active' ? 'Activo' : 'Inactivo';
};

export const translateRole = (role?: string): string => {
  switch (role) {
    case 'admin':
      return 'Administrador';
    case 'driver':
      return 'Transportista';
    case 'client':
      return 'Cliente';
    case 'seller':
      return 'Vendedor';
    case 'accountant':
      return 'Contable';
    default:
      return role || 'Cliente';
  }
};

interface Props {
  user: User;
  isSeller: boolean;
  onStatusChange: (user: User) => void;
  onViewDetail?: (user: User) => void;
}

export const UserTableRow: React.FC<Props> = ({
  user,
  isSeller,
  onStatusChange,
  onViewDetail,
}) => {
  const isActive = user.status === 'active';

  // Obtener iniciales para el avatar
  const getInitials = (names?: string, lastNames?: string) => {
    const f = names?.trim()?.charAt(0) || '';
    const l = lastNames?.trim()?.charAt(0) || '';
    return (f + l).toUpperCase() || 'U';
  };

  // Formatear cédula dominicana de 11 dígitos
  const formatDocument = (doc?: string) => {
    if (!doc) return 'No registrado';
    const clean = doc.replace(/\D/g, '');
    if (clean.length === 11) {
      return `${clean.slice(0, 3)}-${clean.slice(3, 10)}-${clean.slice(10)}`;
    }
    return doc;
  };

  // Estilos de rol cromático y avatar
  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'admin':
        return {
          label: 'Administrador',
          classes: 'bg-indigo-50 text-indigo-700 border-indigo-200/80 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800',
          avatarBg: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300',
        };
      case 'seller':
        return {
          label: 'Vendedor',
          classes: 'bg-sky-50 text-sky-700 border-sky-200/80 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800',
          avatarBg: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300',
        };
      case 'driver':
        return {
          label: 'Transportista',
          classes: 'bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
          avatarBg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300',
        };
      case 'client':
      default:
        return {
          label: 'Cliente',
          classes: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
          avatarBg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300',
        };
    }
  };

  const roleMeta = getRoleBadge(user.userType);
  const initials = getInitials(user.names, user.lastNames);

  return (
    <tr className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-colors">
      {/* Usuario con Avatar e Iniciales */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div
            className={`relative flex items-center justify-center w-9 h-9 rounded-full text-xs font-bold border shrink-0 ${
              isActive ? roleMeta.avatarBg : 'bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400'
            }`}
          >
            <span>{initials}</span>
            <span
              className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-gray-800 ${
                isActive ? 'bg-emerald-500' : 'bg-gray-400'
              }`}
            />
          </div>

          <div>
            <div className="text-xs font-semibold text-gray-900 dark:text-white leading-tight">
              {user.names} {user.lastNames}
            </div>
            <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
              {user.email || 'Sin correo registrado'}
            </div>
          </div>
        </div>
      </td>

      {/* Rol y Documento */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${roleMeta.classes}`}>
            {roleMeta.label}
          </span>

          {user.userType === 'seller' && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-sky-100/60 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 tabular-nums">
              ID: {user.sellerCode || (user.uid ? `VEND-${user.uid.slice(0, 5).toUpperCase()}` : 'VEND-XXXX')}
            </span>
          )}

          {user.userType === 'driver' && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100/60 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 tabular-nums">
              ID: {user.driverCode || (user.uid ? `COND-${user.uid.slice(0, 5).toUpperCase()}` : 'COND-XXXX')}
            </span>
          )}
        </div>

        <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 tabular-nums">
          <span className="text-gray-400">{user.identificationType || 'Cédula'}:</span>{' '}
          <strong>{formatDocument(user.identification)}</strong>
        </div>
      </td>

      {/* Estado con Pulse Dot */}
      <td className="px-4 py-3.5 whitespace-nowrap">
        {isActive ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/30 dark:border-emerald-900/60 dark:text-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Activo
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/80 dark:bg-rose-950/30 dark:border-rose-900/60 dark:text-rose-300">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Inactivo
          </span>
        )}
      </td>

      {/* Acciones */}
      <td className="px-4 py-3.5 text-right whitespace-nowrap">
        <UserRowActions
          user={user}
          isSeller={isSeller}
          onStatusChange={onStatusChange}
          onViewDetail={onViewDetail}
        />
      </td>
    </tr>
  );
};
