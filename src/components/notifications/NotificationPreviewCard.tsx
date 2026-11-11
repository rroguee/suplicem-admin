import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Badge from "@/components/ui/badge/Badge";
import { NotificationPreview } from "@/types/notification";

interface Props {
  preview: NotificationPreview;
}

export const NotificationPreviewCard: React.FC<Props> = ({ preview }) => {
  return (
    <Link
      href={preview.actionUrl}
      onClick={(e) => e.stopPropagation()}
      className="mt-3 block rounded-xl border border-gray-200 bg-white p-3 shadow-xs transition hover:border-orange-300 hover:shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:hover:border-orange-500/40"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Badge size="sm" variant="light" color={preview.badgeColor}>
            {preview.badgeLabel}
          </Badge>
          {preview.orderNumber && (
            <span className="text-xs font-bold text-gray-900 dark:text-white">
              Pedido #{preview.orderNumber}
            </span>
          )}
          {preview.tripId && (
            <span className="text-xs font-bold text-gray-900 dark:text-white">
              {preview.tripId}
            </span>
          )}
        </div>
        {preview.totalAmount && (
          <span className="text-xs font-bold text-gray-900 dark:text-white">
            {preview.totalAmount}
          </span>
        )}
      </div>

      {preview.details && (
        <p className="mt-1.5 truncate text-xs text-gray-500 dark:text-gray-400">
          {preview.details}
        </p>
      )}

      <div className="mt-2 flex items-center justify-end gap-0.5 text-[11px] font-semibold text-orange-600 dark:text-orange-400">
        <span>Ver detalle</span>
        <ArrowUpRight className="h-3 w-3" />
      </div>
    </Link>
  );
};
