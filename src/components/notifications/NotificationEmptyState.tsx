import React from "react";
import { BellOff } from "lucide-react";

interface Props {
  tabName: string;
}

export const NotificationEmptyState: React.FC<Props> = ({ tabName }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500 mb-3">
        <BellOff className="h-6 w-6" />
      </div>
      <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">
        No tienes notificaciones
      </h3>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 max-w-sm">
        {tabName === "all"
          ? "Estás al día con todas las actividades comerciales y de pedidos."
          : `No hay novedades en la categoría seleccionada.`}
      </p>
    </div>
  );
};
