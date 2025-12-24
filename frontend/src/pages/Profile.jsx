// src/pages/Profile.jsx
import React from "react";
import { useAuth } from "../context/AuthContext";
import { LogOut } from "lucide-react";

export default function Profile() {
  const { user, logout } = useAuth();

  return (
    <div
      style={{
        minHeight: "100vh",
        paddingTop: 60,
        background: "#1a0f0a",
        color: "#fff",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      {/* PROFILE CARD */}
      <div
        style={{
          width: "90%",
          maxWidth: 900,
          padding: 40,
          borderRadius: 30,
          background: "rgba(255, 255, 255, 0.06)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow:
            "0 0 45px rgba(255,120,40,0.25), 0 0 80px rgba(255,120,40,0.15)",
          transform: "translateY(20px)",
          animation: "fadeIn 0.6s ease-out",
        }}
      >
        {/* Page Title */}
        <h1
          style={{
            fontSize: 42,
            fontWeight: 800,
            marginBottom: 20,
            textShadow: "0 0 14px rgba(255,140,0,0.7)",
          }}
        >
          My Profile
        </h1>

        <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
          {/* Avatar Circle */}
          <div
            style={{
              width: 110,
              height: 110,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.28)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: 48,
              fontWeight: 700,
              textTransform: "uppercase",
              boxShadow: "0 0 20px rgba(255,255,255,0.3)",
            }}
          >
            {user?.displayName?.[0] || "U"}
          </div>

          {/* User Info */}
          <div>
            <div style={{ fontSize: 28, fontWeight: 700 }}>
              {user?.displayName || "User"}
            </div>

            <div style={{ fontSize: 18, opacity: 0.9, marginTop: 4 }}>
              {user?.email}
            </div>

            <div style={{ fontSize: 14, opacity: 0.6, marginTop: 6 }}>
              UID: {user?.uid?.slice(0, 12)}...
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          style={{
            marginTop: 30,
            padding: "12px 22px",
            borderRadius: 12,
            background: "rgba(255,70,70,0.15)",
            border: "1px solid rgba(255,70,70,0.4)",
            color: "#ff6b6b",
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            cursor: "pointer",
            fontWeight: 600,
            boxShadow: "0 0 14px rgba(255,60,60,0.4)",
            transition: "0.2s",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.background = "rgba(255,70,70,0.25)")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.background = "rgba(255,70,70,0.15)")
          }
        >
          <LogOut size={18} />
          Logout
        </button>

        {/* Glow Animation */}
        <style>
          {`
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(40px); }
              to { opacity: 1; transform: translateY(20px); }
            }
          `}
        </style>
      </div>
    </div>
  );
}
