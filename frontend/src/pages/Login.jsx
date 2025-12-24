// src/pages/Login.jsx
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Chrome, Phone } from "lucide-react";
import { adminTokenStore } from "../utils/adminTokenStore";

const ADMIN_EMAIL = "jr4692638@gmail.com";

export default function Login() {
  const navigate = useNavigate();
  const { login, loginWithGoogle, sendPhoneOTP, verifyPhoneOTP } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);

  // --------------------------------------
  // EMAIL LOGIN  (ADMIN AUTO-REDIRECT)
  // --------------------------------------
  const submitEmail = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await login(email, password);

      if (user?.email === ADMIN_EMAIL) {
        adminTokenStore.set("yes");
        navigate("/admin/dashboard", { replace: true });
        return;
      }

      navigate("/dashboard", { replace: true });
    } catch (err) {
      alert("Login failed: " + (err?.message || ""));
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------
  // GOOGLE LOGIN  (ADMIN AUTO-REDIRECT)
  // --------------------------------------
  const handleGoogle = async () => {
    setLoading(true);
    try {
      const user = await loginWithGoogle();

      if (user?.email === ADMIN_EMAIL) {
        adminTokenStore.set("yes");
        navigate("/admin/dashboard", { replace: true });
        return;
      }

      navigate("/dashboard", { replace: true });
    } catch (err) {
      alert("Google login failed: " + (err?.message || ""));
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------
  // SEND OTP
  // --------------------------------------
  const handleSendOTP = async () => {
    if (!phone) return alert("Enter phone like +91xxxxxxxxxx");
    setLoading(true);
    try {
      await sendPhoneOTP(phone);
      setOtpSent(true);
      alert("OTP sent");
    } catch (err) {
      alert("OTP send failed: " + err?.message);
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------
  // VERIFY OTP (ADMIN AUTO-REDIRECT)
  // --------------------------------------
  const handleVerifyOTP = async () => {
    if (!otpCode) return alert("Enter OTP");
    setLoading(true);
    try {
      const user = await verifyPhoneOTP(otpCode);

      if (user?.email === ADMIN_EMAIL) {
        adminTokenStore.set("yes");
        navigate("/admin/dashboard", { replace: true });
        return;
      }

      navigate("/dashboard", { replace: true });
    } catch (err) {
      alert("OTP verify failed: " + err?.message);
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------------------------------

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #0d0806, #1a120f)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          background: "rgba(20, 14, 10, 0.85)",
          borderRadius: 18,
          padding: "36px 32px",
          boxShadow: "0 0 25px rgba(255, 140, 0, 0.45)",
          border: "1px solid rgba(255,140,0,0.3)",
          backdropFilter: "blur(6px)",
        }}
      >
        <h1
          style={{
            fontSize: 40,
            fontWeight: 800,
            marginBottom: 22,
            color: "white",
            textShadow: "0 0 15px rgba(255,140,0,0.9)",
          }}
        >
          Login
        </h1>

        {/* EMAIL LOGIN */}
        <form onSubmit={submitEmail}>
          <label style={{ color: "#ffa96a", fontSize: 14, fontWeight: 600 }}>
            Email
          </label>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "#1c1613",
              border: "1px solid #3a2b22",
              padding: "12px 14px",
              borderRadius: 10,
              marginTop: 6,
            }}
          >
            <Mail size={18} color="#ff9b50" />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                background: "transparent",
                color: "white",
                fontSize: 15,
              }}
            />
          </div>

          <label
            style={{
              color: "#ffa96a",
              fontSize: 14,
              fontWeight: 600,
              marginTop: 16,
              display: "block",
            }}
          >
            Password
          </label>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "#1c1613",
              border: "1px solid #3a2b22",
              padding: "12px 14px",
              borderRadius: 10,
              marginTop: 6,
            }}
          >
            <Lock size={18} color="#ff9b50" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password"
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                background: "transparent",
                color: "white",
                fontSize: 15,
              }}
            />
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 22 }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                background: "#ff7b00",
                border: "none",
                padding: "12px 16px",
                borderRadius: 10,
                color: "#fff",
                fontSize: 16,
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 0 12px rgba(255,120,0,0.6)",
              }}
            >
              Login
            </button>

            <button
              type="button"
              onClick={() => {
                setEmail("");
                setPassword("");
              }}
              style={{
                background: "#32241b",
                border: "1px solid #ff9b50",
                padding: "12px 16px",
                borderRadius: 10,
                fontSize: 16,
                fontWeight: 700,
                color: "#ffb78a",
                cursor: "pointer",
              }}
            >
              Reset
            </button>
          </div>
        </form>

        {/* GOOGLE LOGIN */}
        <button
          onClick={handleGoogle}
          disabled={loading}
          style={{
            width: "100%",
            marginTop: 20,
            background: "#1c1613",
            border: "1px solid #ff9b50",
            padding: "12px 16px",
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            color: "#ffb78a",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          <Chrome size={18} /> Google Login
        </button>

        <hr
          style={{
            margin: "26px 0",
            borderColor: "rgba(255,255,255,0.15)",
          }}
        />

        {/* PHONE OTP */}
        <label style={{ color: "#ffa96a", fontSize: 14, fontWeight: 600 }}>
          Phone (OTP)
        </label>

        <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
          <div
            style={{
              flex: 1,
              background: "#1c1613",
              border: "1px solid #3a2b22",
              padding: "12px 14px",
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <Phone size={18} color="#ff9b50" />
            <input
              placeholder="+91xxxxxxxxxx"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                color: "white",
                fontSize: 15,
              }}
            />
          </div>

          {!otpSent ? (
            <button
              onClick={handleSendOTP}
              disabled={loading}
              style={{
                background: "#ff7b00",
                border: "none",
                padding: "12px 14px",
                borderRadius: 10,
                color: "#fff",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Send OTP
            </button>
          ) : (
            <div style={{ display: "flex", gap: 8 }}>
              <input
                placeholder="OTP"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                style={{
                  width: 120,
                  background: "#1c1613",
                  border: "1px solid #3a2b22",
                  padding: "12px 14px",
                  borderRadius: 10,
                  color: "white",
                  outline: "none",
                }}
              />
              <button
                onClick={handleVerifyOTP}
                disabled={loading}
                style={{
                  background: "#ff7b00",
                  border: "none",
                  padding: "12px 14px",
                  borderRadius: 10,
                  color: "#fff",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Verify
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
