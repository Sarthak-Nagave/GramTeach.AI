import React, { useState, useEffect, useRef } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { adminTokenStore } from "../../utils/adminTokenStore";
import AdminFooter from "../components/AdminFooter";

import {
  Home,
  LogOut,
  LayoutDashboard,
  Users,
  Video,
  Folder,
  BarChart3,
  Shield,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";

/* ================= JWT SAFE DECODE ================= */
function decodeJwtSafe(token) {
  try {
    const seg = token?.split(".")[1];
    if (!seg) return null;
    return JSON.parse(atob(seg.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
}

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout: firebaseLogout } = useAuth();

  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [iamOpen, setIamOpen] = useState(false);
  const [showExpiryWarning, setShowExpiryWarning] = useState(false);

  const lastPath = useRef(location.pathname);

  if (location.pathname === "/admin-login") return <Outlet />;

  /* ================= LOAD ROLE + SESSION ================= */
  useEffect(() => {
    const token = adminTokenStore.get();
    const payload = decodeJwtSafe(token);
    setIsSuperAdmin(Boolean(payload?.is_superadmin));

    if (payload?.exp) {
      const diff = payload.exp * 1000 - Date.now();
      if (diff > 0 && diff < 5 * 60 * 1000) {
        setShowExpiryWarning(true);
      }
    }
  }, []);

  /* ✅ CLOSE IAM ONLY WHEN ROUTE ACTUALLY CHANGES */
  useEffect(() => {
    if (lastPath.current !== location.pathname) {
      setIamOpen(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      lastPath.current = location.pathname;
    }
  }, [location.pathname]);

  const goHome = () => navigate("/", { replace: true });

  const logout = () => {
    adminTokenStore.clear();
    firebaseLogout();
    navigate("/", { replace: true });
  };

  /* ================= STYLES ================= */
  const baseNavItem = {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 14px",
    borderRadius: 12,
    fontWeight: 600,
    cursor: "pointer",
    textDecoration: "none",
    transition: "all 0.25s ease",
  };

  const activeNavItem = {
    background: "linear-gradient(90deg,#ff9a3c,#ff6a00)",
    color: "#000",
    boxShadow: "0 0 18px rgba(255,140,0,0.55)",
  };

  const inactiveNavItem = {
    color: "rgba(240,240,240,0.85)",
  };

  const glowBtn = {
    padding: "10px 18px",
    borderRadius: 12,
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: 8,
    border: "none",
    cursor: "pointer",
  };

  return (
    <div className="min-h-screen bg-[#1b130f] flex flex-col">
      {/* ================= GLASS NAVBAR ================= */}
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 95,
          zIndex: 100,
          backdropFilter: "blur(22px)",
          background:
            "linear-gradient(180deg, rgba(25,18,15,0.9), rgba(25,18,15,0.6))",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 14px 40px rgba(0,0,0,0.45)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 34px",
        }}
      >
        {/* LEFT */}
        <div style={{ display: "flex", alignItems: "center", gap: 34 }}>
          {/* LOGO */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div className="logo-3d">
              <svg width={26} height={26} viewBox="0 0 60 60">
                <polygon points="20,15 45,30 20,45" fill="#ff8a2b" />
              </svg>
            </div>

            <div>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 900,
                  background:
                    "linear-gradient(90deg,#ffcd8a,#ff9a3c,#ff6a00)",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                }}
              >
                GramTeach<span style={{ color: "#ff7a1a" }}>.AI</span>
              </div>
              <div style={{ fontSize: 12, color: "#a78bfa" }}>
                Teach. Train. Transform.
              </div>
            </div>
          </div>

          {/* NAV */}
          <nav style={{ display: "flex", gap: 18 }}>
            {[
              ["/admin/dashboard", LayoutDashboard, "Dashboard"],
              ["/admin/users", Users, "Users"],
              ["/admin/lessons", Video, "Lessons"],
              ["/admin/storage", Folder, "Storage"],
              ["/admin/analytics", BarChart3, "Analytics"],
            ].map(([to, Icon, label]) => (
              <NavLink
                key={to}
                to={to}
                style={({ isActive }) => ({
                  ...baseNavItem,
                  ...(isActive ? activeNavItem : inactiveNavItem),
                })}
              >
                <Icon size={18} /> {label}
              </NavLink>
            ))}

            {/* ✅ IAM & SECURITY — FIXED */}
            {isSuperAdmin && (
              <div style={{ position: "relative" }}>
                <div
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIamOpen((prev) => !prev);
                  }}
                  style={{ ...baseNavItem, color: "#ff9a3c" }}
                >
                  <Shield size={18} /> IAM & Security
                  {iamOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </div>

                {iamOpen && (
                  <div
                    onMouseDown={(e) => e.stopPropagation()}
                    style={{
                      position: "absolute",
                      top: 46,
                      left: 0,
                      background: "#1f1916",
                      borderRadius: 16,
                      padding: 12,
                      width: 245,
                      border: "1px solid rgba(255,140,0,0.25)",
                      boxShadow: "0 0 30px rgba(255,140,0,0.35)",
                    }}
                  >
                    {[
                      ["/admin/iam", "IAM Dashboard"],
                      ["/admin/iam/sessions", "Active Sessions"],
                      ["/admin/manage", "Manage Admins"],
                      ["/admin/iam/login-history", "Login History"],
                      ["/admin/iam/activity", "Activity Logs"],
                      ["/admin/iam/settings", "IAM Settings"],
                    ].map(([to, label]) => (
                      <NavLink
                        key={to}
                        to={to}
                        onClick={() => setIamOpen(false)}
                        className="iam-glow-item"
                      >
                        {label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            )}
          </nav>
        </div>

        {/* RIGHT */}
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={goHome} style={{ ...glowBtn, background: "#ff8a2b" }}>
            <Home size={16} /> Home
          </button>

          <button
            onClick={logout}
            style={{ ...glowBtn, background: "#e11d48", color: "#fff" }}
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      {/* SESSION WARNING */}
      {showExpiryWarning && (
        <div
          style={{
            marginTop: 110,
            maxWidth: 600,
            marginInline: "auto",
            background: "#ffedd5",
            padding: 10,
            borderRadius: 10,
            display: "flex",
            gap: 8,
          }}
        >
          <AlertTriangle size={18} /> Session expiring soon.
        </div>
      )}

      {/* CONTENT */}
      <main style={{ paddingTop: 95, flex: 1 }} className="px-10 max-w-7xl mx-auto">
        <Outlet />
      </main>

      <AdminFooter />

      {/* STYLES */}
      <style>{`
        .logo-3d {
          width: 52px;
          height: 52px;
          border-radius: 16px;
          background: rgba(255,255,255,0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: float3d 6s ease-in-out infinite;
          box-shadow: 0 0 22px rgba(255,140,0,0.45);
        }

        @keyframes float3d {
          0% { transform: rotateY(0deg) translateY(0); }
          50% { transform: rotateY(180deg) translateY(-6px); }
          100% { transform: rotateY(360deg) translateY(0); }
        }

        .iam-glow-item {
          display: block;
          padding: 10px 14px;
          border-radius: 12px;
          font-weight: 600;
          color: #a855f7;
          text-decoration: none;
          transition: all 0.25s ease;
        }

        .iam-glow-item:hover {
          background: linear-gradient(
            90deg,
            rgba(255,154,60,0.25),
            rgba(255,106,0,0.35)
          );
          color: #ff9a3c;
          box-shadow: 0 0 18px rgba(255,140,0,0.55);
          transform: translateX(6px);
        }
      `}</style>
    </div>
  );
}
