import React from "react";

interface Props {
  order: any;
  onViewReceipt?: () => void;
}

export const OrderApprovalVerificationCard: React.FC<Props> = ({
  order,
  onViewReceipt,
}) => {
  const hasReceipt = Boolean(order.receiptUrl || order.transferReceipt || order.receiptImage);
  const clientName = `${order.userNames || ""} ${order.userLastNames || ""}`.trim() || "Cliente no especificado";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 dark:border-gray-700 pb-4 mb-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Orden #{order.orderNumber}
            </h2>
            <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              {order.deliveryType === "almacen" ? "Retiro en Almacén" : "Entrega a Domicilio"}
            </span>
          </div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-1">
            👤 {clientName}
          </p>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          {order.userPhone && <span>📞 {order.userPhone}</span>}
          {order.userEmail && <span>✉️ {order.userEmail}</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Método de Pago
          </span>
          <p className="text-base font-bold text-gray-900 dark:text-white mt-0.5">
            {order.paymentMethod === "credit" ? "Pago a Crédito" : "Transferencia Bancaria"}
          </p>
        </div>

        {hasReceipt && onViewReceipt && (
          <div className="sm:text-right">
            <button
              type="button"
              onClick={onViewReceipt}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors border border-blue-200 dark:border-blue-800"
            >
              🧾 Ver Comprobante de Pago
            </button>
          </div>
        )}
      </div>

      {order.comments && (
        <div className="mt-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60">
          <p className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase">
            💬 Comentarios / Instrucciones del Cliente:
          </p>
          <p className="text-sm text-amber-900 dark:text-amber-200 mt-1">
            {order.comments}
          </p>
        </div>
      )}
    </div>
  );
};