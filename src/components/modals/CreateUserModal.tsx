"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Modal } from "@/components/ui/modal";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { useCreateUserModal } from "@/hooks/useCreateUserModal";
import { Eye, EyeOff, AlertCircle } from "lucide-react";

const AddressPicker = dynamic(() => import("@/hooks/AddressPicker"), {
  ssr: false,
  loading: () => <div className="h-10 w-full animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />,
});

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateUserModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const {
    isSeller,
    names,
    setNames,
    lastNames,
    setLastNames,
    email,
    setEmail,
    identification,
    setIdentification,
    phone,
    setPhone,
    userType,
    setUserType,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    setClientAddress,
    vehicle,
    setVehicle,
    loading,
    errorMessage,
    handleSubmit,
    resetForm,
  } = useCreateUserModal(onSuccess, onClose);

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      className="max-w-[640px] p-6 lg:p-8 max-h-[90vh] overflow-y-auto"
    >
      <form onSubmit={handleSubmit}>
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h4 className="text-lg font-bold text-gray-900 dark:text-white">
              {isSeller ? "Registrar Nuevo Cliente" : "Crear Nuevo Usuario"}
            </h4>
            <p className="text-xs text-gray-500">
              {isSeller
                ? "El cliente quedará registrado y vinculado automáticamente a tu cartera."
                : "Configura el perfil de acceso y los datos operativos del usuario."}
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="flex items-center gap-2 p-3 mb-4 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg dark:bg-red-950/40 dark:border-red-800 dark:text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="space-y-4">
          {!isSeller && (
            <div>
              <Label>Rol de Usuario</Label>
              <select
                value={userType}
                onChange={(e) => setUserType(e.target.value as any)}
                className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-lg bg-white dark:border-gray-700 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="client">Cliente</option>
                <option value="seller">Vendedor</option>
                <option value="driver">Conductor / Transportista</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Nombres *</Label>
              <Input
                type="text"
                placeholder="Ej. Juan"
                value={names}
                onChange={(e) => setNames(e.target.value)}
              />
            </div>
            <div>
              <Label>Apellidos *</Label>
              <Input
                type="text"
                placeholder="Ej. Pérez"
                value={lastNames}
                onChange={(e) => setLastNames(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>No. Cédula (11 dígitos) *</Label>
              <Input
                type="text"
                placeholder="40200000000"
                maxLength={11}
                value={identification}
                onChange={(e) => setIdentification(e.target.value.replace(/[^0-9]/g, ""))}
              />
            </div>
            <div>
              <Label>Teléfono *</Label>
              <Input
                type="tel"
                placeholder="8095551234"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Correo Electrónico *</Label>
              <Input
                type="email"
                placeholder="cliente@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <Label>Contraseña *</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {userType === "client" && (
            <div>
              <Label>Dirección Inicial de Entrega (Opcional)</Label>
              <AddressPicker onPlaceSelected={(place) => setClientAddress(place)} />
            </div>
          )}

          {userType === "driver" && !isSeller && (
            <div className="p-3 border border-gray-200 rounded-lg dark:border-gray-800 space-y-3 bg-gray-50/50 dark:bg-gray-800/40">
              <span className="text-xs font-bold uppercase text-gray-600 dark:text-gray-300">
                Datos del Camión
              </span>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Marca (ej. Toyota)"
                  value={vehicle.brand}
                  onChange={(e) => setVehicle({ ...vehicle, brand: e.target.value })}
                />
                <Input
                  placeholder="Modelo (ej. Dyna)"
                  value={vehicle.model}
                  onChange={(e) => setVehicle({ ...vehicle, model: e.target.value })}
                />
                <Input
                  placeholder="Toneladas (ej. 8.50)"
                  value={vehicle.tons}
                  onChange={(e) => setVehicle({ ...vehicle, tons: e.target.value })}
                />
                <Input
                  placeholder="Placa (ej. L123456)"
                  value={vehicle.plateNumber}
                  onChange={(e) =>
                    setVehicle({ ...vehicle, plateNumber: e.target.value.toUpperCase() })
                  }
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end w-full gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
          <Button size="sm" variant="outline" type="button" onClick={handleClose}>
            Cancelar
          </Button>
          <Button size="sm" type="submit" disabled={loading}>
            {loading ? "Registrando..." : isSeller ? "Registrar Cliente" : "Guardar Usuario"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
