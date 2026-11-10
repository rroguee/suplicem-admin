import React from "react";

interface Props {
  totalOrderTons: number;
  totalPlannedTons: number;
  onConfirm: () => void;
  saving?: boolean;
}

export const OrderApprovalSummaryFooter: React.FC<Props> = ({
  totalOrderTons,
  totalPlannedTons,
  onConfirm,
  saving = false,
}) => {
  const isExceeded = totalPlannedTons > totalOrderTons + 0.01;
  const isComplete = Math.abs(totalPlannedTons - totalOrderTons) <= 0.01;

  const statusTextColor = isExceeded
    ? "text-red-600 dark:text-red-400"
    : isComplete
    ? "text-green-600 dark:text-green-400"
    : "text-amber-600 dark:text-amber-400";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Total Orden: <strong className="text-gray-900 dark:text-white">{totalOrderTons.toFixed(2)} t</strong>
        </p>
        <p className={`text-base font-bold ${statusTextColor}`}>
          Total en Camiones: {totalPlannedTons.toFixed(2)} t
          {isExceeded && ` (Excede por ${(totalPlannedTons - totalOrderTons).toFixed(2)} t)`}
        </p>
      </div>

      <button
        type="button"
        disabled={saving || isExceeded}
        onClick={onConfirm}
        className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {saving ? "Procesando Aprobación..." : "✓ Confirmar Aprobación y Generar Viajes"}
      </button>
    </div>
  );
};
