import axios from "axios";
import type { InternalAxiosRequestConfig } from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000/api";
console.log("Vercel Bypass Token:", import.meta.env.VITE_VERCEL_BYPASS_TOKEN);

const client = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
    "x-vercel-protection-bypass": import.meta.env.VITE_VERCEL_BYPASS_TOKEN,
  },
  withCredentials: true,
});

// Attach access token if present
client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // Attach access token to headers in a type-safe way
  const token = (() => {
    try {
      return localStorage.getItem("accessToken");
    } catch {
      return null;
    }
  })();

  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }

  const csrfToken = (() => {
    try {
      return localStorage.getItem("csrfToken");
    } catch {
      return null;
    }
  })();

  if (csrfToken) {
    config.headers.set("x-csrf-token", csrfToken);
  }

  return config;
});

// Handle 401 Unauthorized globally
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token is invalid or expired
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      
      // Redirect to sign-in if not already there
      if (!window.location.pathname.includes("/sign-in")) {
        window.location.href = "/sign-in";
      }
    }
    return Promise.reject(error);
  }
);

export default client;
