// src/components/Navbar.jsx
import React, { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X, LogOut, PlusCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { adminTokenStore } from "../utils/adminTokenStore";

const SUPERADMIN_EMAIL = "sarthaknagave7@gmail.com";

// Safe decode wrapper
function safeDecode() {
  try {
    return adminTokenStore.decode();
  } catch {
    return null;
  }
}

function PremiumLogo({ size = 58 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 20,
        position: "relative",
        background: "rgba(255,255,255,0.05)",
        backdropFilter: "blur(14px)",
        border: "1px solid rgba(255,255,255,0.12)",
        boxShadow:
          "0 8px 32px rgba(0,0,0,0.4), 0 0 22px rgba(124,92,255,0.55), inset 0 0 18px rgba(255,255,255,0.15)",
        animation: "floatUp 4s ease-in-out infinite",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <svg
        width={size * 0.45}
        height={size * 0.45}
        viewBox="0 0 60 60"
        style={{
          zIndex: 10,
          filter:
            "drop-shadow(0 0 6px rgba(255,255,255,0.9)) drop-shadow(0 0 10px rgba(124,92,255,0.7))",
        }}
      >
        <polygon points="20,15 45,30 20,45" fill="white" />
      </svg>

      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
          100% { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  // -------------------------------------------------
  // FINAL ADMIN DETECTION (SUPERADMIN + BACKEND ADMIN)
  // -------------------------------------------------
  useEffect(() => {
    const check = () => {
      const token = adminTokenStore.get();
      const decoded = token ? safeDecode() : null;

      // backend token = admin
      const hasAdminToken = Boolean(decoded);

      // superadmin Google login = admin
      const superAdminViaGoogle = user?.email === SUPERADMIN_EMAIL;

      setIsAdmin(hasAdminToken || superAdminViaGoogle);
    };

    check();

    window.addEventListener("storage", check);
    return () => window.removeEventListener("storage", check);
  }, [user]);

  return (
    <header
      className="navbar"
      style={{
        background: "rgba(0,0,0,0.35)",
        backdropFilter: "blur(8px)",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      <div
        className="container navbar-inner"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <Link to="/" className="brand" style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <PremiumLogo size={58} />
          <div>
            <span
              style={{
                fontSize: 26,
                fontWeight: 800,
                background:
                  "linear-gradient(90deg,#ffffff,#ffdfb8,#ff9c45,#ff7b00)",
                WebkitBackgroundClip: "text",
                color: "transparent",
              }}
            >
              GramTeach
              <span
                style={{
                  background: "linear-gradient(90deg,#ff8800,#ff5500)",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                }}
              >
                .AI
              </span>
            </span>
            <div style={{ fontSize: 13, opacity: 0.85 }}>Teach. Train. Transform.</div>
          </div>
        </Link>

        {/* DESKTOP NAV */}
        <nav className="nav-links hide-sm" style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <NavLink to="/motivational" className="nav-item">Life Skills</NavLink>
          <NavLink to="/basic-skills" className="nav-item">Basic Skills</NavLink>
          <NavLink to="/packages" className="nav-item">Packages</NavLink>
          <NavLink to="/profile" className="nav-item">Profile</NavLink>
          <NavLink to="/dashboard" className="nav-item">Dashboard</NavLink>

          <Link to="/create" className="btn btn-primary">
            <PlusCircle size={16} /> Create
          </Link>

          {/* ⭐ ADMIN BUTTON ⭐ */}
          {isAdmin && (
            <NavLink
              to="/admin/dashboard"
              className="nav-item"
              style={{ color: "#ff7b00", fontWeight: 700 }}
            >
              Admin
            </NavLink>
          )}

          {user && (
            <button onClick={logout} className="btn btn-outline logout-btn">
              <LogOut size={14} /> Logout
            </button>
          )}
        </nav>

        <button className="nav-toggle md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* MOBILE MENU */}
      {open && (
        <div className="mobile-menu" style={{ padding: 12 }}>
          <NavLink to="/motivational" onClick={() => setOpen(false)} className="nav-item">Life Skills</NavLink>
          <NavLink to="/basic-skills" onClick={() => setOpen(false)} className="nav-item">Basic Skills</NavLink>
          <NavLink to="/packages" onClick={() => setOpen(false)} className="nav-item">Packages</NavLink>
          <NavLink to="/profile" onClick={() => setOpen(false)} className="nav-item">Profile</NavLink>
          <NavLink to="/dashboard" onClick={() => setOpen(false)} className="nav-item">Dashboard</NavLink>

          <Link to="/create" onClick={() => setOpen(false)} className="btn btn-primary">
            <PlusCircle size={16} /> Create Lesson
          </Link>

          {/* ⭐ ADMIN LINK (MOBILE) ⭐ */}
          {isAdmin && (
            <NavLink
              to="/admin/dashboard"
              onClick={() => setOpen(false)}
              className="nav-item"
              style={{ color: "#ff7b00", fontWeight: 700 }}
            >
              Admin
            </NavLink>
          )}

          {user && (
            <button
              onClick={() => { logout(); setOpen(false); }}
              className="btn btn-outline"
            >
              <LogOut size={14} /> Logout
            </button>
          )}
        </div>
      )}
    </header>
  );
}
