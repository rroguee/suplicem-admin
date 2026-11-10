'use client';

import React from 'react';
import { Truck, Store, MapPin, Phone, ShieldAlert, FileText } from 'lucide-react';
import { ServiceOrder } from './types';
import { OrdersRowActions } from './OrdersRowActions';
import { formatRD } from '@/utils/currencyUtils';
import { calculateTripEstimate, WAREHOUSE_LOCATION } from '@/utils/tripEstimate';

interface OrdersTableRowProps {
  order: ServiceOrder;
  isSeller: boolean;
  onApprove: (order: ServiceOrder) => void;
  onReject: (orderId: string) => void;
  onViewDetails: (order: ServiceOrder) => void;
  onPlanTrips: (order: ServiceOrder) => void;
  onOpenReceipt: (imageUrl: string, orderNumber: number | string) => void;
}

export const OrdersTableRow: React.FC<OrdersTableRowProps> = ({
  order,
  isSeller,
  onApprove,
  onReject,
  onViewDetails,
  onPlanTrips,
  onOpenReceipt,
}) => {
  const calculateTotal = (items: ServiceOrder['items']) =>
    (items || []).reduce((acc, item) => acc + (item.subtotal || 0), 0);

  const orderTotal = calculateTotal(order.items);
  const address = order.deliveryAddress || order.deliveries?.[0]?.address;
  const hasReceipt = Boolean(order.receiptUrl || order.transferReceipt);
  const estimate =
    address?.latitude && address?.longitude
      ? calculateTripEstimate(WAREHOUSE_LOCATION, {
          lat: Number(address.latitude),
          lng: Number(address.longitude),
        })
      : null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/80 dark:bg-amber-950/30 dark:border-amber-900/60 dark:text-amber-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Pendiente
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/30 dark:border-emerald-900/60 dark:text-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Aprobada
          </span>
        );
      case 'on_the_way':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200/80 dark:bg-sky-950/30 dark:border-sky-900/60 dark:text-sky-300">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
            En camino
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200/80 dark:bg-purple-950/30 dark:border-purple-900/60 dark:text-purple-300">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            Entregada
          </span>
        );
      case 'rejected':
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/80 dark:bg-rose-950/30 dark:border-rose-900/60 dark:text-rose-300">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            {status === 'rejected' ? 'Rechazada' : 'Cancelada'}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
            {status}
          </span>
        );
    }
  };

  return (
    <tr className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/60 dark:hover:bg-gray-800/40 transition-colors">
      {/* Orden # */}
      <td className="px-4 py-3.5 text-xs font-bold text-gray-900 dark:text-white tabular-nums whitespace-nowrap">
        <div className="flex items-center gap-1.5">
          <span>#{order.orderNumber}</span>
          {order.aiRiskFlag && (
            <span
              title="Alerta de Seguridad: Contenido alterado con IA"
              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300"
            >
              <ShieldAlert className="w-3 h-3" />
              IA
            </span>
          )}
        </div>
      </td>

      {/* Cliente */}
      <td className="px-4 py-3.5">
        <div className="text-xs font-semibold text-gray-900 dark:text-white leading-tight">
          {order.userNames} {order.userLastNames}
        </div>
        {order.userPhone && (
          <a
            href={`tel:${order.userPhone}`}
            className="inline-flex items-center gap-1 text-[11px] text-gray-500 hover:text-orange-600 dark:text-gray-400 dark:hover:text-orange-400 mt-1 transition-colors"
          >
            <Phone className="w-2.5 h-2.5" />
            <span>{order.userPhone}</span>
          </a>
        )}
      </td>

      {/* Productos */}
      <td className="px-4 py-3.5 text-xs text-gray-700 dark:text-gray-300">
        {order.items?.length > 0 ? (
          <div>
            <span className="font-medium text-gray-900 dark:text-white">{order.items[0].name}</span>
            {order.items.length > 1 && (
              <span className="ml-1.5 inline-block px-1.5 py-0.2 rounded text-[10px] font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                +{order.items.length - 1} más
              </span>
            )}
          </div>
        ) : (
          <span className="text-gray-400">Sin ítems</span>
        )}
      </td>

      {/* Entrega y Pago */}
      <td className="px-4 py-3.5 text-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300">
            {order.deliveryType === 'domicilio' ? (
              <>
                <Truck className="w-2.5 h-2.5" />
                <span>Domicilio</span>
              </>
            ) : (
              <>
                <Store className="w-2.5 h-2.5" />
                <span>Almacén</span>
              </>
            )}
          </span>

          <span
            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
              order.paymentMethod === 'credit'
                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
            }`}
          >
            {order.paymentMethod === 'credit' ? 'Crédito' : 'Transferencia'}
          </span>

          {hasReceipt && (
            <button
              type="button"
              onClick={() =>
                onOpenReceipt(
                  order.receiptUrl || order.transferReceipt || '',
                  order.orderNumber
                )
              }
              className="inline-flex items-center gap-0.5 text-[10px] font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400 hover:underline"
              title="Ver comprobante bancario"
            >
              <FileText className="w-2.5 h-2.5" />
              <span>Comprobante</span>
            </button>
          )}
        </div>

        {order.deliveryType === 'domicilio' && address && (
          <div
            className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400 mt-1 truncate max-w-[200px]"
            title={address.description}
          >
            <MapPin className="w-2.5 h-2.5 flex-shrink-0 text-gray-400" />
            <span className="truncate">{address.description}</span>
          </div>
        )}

        {estimate && (
          <span className="inline-block mt-1 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
            ⏱️ ~{estimate.durationMinutes} min
          </span>
        )}
      </td>

      {/* Estado */}
      <td className="px-4 py-3.5 whitespace-nowrap">
        {getStatusBadge(order.status)}
        {order.status === 'rejected' && (order.rejectionReason || order.declineReason) && (
          <p
            className="text-[10px] text-red-600 dark:text-red-400 mt-1 max-w-[140px] truncate"
            title={order.rejectionReason || order.declineReason}
          >
            {order.rejectionReason || order.declineReason}
          </p>
        )}
      </td>

      {/* Total */}
      <td className="px-4 py-3.5 text-xs font-bold text-gray-900 dark:text-white tabular-nums text-right whitespace-nowrap">
        {formatRD(orderTotal)}
      </td>

      {/* Acciones */}
      <td className="px-4 py-3.5 text-right whitespace-nowrap">
        <OrdersRowActions
          order={order}
          isSeller={isSeller}
          onApprove={onApprove}
          onReject={onReject}
          onViewDetails={onViewDetails}
          onPlanTrips={onPlanTrips}
        />
      </td>
    </tr>
  );
};
