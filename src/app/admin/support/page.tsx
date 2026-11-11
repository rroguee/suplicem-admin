import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Soporte y Asistencia | Suplicem Admin",
  description:
    "Centro de ayuda, asistencia operativa y canales de contacto para el equipo de Suplicem.",
};

export default function SupportPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Soporte y Asistencia" />

      <div className="space-y-6">
        {/* Canales de Contacto Directo */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {/* WhatsApp de Soporte */}
          <div className="p-5 bg-white border border-gray-200 rounded-2xl dark:border-gray-800 dark:bg-white/[0.03] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-center w-12 h-12 mb-4 bg-emerald-50 text-emerald-600 rounded-xl dark:bg-emerald-950/40 dark:text-emerald-400">
                <svg
                  className="w-6 h-6 fill-current"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.712 1.457h.005c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 00-3.479-8.414z" />
                </svg>
              </div>
              <h4 className="text-base font-semibold text-gray-800 dark:text-white/90">
                WhatsApp Operativo
              </h4>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Respuesta directa con el equipo técnico y supervisores de logística.
              </p>
            </div>
            <div className="mt-5">
              <a
                href="https://wa.me/18095550199?text=Hola%2C%20necesito%20asistencia%20con%20el%20panel%20de%20Suplicem"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center w-full px-4 py-2.5 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition shadow-xs"
              >
                Abrir Chat de WhatsApp
              </a>
            </div>
          </div>

          {/* Central Telefónica */}
          <div className="p-5 bg-white border border-gray-200 rounded-2xl dark:border-gray-800 dark:bg-white/[0.03] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-center w-12 h-12 mb-4 bg-blue-50 text-blue-600 rounded-xl dark:bg-blue-950/40 dark:text-blue-400">
                <svg
                  className="w-6 h-6 stroke-current fill-none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              </div>
              <h4 className="text-base font-semibold text-gray-800 dark:text-white/90">
                Central de Llamadas
              </h4>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Línea telefónica para despacho de pedidos urgentes y almacén.
              </p>
            </div>
            <div className="mt-5">
              <a
                href="tel:8095550199"
                className="inline-flex items-center justify-center w-full px-4 py-2.5 text-xs font-semibold text-gray-800 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 transition"
              >
                (809) 555-0199
              </a>
            </div>
          </div>

          {/* Correo Electrónico */}
          <div className="p-5 bg-white border border-gray-200 rounded-2xl dark:border-gray-800 dark:bg-white/[0.03] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-center w-12 h-12 mb-4 bg-orange-50 text-orange-600 rounded-xl dark:bg-orange-950/40 dark:text-orange-400">
                <svg
                  className="w-6 h-6 stroke-current fill-none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <h4 className="text-base font-semibold text-gray-800 dark:text-white/90">
                Correo de Soporte
              </h4>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Para consultas administrativas, facturación y reportes formales.
              </p>
            </div>
            <div className="mt-5">
              <a
                href="mailto:soporte@suplicem.com"
                className="inline-flex items-center justify-center w-full px-4 py-2.5 text-xs font-semibold text-gray-800 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 transition"
              >
                soporte@suplicem.com
              </a>
            </div>
          </div>
        </div>

        {/* Horarios de Operación */}
        <div className="p-5 bg-white border border-gray-200 rounded-2xl dark:border-gray-800 dark:bg-white/[0.03]">
          <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90 mb-3">
            Horario de Operaciones y Despachos
          </h4>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 text-xs">
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40">
              <p className="font-semibold text-gray-700 dark:text-gray-300">Lunes a Viernes</p>
              <p className="text-gray-500 dark:text-gray-400 mt-0.5">8:00 AM - 6:00 PM</p>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40">
              <p className="font-semibold text-gray-700 dark:text-gray-300">Sábados</p>
              <p className="text-gray-500 dark:text-gray-400 mt-0.5">8:00 AM - 1:00 PM</p>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40">
              <p className="font-semibold text-gray-700 dark:text-gray-300">Domingos y Feriados</p>
              <p className="text-gray-500 dark:text-gray-400 mt-0.5">Guardias de contingencia</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
