"use client";

import React from "react";
import Badge from "@/components/ui/badge/Badge";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/components/interactions/formatCurrency";

interface Props {
  orders: any[];
}

export const SellerOrdersTable: React.FC<Props> = ({ orders }) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge size="sm" color="success">Completada</Badge>;
      case "approved":
        return <Badge size="sm" color="info">Aprobada</Badge>;
      case "pending":
        return <Badge size="sm" color="warning">Pendiente</Badge>;
      case "rejected":
        return <Badge size="sm" color="error">Rechazada</Badge>;
      case "cancelled":
        return <Badge size="sm" color="error">Cancelada</Badge>;
      default:
        return <Badge size="sm" color="light">{status}</Badge>;
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
          Historial de Ventas Asistidas ({orders.length})
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Órdenes registradas o gestionadas directamente por este vendedor
        </p>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell isHeader className="px-4 py-3 text-start text-xs font-medium text-gray-500">Orden #</TableCell>
              <TableCell isHeader className="px-4 py-3 text-start text-xs font-medium text-gray-500">Cliente</TableCell>
              <TableCell isHeader className="px-4 py-3 text-start text-xs font-medium text-gray-500">Fecha</TableCell>
              <TableCell isHeader className="px-4 py-3 text-start text-xs font-medium text-gray-500">Toneladas</TableCell>
              <TableCell isHeader className="px-4 py-3 text-start text-xs font-medium text-gray-500">Monto Total</TableCell>
              <TableCell isHeader className="px-4 py-3 text-start text-xs font-medium text-gray-500">Estado</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {orders.length === 0 ? (
              <TableRow>
                <TableCell className="px-4 py-8 text-center text-sm text-gray-400" colSpan={6}>
                  No hay órdenes asistidas registradas por este vendedor.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((o) => {
                const total = (o.items || []).reduce(
                  (sum: number, it: any) => sum + (it.subtotal || it.quantity * it.unitPrice || 0),
                  0
                );
                const tons = typeof o.totalTons === "number"
                  ? o.totalTons
                  : ((o.items || []).filter((it: any) => (it.name || "").toLowerCase().includes("cemento")).reduce((s: number, it: any) => s + (it.quantity || 0), 0) * 0.0425).toFixed(2);

                const dateStr = o.createdAt
                  ? new Date(o.createdAt).toLocaleDateString("es-DO", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : "N/A";

                return (
                  <TableRow key={o.id || o.orderNumber}>
                    <TableCell className="px-4 py-3 text-start font-medium text-sm text-gray-900 dark:text-white">
                      #{o.orderNumber || "S/N"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start text-xs text-gray-700 dark:text-gray-300">
                      {o.userNames ? `${o.userNames} ${o.userLastNames || ""}` : o.userId || "Cliente"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start text-xs text-gray-500">
                      {dateStr}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start text-xs font-medium text-blue-600 dark:text-blue-400">
                      {tons} Ton
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start text-xs font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(total)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start">
                      {getStatusBadge(o.status)}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
