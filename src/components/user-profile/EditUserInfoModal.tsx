"use client";
import React, { useEffect, useState } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { updateCurrentUserProfile, User } from "@/services/usersService";

interface EditUserInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onUserUpdated: (updatedData: { names: string; lastNames: string; phone: string }) => void;
}

export default function EditUserInfoModal({
  isOpen,
  onClose,
  user,
  onUserUpdated,
}: EditUserInfoModalProps) {
  const [names, setNames] = useState(user?.names || "");
  const [lastNames, setLastNames] = useState(user?.lastNames || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user && isOpen) {
      setNames(user.names || "");
      setLastNames(user.lastNames || "");
      setPhone(user.phone || "");
      setErrorMessage(null);
      setSuccessMessage(null);
    }
  }, [user, isOpen]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) {
      setErrorMessage("No se pudo identificar la cuenta del usuario.");
      return;
    }

    if (!names.trim()) {
      setErrorMessage("El campo Nombres no puede estar vacío.");
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage(null);

      const trimmedData = {
        names: names.trim(),
        lastNames: lastNames.trim(),
        phone: phone.trim(),
      };

      await updateCurrentUserProfile(user.uid, trimmedData);
      onUserUpdated(trimmedData);

      setSuccessMessage("Información actualizada correctamente");
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err: any) {
      console.error("Error al actualizar información:", err);
      setErrorMessage(
        err?.response?.data?.message ||
          "Error al guardar los cambios. Intenta nuevamente."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[560px] m-4">
      <div className="relative w-full max-w-[560px] rounded-3xl bg-white p-6 dark:bg-gray-900 lg:p-8">
        <div className="mb-6">
          <h4 className="text-xl font-bold text-gray-800 dark:text-white/90">
            Editar Información Personal
          </h4>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Modifica tus datos de contacto registrados en el sistema.
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
              <Label>Nombres</Label>
              <Input
                type="text"
                value={names}
                onChange={(e) => setNames(e.target.value)}
                placeholder="Ej. Juan"
                required
              />
            </div>

            <div>
              <Label>Apellidos</Label>
              <Input
                type="text"
                value={lastNames}
                onChange={(e) => setLastNames(e.target.value)}
                placeholder="Ej. Pérez"
              />
            </div>
          </div>

          <div>
            <Label>Teléfono</Label>
            <Input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ej. (809) 555-0199"
            />
          </div>

          <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label>Correo (No editable)</Label>
                <Input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-75"
                />
              </div>
              <div>
                <Label>Cédula / Documento (No editable)</Label>
                <Input
                  type="text"
                  value={user?.identification || ""}
                  disabled
                  className="bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-75"
                />
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
              El correo y documento están vinculados a la identidad oficial de la cuenta y no se pueden cambiar directamente.
            </p>
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
