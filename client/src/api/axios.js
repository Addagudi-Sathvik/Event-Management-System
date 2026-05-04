import axios from "axios";

const apiRootUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
const apiBaseUrl = apiRootUrl?.endsWith("/api") ? apiRootUrl : `${apiRootUrl}/api`;

const api = axios.create({
  baseURL: apiBaseUrl,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
