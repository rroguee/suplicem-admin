import { useState, useContext } from "react";
import { AuthContext } from "@/context/authContext";
import { createUserAccount, CreateUserPayload } from "@/services/usersService";

export function useCreateUserModal(onSuccess: () => void, onClose: () => void) {
  const { user: authUser } = useContext(AuthContext);
  const isSeller = authUser?.userType === "seller";

  const [names, setNames] = useState("");
  const [lastNames, setLastNames] = useState("");
  const [email, setEmail] = useState("");
  const [identification, setIdentification] = useState("");
  const [phone, setPhone] = useState("");
  const [userType, setUserType] = useState<"client" | "driver" | "admin" | "seller">("client");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [clientAddress, setClientAddress] = useState<any>(null);
  const [vehicle, setVehicle] = useState({
    brand: "Toyota",
    model: "Dyna",
    year: "2020",
    tons: "8.50",
    plateNumber: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resetForm = () => {
    setNames("");
    setLastNames("");
    setEmail("");
    setIdentification("");
    setPhone("");
    setPassword("");
    setUserType("client");
    setClientAddress(null);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanNames = names.trim();
    const cleanLastNames = lastNames.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();
    const cleanId = identification.replace(/[^0-9]/g, "");

    if (!cleanNames || !cleanLastNames || !cleanEmail || !password || !cleanPhone || !cleanId) {
      setErrorMessage("Por favor completa todos los campos requeridos.");
      return;
    }

    if (cleanId.length !== 11) {
      setErrorMessage("La cédula dominicana debe contener exactamente 11 dígitos numéricos.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (userType === "driver" && !isSeller) {
      if (!vehicle.brand.trim() || !vehicle.model.trim() || !vehicle.plateNumber.trim()) {
        setErrorMessage("Para conductor debes ingresar marca, modelo y placa del camión.");
        return;
      }
    }

    const payload: CreateUserPayload = {
      names: cleanNames,
      lastNames: cleanLastNames,
      email: cleanEmail,
      password,
      identification: cleanId,
      identificationType: "Cedula",
      phone: cleanPhone,
      userType: isSeller ? "client" : userType,
      sellerId: isSeller ? authUser?.uid : undefined,
    };

    if (userType === "client" && clientAddress?.description) {
      payload.addresses = [clientAddress];
    }

    if (userType === "driver" && !isSeller) {
      payload.vehicle = {
        ...vehicle,
        plateNumber: vehicle.plateNumber.trim().toUpperCase(),
      };
    }

    try {
      setLoading(true);
      const res = await createUserAccount(payload);
      if (res?.success) {
        resetForm();
        onSuccess();
        onClose();
      } else {
        setErrorMessage(res?.message || "Error al registrar el usuario.");
      }
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message || err.message || "Error al procesar la solicitud."
      );
    } finally {
      setLoading(false);
    }
  };

  return {
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
    clientAddress,
    setClientAddress,
    vehicle,
    setVehicle,
    loading,
    errorMessage,
    handleSubmit,
    resetForm,
  };
}
