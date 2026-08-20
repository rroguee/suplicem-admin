"use client";
import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import Image from "next/image";
import React, { useState, useContext } from "react"; // Añadido useContext
import { useRouter } from "next/navigation";
import { login, getCurrentUser } from "@/services/authService";
import { AuthContext } from "@/context/authContext"; // Importado AuthContext
import CustomAlert from "@/components/CustomAlert"; // Importado CustomAlert
import { saveAuthSession } from "@/utils/authStorage";

// Interfaz para la configuración de la alerta personalizada
interface AlertConfig {
  isOpen: boolean;
  type: 'success' | 'error' | 'confirm' | 'info';
  title: string;
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  // Obtener la función logIn del AuthContext
  const { logIn } = useContext(AuthContext);

  // Estado y funciones para CustomAlert
  const [alertConfig, setAlertConfig] = useState<AlertConfig>({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
  });

  const showAlert = (config: Omit<AlertConfig, 'isOpen'>) => {
    setAlertConfig({ ...config, isOpen: true });
  };

  const closeAlert = () => {
    setAlertConfig(prev => ({ ...prev, isOpen: false }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Intentando iniciar sesión con email:", email);

    if (!email || !password) {
      showAlert({
        type: 'error',
        title: 'Campos Incompletos',
        message: 'Por favor, complete todos los campos.',
      });
      console.log("Campos incompletos");
      return;
    }

    try {
      console.log("Llamando a login service...");
      const responseLogin = await login(email, password);
      console.log("Respuesta login:", responseLogin);

      if (responseLogin?.data?.success) {
        if (!responseLogin?.data?.emailVerified) {
          showAlert({
            type: 'error',
            title: 'Correo no verificado',
            message: 'El correo no está verificado. Por favor, revisa el enlace de verificación enviado a tu correo.',
          });
          console.log("Correo no verificado");
          return;
        }

        console.log("Obteniendo datos del usuario con token...");
        const responseUser = await getCurrentUser(responseLogin?.data?.idToken);
        console.log("Respuesta usuario:", responseUser);

        if (responseUser?.data?.success) {
          // El AuthContext.logIn se encarga de guardar la sesión y redirigir
                  const now = Date.now();
          const newSession = {
            token: responseLogin?.data?.idToken,
            refreshToken: responseLogin?.data?.refreshToken,
            expiresAt: now + parseInt(responseLogin?.data?.expiresIn) * 1000,
          };

          saveAuthSession(newSession);
        
          logIn(responseUser.data.user);
          showAlert({
            type: 'success',
            title: 'Inicio de sesión exitoso',
            message: 'Bienvenido de nuevo.',
          });
          // La redirección se maneja dentro de logIn, no es necesario aquí.
          // router.replace("/admin/basic-tables"); // Eliminado
          router.replace("/admin/basic-tables");
        } else {
          showAlert({
            type: 'error',
            title: 'Error de Usuario',
            message: 'Usuario no encontrado o datos incompletos.',
          });
          console.log("Error: Usuario no encontrado");
        }
      } else {
        showAlert({
          type: 'error',
          title: 'Credenciales Inválidas',
          message: 'Las credenciales proporcionadas no son válidas.',
        });
        console.log("Credenciales inválidas");
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      showAlert({
        type: 'error',
        title: 'Error del Servidor',
        message: 'Ocurrió un error inesperado al intentar iniciar sesión. Inténtalo de nuevo más tarde.',
      });
    }
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full justify-center min-h-screen">
      <div className="w-full max-w-md mx-auto mb-5">
        <Link
          href="/admin/basic-tables"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          Volver al panel
        </Link>
      </div>
      <div className="flex flex-col justify-start w-full max-w-md mx-auto mt-2">
        <div>
          <div className="mb-5 sm:mb-8 flex justify-center">
            <Image
              width={350}
              height={190}
              src="/images/logo/logo-suplicem-removebg-preview.png"
              alt="Suplicem Logo"
              className="mb-2"
            />
          </div>

          <div className="relative py-2 sm:py-4 -mt-34">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="p-2 text-gray-400 bg-white dark:bg-gray-900 sm:px-5 sm:py-2">
                O
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <Label>
                  Correo electrónico <span className="text-error-500">*</span>
                </Label>
                <Input
                  placeholder="info@gmail.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <Label>
                  Contraseña <span className="text-error-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Ingresa tu contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                  >
                    {showPassword ? (
                      <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                    ) : (
                      <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                    )}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox checked={isChecked} onChange={setIsChecked} />
                  <span className="block font-normal text-orange-400 text-theme-sm dark:text-orange-500">
                    Mantener sesión iniciada
                  </span>
                </div>
                <Link
                  href="/reset-password"
                  className="text-sm text-orange-400 hover:text-orange-500 dark:text-orange-500"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div>
                <Button
                  className="w-full bg-orange-400 hover:bg-orange-500 text-white"
                  size="sm"
                  type="submit"
                >
                  Iniciar sesión
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
      {/* CustomAlert para mostrar mensajes */}
      <CustomAlert
        isOpen={alertConfig.isOpen}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        onConfirm={alertConfig.onConfirm}
        onCancel={alertConfig.onCancel}
        onClose={closeAlert}
      />
    </div>
  );
}
