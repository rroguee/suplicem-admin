'use client';

import React from 'react';
import { Plus, Users, UserCheck, Truck, Briefcase } from 'lucide-react';

interface UserListHeaderProps {
  totalUsers: number;
  clientCount: number;
  driverCount: number;
  sellerCount: number;
  onNewUser: () => void;
  isSeller: boolean;
}

export const UserListHeader: React.FC<UserListHeaderProps> = ({
  totalUsers,
  clientCount,
  driverCount,
  sellerCount,
  onNewUser,
  isSeller,
}) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Gestión de Usuarios
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          {isSeller
            ? 'Administra tu cartera de clientes y altas comerciales en tiempo real.'
            : 'Directorio de transportistas, clientes, vendedores y administradores.'}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        {/* KPI Cards Rápidas */}
        {!isSeller && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/80 rounded-xl px-3 py-2 shadow-xs flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300">
              <Users className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-semibold text-gray-400 dark:text-gray-500">Total</div>
              <div className="text-base font-bold text-gray-900 dark:text-white leading-none tabular-nums mt-0.5">
                {totalUsers}
              </div>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 border border-emerald-100 dark:border-emerald-900/40 rounded-xl px-3 py-2 shadow-xs flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <UserCheck className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-semibold text-emerald-600/80 dark:text-emerald-400">
              {isSeller ? 'Clientes en Cartera' : 'Clientes'}
            </div>
            <div className="text-base font-bold text-gray-900 dark:text-white leading-none tabular-nums mt-0.5">
              {clientCount}
            </div>
          </div>
        </div>

        {!isSeller && (
          <>
            <div className="bg-white dark:bg-gray-800 border border-amber-100 dark:border-amber-900/40 rounded-xl px-3 py-2 shadow-xs flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Truck className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-semibold text-amber-600/80 dark:text-amber-400">Choferes</div>
                <div className="text-base font-bold text-gray-900 dark:text-white leading-none tabular-nums mt-0.5">
                  {driverCount}
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 border border-sky-100 dark:border-sky-900/40 rounded-xl px-3 py-2 shadow-xs flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-sky-50 dark:bg-sky-950/40 flex items-center justify-center text-sky-600 dark:text-sky-400">
                <Briefcase className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-semibold text-sky-600/80 dark:text-sky-400">Ventas</div>
                <div className="text-base font-bold text-gray-900 dark:text-white leading-none tabular-nums mt-0.5">
                  {sellerCount}
                </div>
              </div>
            </div>
          </>
        )}

        {/* CTA Botón Nuevo */}
        <button
          type="button"
          onClick={onNewUser}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 active:scale-95 rounded-xl shadow-xs transition-all h-[42px]"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>{isSeller ? 'Nuevo Cliente' : 'Nuevo Usuario'}</span>
        </button>
      </div>
    </div>
  );
};
