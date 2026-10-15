import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://54.211.170.107:3000/api",
  timeout: 10000,
});

export default api;