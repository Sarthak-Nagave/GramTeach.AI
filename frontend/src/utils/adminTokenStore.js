// src/utils/adminTokenStore.js

const KEY = "admin_token";

export const adminTokenStore = {
  // Save token
  set(token) {
    if (!token) return;
    localStorage.setItem(KEY, token);
  },

  // Get raw token
  get() {
    return localStorage.getItem(KEY);
  },

  // Remove token
  clear() {
    localStorage.removeItem(KEY);
  },

  // Decode JWT payload safely
  decode() {
    try {
      const token = localStorage.getItem(KEY);
      if (!token) return null;

      const parts = token.split(".");
      if (parts.length !== 3) return null;

      let base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
      while (base64.length % 4 !== 0) base64 += "=";

      const decoded = JSON.parse(atob(base64));
      return decoded;
    } catch {
      return null;
    }
  },

  // Shortcut
  getDecoded() {
    return this.decode();
  },

  // ✅ Check if token exists AND not expired
  isValid() {
    const d = this.decode();
    if (!d) return false;

    // exp is in seconds
    if (d.exp && Date.now() >= d.exp * 1000) {
      // 🔥 auto cleanup if expired
      this.clear();
      return false;
    }

    return true;
  },

  // ✅ Check if user is SUPERADMIN (only if valid)
  isSuperAdmin() {
    if (!this.isValid()) return false;
    const d = this.decode();
    return Boolean(d?.is_superadmin);
  },
};
