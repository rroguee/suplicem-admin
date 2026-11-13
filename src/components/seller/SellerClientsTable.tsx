"use client";

import React, { useState } from "react";
import { UserCheck, RefreshCw, MapPin } from "lucide-react";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { User } from "@/services/usersService";
import CustomAlert from "@/components/CustomAlert";
import { useCustomAlert } from "@/hooks/useCustomAlert";

interface Props {
  clients: User[];
  allSellers: User[];
  onReassign: (clientUid: string, targetSellerId: string | null) => Promise<{ success: boolean; message?: string }>;
}

export const SellerClientsTable: React.FC<Props> = ({ clients, allSellers, onReassign }) => {
  const [selectedClient, setSelectedClient] = useState<User | null>(null);
  const [targetSellerId, setTargetSellerId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { alertConfig, showError, closeAlert } = useCustomAlert();

  const openModal = (client: User) => {
    setSelectedClient(client);
    setTargetSellerId(client.sellerId || "");
  };

  const closeModal = () => {
    setSelectedClient(null);
    setTargetSellerId("");
  };

  const handleConfirmReassign = async () => {
    if (!selectedClient) return;
    setIsSubmitting(true);
    const result = await onReassign(selectedClient.uid, targetSellerId ? targetSellerId : null);
    setIsSubmitting(false);
    if (result.success) {
      closeModal();
    } else {
      showError({
        title: "Error de Reasignación",
        message: result.message || "Error al reasignar cartera.",
      });
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            Cartera de Clientes Asignados ({clients.length})
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Clientes que generan comisiones y atención directa para este vendedor
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell isHeader className="px-4 py-3 text-start text-xs font-medium text-gray-500">Cliente</TableCell>
              <TableCell isHeader className="px-4 py-3 text-start text-xs font-medium text-gray-500">Identificación</TableCell>
              <TableCell isHeader className="px-4 py-3 text-start text-xs font-medium text-gray-500">Dirección Principal</TableCell>
              <TableCell isHeader className="px-4 py-3 text-start text-xs font-medium text-gray-500">Acción</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {clients.length === 0 ? (
              <TableRow>
                <TableCell className="px-4 py-8 text-center text-sm text-gray-400" colSpan={4}>
                  Este vendedor no tiene clientes asignados en su cartera actualmente.
                </TableCell>
              </TableRow>
            ) : (
              clients.map((c) => {
                const mainAddress = c.addresses?.[0]?.description || "Sin dirección registrada";
                return (
                  <TableRow key={c.uid}>
                    <TableCell className="px-4 py-3 text-start">
                      <div className="font-medium text-sm text-gray-900 dark:text-white">
                        {c.names} {c.lastNames}
                      </div>
                      <div className="text-xs text-gray-400">{c.email} {c.phone ? `• ${c.phone}` : ""}</div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start text-xs text-gray-600 dark:text-gray-300">
                      {c.identificationType} - {c.identification}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start text-xs text-gray-500">
                      <div className="flex items-center gap-1 max-w-[240px] truncate" title={mainAddress}>
                        <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                        <span className="truncate">{mainAddress}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start">
                      <Button size="sm" variant="outline" onClick={() => openModal(c)}>
                        <RefreshCw className="mr-1 h-3.5 w-3.5" /> Reasignar
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Modal isOpen={Boolean(selectedClient)} onClose={closeModal} className="max-w-md p-6">
        <div>
          <h4 className="text-lg font-bold text-gray-900 dark:text-white">Reasignar Cartera de Cliente</h4>
          <p className="mt-1 text-xs text-gray-500">
            Transfiere a <span className="font-semibold text-gray-700 dark:text-gray-300">{selectedClient?.names} {selectedClient?.lastNames}</span> a otro vendedor comercial.
          </p>

          <div className="mt-4 space-y-2">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
              Seleccionar Nuevo Vendedor
            </label>
            <select
              value={targetSellerId}
              onChange={(e) => setTargetSellerId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="">-- Sin Vendedor Asignado (Desvincular) --</option>
              {allSellers.map((s) => (
                <option key={s.uid} value={s.uid}>
                  {s.names} {s.lastNames} ({s.sellerCode || "VEND"})
                </option>
              ))}
            </select>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button size="sm" variant="outline" onClick={closeModal} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button size="sm" variant="primary" onClick={handleConfirmReassign} disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Confirmar Reasignación"}
            </Button>
          </div>
        </div>
      </Modal>

      <CustomAlert {...alertConfig} onClose={closeAlert} />
    </div>
  );
};
