"use client";
import React, { useContext, useEffect, useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { AuthContext } from "@/context/authContext";
import { useModal } from "@/hooks/useModal";
import EditSupportModal from "@/components/support/EditSupportModal";
import {
  getSupportConfig,
  SupportConfig,
} from "@/services/supportService";

const DEFAULT_CONFIG: SupportConfig = {
  whatsapp: "18095550199",
  whatsappMessage: "Hola, necesito asistencia con el sistema Suplicem",
  phone: "(809) 555-0199",
  email: "soporte@suplicem.com",
  scheduleWeekday: "8:00 AM - 6:00 PM",
  scheduleSaturday: "8:00 AM - 1:00 PM",
  scheduleSunday: "Guardias de contingencia",
};

export default function SupportPage() {
  const { user } = useContext(AuthContext);
  const { isOpen, openModal, closeModal } = useModal();
  const [config, setConfig] = useState<SupportConfig>(DEFAULT_CONFIG);

  const isAdmin = user?.userType === "admin";

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const data = await getSupportConfig();
        if (data) setConfig(data);
      } catch (err) {
        console.warn("Usando configuración predeterminada de soporte:", err);
      }
    };
    fetchConfig();
  }, []);

  const handleConfigUpdated = (newConfig: SupportConfig) => {
    setConfig(newConfig);
  };

  const cleanWhatsappNumber = config.whatsapp.replace(/\D/g, "");
  const whatsappUrl = `https://wa.me/${cleanWhatsappNumber}?text=${encodeURIComponent(
    config.whatsappMessage
  )}`;
  const cleanPhone = config.phone.replace(/\D/g, "");

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <PageBreadcrumb pageTitle="Soporte y Asistencia" />

        {isAdmin && (
          <button
            onClick={openModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition shadow-xs self-start sm:self-auto"
          >
            <svg
              className="w-4 h-4 fill-current"
              viewBox="0 0 18 18"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
              />
            </svg>
            Editar Información de Soporte
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Canales de Contacto */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {/* WhatsApp */}
          <div className="p-5 bg-white border border-gray-200 rounded-2xl dark:border-gray-800 dark:bg-white/[0.03] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-center w-12 h-12 mb-4 bg-emerald-50 text-emerald-600 rounded-xl dark:bg-emerald-950/40 dark:text-emerald-400">
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.712 1.457h.005c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 00-3.479-8.414z" />
                </svg>
              </div>
              <h4 className="text-base font-semibold text-gray-800 dark:text-white/90">
                WhatsApp Operativo
              </h4>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Atención directa con coordinadores de despacho.
              </p>
            </div>
            <div className="mt-5">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center w-full px-4 py-2.5 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition shadow-xs"
              >
                Abrir Chat ({config.whatsapp})
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
                Central Telefónica
              </h4>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Línea fija para emergencias y almacén central.
              </p>
            </div>
            <div className="mt-5">
              <a
                href={`tel:${cleanPhone}`}
                className="inline-flex items-center justify-center w-full px-4 py-2.5 text-xs font-semibold text-gray-800 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 transition"
              >
                {config.phone}
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
                Correo Electrónico
              </h4>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Consultas formales, auditoría y facturación.
              </p>
            </div>
            <div className="mt-5">
              <a
                href={`mailto:${config.email}`}
                className="inline-flex items-center justify-center w-full px-4 py-2.5 text-xs font-semibold text-gray-800 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 transition break-all"
              >
                {config.email}
              </a>
            </div>
          </div>
        </div>

        {/* Horarios de Operación */}
        <div className="p-5 bg-white border border-gray-200 rounded-2xl dark:border-gray-800 dark:bg-white/[0.03]">
          <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90 mb-3">
            Horarios Oficiales de Despacho y Almacén
          </h4>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 text-xs">
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40">
              <p className="font-semibold text-gray-700 dark:text-gray-300">Lunes a Viernes</p>
              <p className="text-gray-500 dark:text-gray-400 mt-0.5">{config.scheduleWeekday}</p>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40">
              <p className="font-semibold text-gray-700 dark:text-gray-300">Sábados</p>
              <p className="text-gray-500 dark:text-gray-400 mt-0.5">{config.scheduleSaturday}</p>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40">
              <p className="font-semibold text-gray-700 dark:text-gray-300">Domingos y Feriados</p>
              <p className="text-gray-500 dark:text-gray-400 mt-0.5">{config.scheduleSunday}</p>
            </div>
          </div>
        </div>
      </div>

      {isAdmin && (
        <EditSupportModal
          isOpen={isOpen}
          onClose={closeModal}
          config={config}
          onConfigUpdated={handleConfigUpdated}
        />
      )}
    </div>
  );
}
