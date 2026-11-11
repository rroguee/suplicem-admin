'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/modal';
import Badge from '@/components/ui/badge/Badge';
import Button from '@/components/ui/button/Button';
import { User } from '@/services/usersService';
import { translateRole, translateStatus } from '../tables/users/UserTableRow';
import { AssignClientSellerSection } from './AssignClientSellerSection';
import {
  CreditCard,
  Mail,
  Phone,
  Copy,
  Check,
  ExternalLink,
  Truck,
  MapPin,
  Briefcase,
  ShieldCheck,
  MessageCircle,
  TrendingUp,
} from 'lucide-react';

interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onStatusChange?: (user: User) => void;
  sellers?: User[];
  onSellerAssigned?: () => void;
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({
  isOpen,
  onClose,
  user,
  onStatusChange,
  sellers = [],
  onSellerAssigned,
}) => {
  const router = useRouter();
  const [copiedUid, setCopiedUid] = useState(false);

  if (!user) return null;

  const handleCopyUid = () => {
    if (user.uid) {
      navigator.clipboard.writeText(user.uid);
      setCopiedUid(true);
      setTimeout(() => setCopiedUid(false), 2000);
    }
  };

  const cleanPhone = (user.phone || '').replace(/[^0-9]/g, '');
  const whatsappUrl = cleanPhone.length >= 10 ? `https://wa.me/${cleanPhone}` : null;

  const driverCode =
    user.driverCode || (user.uid ? `COND-${user.uid.slice(0, 5).toUpperCase()}` : 'COND-XXXX');
  const sellerCode =
    user.sellerCode || (user.uid ? `VEND-${user.uid.slice(0, 5).toUpperCase()}` : 'VEND-XXXX');

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl p-6 sm:p-8">
      <div className="space-y-6">
        {/* Encabezado: Avatar, Nombres, Rol y Estado */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5 dark:border-gray-800">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-100 font-bold text-orange-600 dark:bg-orange-950/40 dark:text-orange-400 text-xl shadow-xs">
              {(user.names?.[0] || 'U').toUpperCase()}
              {(user.lastNames?.[0] || '').toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {user.names} {user.lastNames}
              </h3>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {translateRole(user.userType)}
                </span>
                <Badge size="sm" color={user.status === 'active' ? 'success' : 'error'}>
                  {translateStatus(user.status)}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Sección: Datos de Contacto y Personales */}
        <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4 dark:border-gray-800 dark:bg-gray-800/40 space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Datos Personales y Contacto
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <CreditCard className="h-4 w-4 text-gray-400" />
              <span>{user.identificationType || 'Identificación'}:</span>
              <strong className="font-semibold">{user.identification || 'No registrada'}</strong>
            </div>

            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <Mail className="h-4 w-4 text-gray-400" />
              <a href={`mailto:${user.email}`} className="text-blue-600 hover:underline dark:text-blue-400 truncate">
                {user.email || 'Sin correo'}
              </a>
            </div>

            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <Phone className="h-4 w-4 text-gray-400" />
              <span>Tel:</span>
              <span className="font-medium">{user.phone || 'Sin teléfono'}</span>
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 ml-1"
                >
                  <MessageCircle className="h-3 w-3" /> WhatsApp
                </a>
              )}
            </div>

            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-xs">
              <span>UID:</span>
              <span className="font-mono text-[11px] truncate">{user.uid}</span>
              <button
                type="button"
                onClick={handleCopyUid}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                title="Copiar UID"
              >
                {copiedUid ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Sección Específica según Rol */}
        {user.userType === 'seller' && (
          <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4 dark:border-blue-900/40 dark:bg-blue-950/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-300">
                  Perfil de Vendedor Comercial
                </h4>
              </div>
              <span className="rounded-lg bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                {sellerCode}
              </span>
            </div>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              Cuenta comercial autorizada para gestión de clientes asignados y ventas asistidas.
            </p>
            <div className="pt-1">
              <Button
                size="sm"
                variant="primary"
                onClick={() => {
                  onClose();
                  router.push(`/admin/user/seller?id=${user.uid}`);
                }}
                className="w-full sm:w-auto"
              >
                <TrendingUp className="mr-1.5 h-4 w-4" />
                Ver Cartera y Ventas Asistidas
              </Button>
            </div>
          </div>
        )}

        {user.userType === 'driver' && (
          <div className="rounded-2xl border border-red-100 bg-red-50/50 p-4 dark:border-red-900/40 dark:bg-red-950/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-red-600 dark:text-red-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-red-900 dark:text-red-300">
                  Datos de Conductor / Transportista
                </h4>
              </div>
              <span className="rounded-lg bg-red-100 px-2.5 py-1 text-xs font-bold text-red-800 dark:bg-red-900 dark:text-red-200">
                {driverCode}
              </span>
            </div>
            {user.vehicle ? (
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-700 dark:text-gray-300 bg-white/70 dark:bg-gray-900/70 p-3 rounded-xl border border-red-100 dark:border-red-900/30">
                <div>
                  <span className="text-gray-500">Vehículo:</span>{' '}
                  <strong>{user.vehicle.brand} {user.vehicle.model}</strong>
                </div>
                <div>
                  <span className="text-gray-500">Año:</span>{' '}
                  <strong>{user.vehicle.year || 'N/A'}</strong>
                </div>
                <div>
                  <span className="text-gray-500">Placa:</span>{' '}
                  <strong className="text-red-700 dark:text-red-400">{user.vehicle.plateNumber || 'N/A'}</strong>
                </div>
                <div>
                  <span className="text-gray-500">Capacidad:</span>{' '}
                  <strong>{user.vehicle.tons ? `${user.vehicle.tons} Tons` : 'N/A'}</strong>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-500 dark:text-gray-400">Sin vehículo asignado actualmente.</p>
            )}
          </div>
        )}

        {user.userType === 'client' && (
          <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4 dark:border-gray-800 dark:bg-gray-800/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Direcciones Registradas ({user.addresses?.length || 0})
                </h4>
              </div>
              {user.sellerName ? (
                <span className="text-xs text-blue-600 dark:text-blue-400">
                  Vendedor: <strong>{user.sellerName}</strong>
                </span>
              ) : (
                <span className="text-xs text-gray-400">Cartera general libre</span>
              )}
            </div>

            {user.addresses && user.addresses.length > 0 ? (
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {user.addresses.map((addr, idx) => (
                  <div
                    key={addr.placeId || idx}
                    className="p-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-xs space-y-0.5"
                  >
                    <p className="font-medium text-gray-800 dark:text-gray-200">{addr.description}</p>
                    {addr.additionalInfo && (
                      <p className="text-gray-500 dark:text-gray-400 text-[11px]">Ref: {addr.additionalInfo}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500 dark:text-gray-400">Sin direcciones registradas.</p>
            )}

            {onSellerAssigned && (
              <AssignClientSellerSection
                client={user}
                sellers={sellers}
                onAssigned={onSellerAssigned}
              />
            )}
          </div>
        )}

        {user.userType === 'admin' && (
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20 flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                Privilegios Administrativos
              </h4>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                Este usuario tiene acceso total de administración y auditoría en Suplicem.
              </p>
            </div>
          </div>
        )}

        {/* Acciones del pie */}
        <div className="flex flex-wrap items-center justify-end gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
          {onStatusChange && (
            <Button
              size="sm"
              variant={user.status === 'active' ? 'outline' : 'primary'}
              onClick={() => {
                onClose();
                onStatusChange(user);
              }}
            >
              {user.status === 'active' ? 'Desactivar Cuenta' : 'Activar Cuenta'}
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </Modal>
  );
};
