"use client";

import { useRouter } from "next/navigation";
import { createContext, useState, useEffect, PropsWithChildren } from "react";

// Definición de la interfaz Address (adaptada para web si es necesario, pero manteniendo la estructura)
interface Address {
  longitude: number;
  description: string;
  placeId: string;
  latitude: number;
  // Añade cualquier otra propiedad de dirección que uses
}

// Definición de la interfaz VehicleData
interface VehicleData {
  brand: string;
  model: string;
  year: number;
  tons: number;
  // Añade cualquier otra propiedad de vehículo que uses
}

// Definición de la interfaz User
type User = {
  uid?: string;
  identificationType: "Cedula" | "Pasaporte";
  identification: string;
  email: string;
  names: string;
  lastNames: string;
  phone: string;
  userType: "client" | "driver"; // Añadido userType
  addresses: Address[]; // Ahora usa la interfaz Address
  vehicle?: VehicleData; // Ahora usa la interfaz VehicleData
};

// Definición de la interfaz AuthState
type AuthState = {
  isLoggedIn: boolean;
  isReady: boolean;
  user: User | null;
  logIn: (user: User) => void;
  logOut: () => void;
};

const authStorageKey = "auth-web-key"; // Mantener la clave para localStorage

// Creación del contexto de autenticación
// Inicializado con un objeto AuthState completo, no undefined
export const AuthContext = createContext<AuthState>({
  isLoggedIn: false,
  isReady: false,
  user: null,
  logIn: () => {}, // Función vacía por defecto
  logOut: () => {}, // Función vacía por defecto
});

// Componente proveedor de autenticación
export function AuthProvider({ children }: PropsWithChildren) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();

  // Función para guardar el estado de autenticación en localStorage
  // Se hace async para replicar el patrón de AsyncStorage, aunque localStorage es síncrono
  const storeAuthState = async (state: { isLoggedIn: boolean; user: User | null }) => {
    try {
      const jsonValue = JSON.stringify(state);
      // await no es estrictamente necesario para localStorage, pero se mantiene el patrón asíncrono
      localStorage.setItem(authStorageKey, jsonValue);
    } catch (error) {
      console.error("Error al guardar el estado de autenticación en localStorage:", error);
    }
  };

  // Función para iniciar sesión
  const logIn = (userData: User) => {
    setIsLoggedIn(true);
    setUser(userData);
    storeAuthState({ isLoggedIn: true, user: userData });
    router.replace("/"); // Redirige a la página principal después de iniciar sesión
  };

  // Función para cerrar sesión
  // Se hace async para replicar el patrón de AsyncStorage
  const logOut = async () => {
    setIsLoggedIn(false);
    setUser(null);
    storeAuthState({ isLoggedIn: false, user: null });

    // Simula clearAuthSession eliminando la clave de sesión
    localStorage.removeItem("auth-session"); 

    router.replace("/login"); // Redirige a la página de inicio de sesión
  };

  // Efecto para cargar el estado de autenticación desde localStorage al montar el componente
  useEffect(() => {
    const getAuthFromStorage = async () => { // Se hace async para replicar el patrón de AsyncStorage
      try {
        // await no es estrictamente necesario para localStorage, pero se mantiene el patrón asíncrono
        const value = localStorage.getItem(authStorageKey);
        if (value !== null) {
          const auth = JSON.parse(value);
          setIsLoggedIn(auth.isLoggedIn);
          setUser(auth.user || null);
        }
      } catch (error) {
        console.error("Error al obtener el estado de autenticación de localStorage:", error);
      }
      setIsReady(true); // Marca el contexto como listo una vez que se ha intentado cargar el estado
    };

    getAuthFromStorage();
  }, []); // Se ejecuta solo una vez al montar el componente

  // El useEffect para SplashScreen.hideAsync() se elimina ya que no aplica a web.
  // Si necesitas alguna lógica similar para "ocultar" una pantalla de carga inicial en web,
  // tendrías que implementarla de forma diferente (ej. con CSS o un componente de carga).

  return (
    <AuthContext.Provider value={{ isLoggedIn, isReady, user, logIn, logOut }}>
      {children}
    </AuthContext.Provider>
  );
}
