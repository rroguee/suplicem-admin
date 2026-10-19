// utils/refreshToken.ts
import axios from "axios";
import { getAuthSession, saveAuthSession  } from "./authStorage";

const API_URL = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`
  : "https://suplicem-admin.duckdns.org/api/auth/refresh-token";

export async function getValidToken(): Promise<string | null> {
  const session = await getAuthSession();

  if (!session) return null;

  const now = Date.now();

  if (now >= session.expiresAt) {
    try {
      const response = await axios.post(API_URL, {
        refreshToken: session.refreshToken,
      });

      const { token, refreshToken, expiresIn } = response.data;

      const newSession = {
        token,
        refreshToken,
        expiresAt: now + parseInt(expiresIn) * 1000,
      };

      saveAuthSession(newSession);
      return token;
    } catch (error) {
      console.log("Error al refrescar el token", error);
      return null;
    }
  }

  return session.token;
}
