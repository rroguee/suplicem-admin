import { getValidToken } from "@/utils/refreshToken";
import axios from "axios";

const protectedApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://suplicem-admin.duckdns.org/api",
  timeout: 10000,
});

// Interceptor
protectedApi.interceptors.request.use(async (config) => {
  const token = await getValidToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default protectedApi;
