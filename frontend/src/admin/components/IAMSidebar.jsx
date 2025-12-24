// src/admin/components/IAMSidebar.jsx
import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { adminTokenStore } from "../../utils/adminTokenStore";

import {
  Shield,
  KeyRound,
  Users,
  History,
  BarChart2,
  Settings,
} from "lucide-react";

export default function IAMSidebar() {
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    const decoded = adminTokenStore.getDecoded();
    setIsSuperAdmin(Boolean(decoded?.is_superadmin));
  }, []);

  if (!isSuperAdmin) return null;

  /* ---------- BASE LINK STYLE ---------- */
  const baseLinkStyle = {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 14px",
    borderRadius: 10,
    textDecoration: "none",
    fontSize: 15,
    fontWeight: 500,
    transition: "0.25s ease",
  };

  return (
    <aside
      style={{
        width: 240,
        position: "fixed",
        top: 95, // ⬅ exact navbar height
        left: 0,
        height: "calc(100vh - 95px)",
        background: "rgba(25,18,15,0.55)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        borderRight: "1px solid rgba(255,255,255,0.1)",
        padding: "24px 16px",
        zIndex: 40,
      }}
    >
      <h2
        style={{
          fontSize: 18,
          fontWeight: 700,
          marginBottom: 20,
          color: "white",
        }}
      >
        IAM & Security
      </h2>

      <nav style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {/* IAM DASHBOARD */}
        <NavLink
          to="/admin/iam"
          style={({ isActive }) => ({
            ...baseLinkStyle,
            color: isActive ? "black" : "rgba(255,255,255,0.85)",
            background: isActive
              ? "linear-gradient(90deg,#ff9a3c,#ff6a00)"
              : "transparent",
            boxShadow: isActive
              ? "0 6px 18px rgba(255,100,20,0.45)"
              : "none",
            fontWeight: isActive ? 700 : 500,
          })}
        >
          <Shield size={18} color="#ff9a3c" />
          IAM Dashboard
        </NavLink>

        {/* ACTIVE SESSIONS */}
        <NavLink
          to="/admin/iam/sessions"
          style={({ isActive }) => ({
            ...baseLinkStyle,
            color: isActive ? "black" : "rgba(255,255,255,0.85)",
            background: isActive
              ? "linear-gradient(90deg,#ff9a3c,#ff6a00)"
              : "transparent",
          })}
        >
          <KeyRound size={18} />
          Active Sessions
        </NavLink>

        {/* MANAGE ADMINS (FIXED ROUTE) */}
        <NavLink
          to="/admin/manage"
          style={({ isActive }) => ({
            ...baseLinkStyle,
            color: isActive ? "black" : "rgba(255,255,255,0.85)",
            background: isActive
              ? "linear-gradient(90deg,#ff9a3c,#ff6a00)"
              : "transparent",
          })}
        >
          <Users size={18} />
          Manage Admins
        </NavLink>

        {/* LOGIN HISTORY */}
        <NavLink
          to="/admin/iam/login-history"
          style={({ isActive }) => ({
            ...baseLinkStyle,
            color: isActive ? "black" : "rgba(255,255,255,0.85)",
            background: isActive
              ? "linear-gradient(90deg,#ff9a3c,#ff6a00)"
              : "transparent",
          })}
        >
          <History size={18} />
          Login History
        </NavLink>

        {/* ACTIVITY LOGS */}
        <NavLink
          to="/admin/iam/activity"
          style={({ isActive }) => ({
            ...baseLinkStyle,
            color: isActive ? "black" : "rgba(255,255,255,0.85)",
            background: isActive
              ? "linear-gradient(90deg,#ff9a3c,#ff6a00)"
              : "transparent",
          })}
        >
          <BarChart2 size={18} />
          Activity Logs
        </NavLink>

        {/* SETTINGS */}
        <NavLink
          to="/admin/iam/settings"
          style={({ isActive }) => ({
            ...baseLinkStyle,
            color: isActive ? "black" : "rgba(255,255,255,0.85)",
            background: isActive
              ? "linear-gradient(90deg,#ff9a3c,#ff6a00)"
              : "transparent",
          })}
        >
          <Settings size={18} />
          IAM Settings
        </NavLink>
      </nav>
    </aside>
  );
}
