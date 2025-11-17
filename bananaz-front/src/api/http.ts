import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL as string;

export const api = axios.create({
  baseURL,
});

// Helper to get current username (stored by AuthContext)
function getCurrentUserName(): string | null {
  return localStorage.getItem("userName");
}

// Add X-User-Name header automatically for protected endpoints
api.interceptors.request.use((config) => {
  const userName = getCurrentUserName();
  if (userName) {
    config.headers = config.headers ?? {};
    config.headers["X-User-Name"] = userName;
  }
  return config;
});
