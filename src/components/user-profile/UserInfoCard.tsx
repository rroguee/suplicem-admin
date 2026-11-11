"use client";
import React, { useContext, useEffect, useState } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { AuthContext } from "@/context/authContext";
import { updateCurrentUserProfile } from "@/services/usersService";

export default function UserInfoCard() {
  const { user, updateUserSession } = useContext(AuthContext);
  const { isOpen, openModal, closeModal } = useModal();

  const [names, setNames] = useState(user?.names || "");
  const [lastNames, setLastNames] = useState(user?.lastNames || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleOpen = () => {
    if (user) {
      setNames(user.names || "");
      setLastNames(user.lastNames || "");
      setPhone(user.phone || "");
    }
    setErrorMessage(null);
    setSuccessMessage(null);
    openModal();
  };

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

      await updateCurrentUserProfile(user.uid, {
        names: names.trim(),
        lastNames: lastNames.trim(),
        phone: phone.trim(),
      });

      updateUserSession({
        names: names.trim(),
        lastNames: lastNames.trim(),
        phone: phone.trim(),
      });

      setSuccessMessage("Información actualizada correctamente");
      setTimeout(() => {
        closeModal();
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

  const roleLabel =
    user?.userType === "admin"
      ? "Administrador"
      : user?.userType === "seller"
      ? "Vendedor"
      : "Usuario";

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 bg-white dark:bg-white/[0.03]">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="w-full">
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-5">
            Información Personal
          </h4>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            <div>
              <p className="mb-1 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                Nombres
              </p>
              <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
                {user?.names || "-"}
              </p>
            </div>

            <div>
              <p className="mb-1 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                Apellidos
              </p>
              <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
                {user?.lastNames || "-"}
              </p>
            </div>

            <div>
              <p className="mb-1 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                Correo Electrónico
              </p>
              <p className="text-sm font-semibold text-gray-800 dark:text-white/90 break-all">
                {user?.email || "-"}
              </p>
            </div>

            <div>
              <p className="mb-1 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                Teléfono de Contacto
              </p>
              <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
                {user?.phone || "No registrado"}
              </p>
            </div>

            <div>
              <p className="mb-1 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                {user?.identificationType || "Documento"}
              </p>
              <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
                {user?.identification || "No especificado"}
              </p>
            </div>

            <div>
              <p className="mb-1 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                Rol en la Plataforma
              </p>
              <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
                {roleLabel}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleOpen}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.03] lg:w-auto shrink-0 transition"
        >
          <svg
            className="fill-current"
            width="16"
            height="16"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
            />
          </svg>
          Editar Información
        </button>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[560px] m-4">
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
                onClick={closeModal}
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
    </div>
  );
}
