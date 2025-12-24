// src/admin/pages/AdminLogin.jsx
import React, { useEffect, useState } from "react";
import adminApi from "../adminApi";
import { adminTokenStore } from "../../utils/adminTokenStore";
import { useNavigate } from "react-router-dom";

import { Shield, Mail, Lock, LogIn } from "lucide-react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false); // 🔑 prevents flash

  const navigate = useNavigate();

  /* ======================================================
     CHECK EXISTING ADMIN SESSION (ONCE, SAFE)
  ====================================================== */
  useEffect(() => {
    if (adminTokenStore.isValid()) {
      navigate("/admin/dashboard", { replace: true });
      return;
    }

    setChecked(true);
  }, [navigate]);

  /* ======================================================
     LOGIN HANDLER (SINGLE SOURCE OF TRUTH)
  ====================================================== */
  const login = async (e) => {
    e.preventDefault();
    if (!email || !pw) return alert("Email and password required");

    try {
      setLoading(true);

      const res = await adminApi.post("/admin/iam/login", {
        email,
        password: pw,
      });

      const token = res?.data?.access_token;
      if (!token) {
        throw new Error("No token returned from server");
      }

      // ✅ SAVE TOKEN
      adminTokenStore.set(token);

      // ✅ REDIRECT TO NORMAL ADMIN DASHBOARD ONLY
      navigate("/admin/dashboard", { replace: true });

    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message;
      alert("Login failed: " + msg);
    } finally {
      setLoading(false);
    }
  };

  /* ======================================================
     STYLES
  ====================================================== */
  const wrapper = {
    width: "100vw",
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "radial-gradient(circle at center, #1b130f, #0a0706 70%, #000)",
    padding: "20px",
  };

  const card = {
    width: "100%",
    maxWidth: "480px",
    padding: "40px",
    borderRadius: "26px",
    background: "rgba(20, 17, 15, 0.92)",
    border: "1px solid rgba(255,140,0,0.25)",
    backdropFilter: "blur(18px)",
    boxShadow: "0 0 45px rgba(255,140,0,0.25)",
  };

  const inputBox = {
    width: "100%",
    padding: "14px 14px 14px 46px",
    background: "#1c1a18",
    border: "1px solid #2a2623",
    borderRadius: "12px",
    color: "white",
    outline: "none",
    fontSize: "15px",
  };

  /* ======================================================
     PREVENT RENDER UNTIL TOKEN CHECK
  ====================================================== */
  if (!checked) return null;

  /* ======================================================
     RENDER
  ====================================================== */
  return (
    <div style={wrapper}>
      <div style={card}>
        {/* HEADER */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: "20px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              width: "82px",
              height: "82px",
              borderRadius: "22px",
              background: "rgba(255,140,0,0.12)",
              border: "1.5px solid rgba(255,140,0,0.45)",
              boxShadow:
                "0 0 22px rgba(255,140,0,0.35), 0 0 55px rgba(255,140,0,0.15)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Shield size={46} color="#ff8c00" strokeWidth={2.4} />
          </div>

          <div>
            <h1
              style={{
                fontSize: "36px",
                color: "#fff",
                fontWeight: "800",
                letterSpacing: "-0.5px",
              }}
            >
              Admin Login
            </h1>
            <p
              style={{
                color: "#b8b8b8",
                fontSize: "14px",
                marginTop: "6px",
              }}
            >
              Secure access to GramTeach.AI administration
            </p>
          </div>
        </div>

        {/* FORM */}
        <form
          onSubmit={login}
          style={{ display: "flex", flexDirection: "column", gap: "26px" }}
        >
          {/* EMAIL */}
          <div>
            <label
              style={{
                color: "#d0d0d0",
                fontSize: "14px",
                marginBottom: "6px",
                display: "block",
              }}
            >
              Admin Email
            </label>

            <div style={{ position: "relative" }}>
              <Mail
                size={18}
                style={{
                  position: "absolute",
                  top: "14px",
                  left: "14px",
                  color: "#777",
                }}
              />
              <input
                type="email"
                autoComplete="email"
                placeholder="Enter admin email"
                style={inputBox}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div>
            <label
              style={{
                color: "#d0d0d0",
                fontSize: "14px",
                marginBottom: "6px",
                display: "block",
              }}
            >
              Password
            </label>

            <div style={{ position: "relative" }}>
              <Lock
                size={18}
                style={{
                  position: "absolute",
                  top: "14px",
                  left: "14px",
                  color: "#777",
                }}
              />
              <input
                type="password"
                autoComplete="current-password"
                placeholder="Enter password"
                style={inputBox}
                value={pw}
                onChange={(e) => setPw(e.target.value)}
              />
            </div>
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px 0",
              borderRadius: "12px",
              background: "linear-gradient(90deg, #ff7a1a, #ff5100)",
              color: "white",
              fontWeight: "600",
              fontSize: "16px",
              border: "none",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "10px",
              cursor: "pointer",
              opacity: loading ? 0.6 : 1,
            }}
          >
            <LogIn size={20} />
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            marginTop: "20px",
            fontSize: "12px",
            color: "#bbb",
          }}
        >
          Powered by{" "}
          <span style={{ color: "#ff8c00", fontWeight: 600 }}>
            GramTeach.AI IAM Security
          </span>
        </p>
      </div>
    </div>
  );
}
