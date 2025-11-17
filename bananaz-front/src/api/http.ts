import axios from "axios";

const baseURL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  "http://localhost:5274"; // adjust to your backend port

// In-memory current user (no localStorage)
let currentUserName: string | null = null;

export function setCurrentUserName(name: string | null) {
  currentUserName = name;
}

export function getCurrentUserName(): string | null {
  return currentUserName;
}

export const api = axios.create({
  baseURL,
});

// Add X-User-Name header automatically for protected endpoints
api.interceptors.request.use((config) => {
  const userName = currentUserName;
  if (userName) {
    config.headers = config.headers ?? {};
    config.headers["X-User-Name"] = userName;
  }
  return config;
});
