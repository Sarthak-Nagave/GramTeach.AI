import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "./AuthContext";

const AdminContext = createContext();

export function AdminProvider({ children }) {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminToken, setAdminToken] = useState(null);
  const ADMIN_EMAIL = "sarthaknagave01@gmail.com";

  useEffect(() => {
    async function verifyAdmin() {
      if (!user) return;

      // not admin → never try
      if (user.email !== ADMIN_EMAIL) {
        setIsAdmin(false);
        return;
      }

      try {
        // backend auto-generates admin JWT
        const res = await api.post("/admin/auto-login", {});
        setAdminToken(res.data.access_token);
        setIsAdmin(true);
      } catch (err) {
        console.error("[Admin] Auto-login failed", err);
        setIsAdmin(false);
      }
    }

    verifyAdmin();
  }, [user]);

  return (
    <AdminContext.Provider value={{ isAdmin, adminToken }}>
      {children}
    </AdminContext.Provider>
  );
}

export const useAdmin = () => useContext(AdminContext);
