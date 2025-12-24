// src/admin/adminApi.js
import axios from "axios";
import { adminTokenStore } from "../utils/adminTokenStore";

// ------------------------------------------------------------------
// AXIOS INSTANCE
// ------------------------------------------------------------------
const adminApi = axios.create({
  baseURL: "http://localhost:8000",
  withCredentials: false,
});

// ------------------------------------------------------------------
// REQUEST INTERCEPTOR
// → Send JSON + admin JWT ONLY IF VALID
// ------------------------------------------------------------------
adminApi.interceptors.request.use(
  (config) => {
    config.headers["Content-Type"] = "application/json";

    if (adminTokenStore.isValid()) {
      config.headers["Authorization"] =
        `Bearer ${adminTokenStore.get()}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ------------------------------------------------------------------
// RESPONSE INTERCEPTOR
// → DO NOT mutate auth state here
// ------------------------------------------------------------------
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url || "";

    // Ignore auto-login failures
    if (url.includes("/admin/iam/auto-login")) {
      console.warn("Auto-login failed → ignoring");
      return Promise.reject(error);
    }

    // 🔥 401 means token invalid/expired
    // ❌ DO NOT clear token here
    // ❌ DO NOT redirect here
    if (status === 401) {
      console.warn("⚠️ Admin API returned 401 (handled by route guards)");
    }

    return Promise.reject(error);
  }
);

export default adminApi;
