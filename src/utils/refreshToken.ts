// utils/refreshToken.ts
import axios from "axios";
import { getAuthSession, saveAuthSession  } from "./authStorage";

const API_URL = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`
  : "http://localhost:3000/api/auth/refresh-token";

let refreshPromise: Promise<string | null> | null = null;

export async function getValidToken(): Promise<string | null> {
  const session = await getAuthSession();

  if (!session) return null;

  const now = Date.now();

  if (now >= session.expiresAt) {
    if (!refreshPromise) {
      refreshPromise = (async () => {
        try {
          const response = await axios.post(API_URL, {
            refreshToken: session.refreshToken,
          });

          const { token, refreshToken, expiresIn } = response.data;
          const refreshedAt = Date.now();

          const newSession = {
            token,
            refreshToken,
            expiresAt: refreshedAt + parseInt(expiresIn, 10) * 1000,
          };

          saveAuthSession(newSession);
          return token;
        } catch (error) {
          console.log("Error al refrescar el token", error);
          return null;
        } finally {
          refreshPromise = null;
        }
      })();
    }

    return refreshPromise;
  }

  return session.token;
}
