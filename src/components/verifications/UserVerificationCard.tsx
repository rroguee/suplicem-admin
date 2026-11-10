'use client';

import React from 'react';
import { User } from '@/services/usersService';
import { translateRole, translateStatus } from '../tables/users/UserTableRow';
import Badge from '@/components/ui/badge/Badge';
import {
  AlertTriangle,
  Check,
  X,
  Eye,
  Mail,
  Phone,
  CreditCard,
  Building2,
  Truck,
  Calendar,
} from 'lucide-react';

interface Props {
  user: User;
  onViewImage: (url: string) => void;
  onApprove: (user: User) => void;
  onReject: (user: User) => void;
}

export const UserVerificationCard: React.FC<Props> = ({
  user,
  onViewImage,
  onApprove,
  onReject,
}) => {
  const isAiRisk = Boolean(user.aiRiskFlag);
  const formattedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('es-DO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'Reciente';

  return (
    <div
      className={`rounded-2xl border bg-white p-5 shadow-xs transition-all dark:bg-gray-900 ${
        isAiRisk
          ? 'border-red-300 dark:border-red-900/60 ring-1 ring-red-400/20'
          : 'border-gray-200 dark:border-gray-800'
      }`}
    >
      {/* Banner de Alerta IA (SynthID / Modificación digital) */}
      {isAiRisk && (
        <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-900/40 dark:bg-red-950/30">
          <AlertTriangle className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
          <div className="text-xs">
            <p className="font-bold text-red-900 dark:text-red-300">
              Alerta de Seguridad IA (SynthID) - Riesgo:{' '}
              {user.aiRiskScore ? `${(user.aiRiskScore * 100).toFixed(0)}%` : 'Alto'}
            </p>
            <p className="mt-0.5 text-red-700 dark:text-red-400">
              {user.aiRiskReason || 'Posible alteración o generación sintética en la imagen del documento.'}
            </p>
          </div>
        </div>
      )}

      {/* Cabecera: Nombre, Rol, Estado y Fecha */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4 dark:border-gray-800">
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            {user.names} {user.lastNames}
          </h3>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              {translateRole(user.userType)}
            </span>
            <Badge size="sm" color={user.status === 'active' ? 'success' : 'warning'}>
              {translateStatus(user.status)}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Calendar className="h-3.5 w-3.5" />
          <span>{formattedDate}</span>
        </div>
      </div>

      {/* Grid de Información de Contacto y Documentación */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 my-4 text-xs">
        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
          <CreditCard className="h-4 w-4 text-gray-400 shrink-0" />
          <span>{user.identificationType || 'Identificación'}:</span>
          <strong className="font-bold">{user.identification || 'No registrada'}</strong>
        </div>

        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 truncate">
          <Mail className="h-4 w-4 text-gray-400 shrink-0" />
          <span className="truncate">{user.email}</span>
        </div>

        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
          <Phone className="h-4 w-4 text-gray-400 shrink-0" />
          <span>Tel:</span>
          <span className="font-semibold">{user.phone || 'Sin teléfono'}</span>
        </div>

        {user.companyName && (
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <Building2 className="h-4 w-4 text-gray-400 shrink-0" />
            <span>Empresa:</span>
            <strong className="font-bold">{user.companyName}</strong>
          </div>
        )}

        {user.vehicle && (
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 col-span-full">
            <Truck className="h-4 w-4 text-red-500 shrink-0" />
            <span>Camión:</span>
            <strong>{user.vehicle.brand} {user.vehicle.model} ({user.vehicle.plateNumber})</strong>
          </div>
        )}
      </div>

      {/* Miniatura de la Cédula / Documento */}
      <div className="mb-4 rounded-xl border border-gray-100 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-800/40">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
            Foto del Documento
          </span>
          {user.identificationImage && (
            <button
              type="button"
              onClick={() => onViewImage(user.identificationImage!)}
              className="inline-flex items-center gap-1 text-xs font-bold text-sky-600 hover:text-sky-700 dark:text-sky-400"
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Ver grande</span>
            </button>
          )}
        </div>

        {user.identificationImage ? (
          <div
            onClick={() => onViewImage(user.identificationImage!)}
            className="group relative cursor-pointer overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 max-h-40 bg-black/10 flex items-center justify-center"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={user.identificationImage}
              alt="Cédula"
              className="h-36 w-full object-contain transition-transform group-hover:scale-105"
            />
          </div>
        ) : (
          <p className="text-xs italic text-gray-400 py-2">
            No se adjuntó foto del documento de identidad en el registro.
          </p>
        )}
      </div>

      {/* Botones de Acción */}
      <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100 dark:border-gray-800">
        <button
          type="button"
          onClick={() => onReject(user)}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl transition"
        >
          <X className="h-3.5 w-3.5 stroke-[2.5]" />
          <span>Rechazar</span>
        </button>

        <button
          type="button"
          onClick={() => onApprove(user)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition"
        >
          <Check className="h-3.5 w-3.5 stroke-[2.5]" />
          <span>Aprobar Usuario</span>
        </button>
      </div>
    </div>
  );
};
