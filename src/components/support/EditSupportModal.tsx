"use client";
import React, { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { SupportConfig, updateSupportConfig } from "@/services/supportService";

interface EditSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SupportConfig;
  onConfigUpdated: (newConfig: SupportConfig) => void;
}

export default function EditSupportModal({
  isOpen,
  onClose,
  config,
  onConfigUpdated,
}: EditSupportModalProps) {
  const [formData, setFormData] = useState<SupportConfig>(config);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData(config);
      setErrorMessage(null);
      setSuccessMessage(null);
    }
  }, [isOpen, config]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSaving(true);
      setErrorMessage(null);

      const trimmedData: SupportConfig = {
        whatsapp: formData.whatsapp.trim(),
        whatsappMessage: formData.whatsappMessage.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        scheduleWeekday: formData.scheduleWeekday.trim(),
        scheduleSaturday: formData.scheduleSaturday.trim(),
        scheduleSunday: formData.scheduleSunday.trim(),
      };

      await updateSupportConfig(trimmedData);
      onConfigUpdated(trimmedData);

      setSuccessMessage("Configuración de soporte guardada exitosamente");
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err: any) {
      console.error("Error al actualizar soporte:", err);
      setErrorMessage(
        err?.response?.data?.message || "Error al actualizar la configuración."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[620px] m-4">
      <div className="relative w-full max-w-[620px] rounded-3xl bg-white p-6 dark:bg-gray-900 lg:p-8">
        <div className="mb-6">
          <h4 className="text-xl font-bold text-gray-800 dark:text-white/90">
            Editar Información de Soporte
          </h4>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Actualiza los canales de contacto y horarios visibles en todo el sistema.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs dark:bg-red-950/30 dark:border-red-900 dark:text-red-400">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs dark:bg-emerald-950/30 dark:border-emerald-900 dark:text-emerald-400">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>WhatsApp (Número con código)</Label>
              <Input
                type="text"
                value={formData.whatsapp}
                onChange={(e) =>
                  setFormData({ ...formData, whatsapp: e.target.value })
                }
                placeholder="Ej. 18095550199"
                required
              />
            </div>
            <div>
              <Label>Central Telefónica</Label>
              <Input
                type="text"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="Ej. (809) 555-0199"
                required
              />
            </div>
          </div>

          <div>
            <Label>Mensaje Predeterminado de WhatsApp</Label>
            <Input
              type="text"
              value={formData.whatsappMessage}
              onChange={(e) =>
                setFormData({ ...formData, whatsappMessage: e.target.value })
              }
              placeholder="Texto que verá el usuario al abrir WhatsApp"
            />
          </div>

          <div>
            <Label>Correo de Asistencia</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="Ej. soporte@suplicem.com"
              required
            />
          </div>

          <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
            <p className="mb-3 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              Horarios de Atención
            </p>
            <div className="space-y-3">
              <div>
                <Label>Lunes a Viernes</Label>
                <Input
                  type="text"
                  value={formData.scheduleWeekday}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      scheduleWeekday: e.target.value,
                    })
                  }
                  placeholder="Ej. 8:00 AM - 6:00 PM"
                  required
                />
              </div>
              <div>
                <Label>Sábados</Label>
                <Input
                  type="text"
                  value={formData.scheduleSaturday}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      scheduleSaturday: e.target.value,
                    })
                  }
                  placeholder="Ej. 8:00 AM - 1:00 PM"
                  required
                />
              </div>
              <div>
                <Label>Domingos y Feriados</Label>
                <Input
                  type="text"
                  value={formData.scheduleSunday}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      scheduleSunday: e.target.value,
                    })
                  }
                  placeholder="Ej. Guardias de contingencia"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={isSaving}>
              {isSaving ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
