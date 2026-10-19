import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://suplicem-admin.duckdns.org/api",
  timeout: 10000,
});

export default api;