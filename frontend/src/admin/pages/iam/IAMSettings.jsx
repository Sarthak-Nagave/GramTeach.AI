// src/admin/pages/iam/IAMSettings.jsx
import React, { useEffect, useState } from "react";
import adminApi from "../../../admin/adminApi";
import { Save, ShieldCheck, Lock, Globe } from "lucide-react";

export default function IAMSettings() {
  const [settings, setSettings] = useState({
    password_min_length: 8,
    password_require_numbers: true,
    password_require_symbols: true,
    max_sessions_per_admin: 3,
    enable_2fa: false,
    allowed_ips: "",
  });

  const [loading, setLoading] = useState(false);

  // ------------------------------------------
  // SAFE NORMALIZATION (prevents UI crash)
  // ------------------------------------------
  const normalize = (obj = {}) => ({
    password_min_length: Number(obj.password_min_length ?? 8),
    password_require_numbers: Boolean(obj.password_require_numbers),
    password_require_symbols: Boolean(obj.password_require_symbols),
    max_sessions_per_admin: Number(obj.max_sessions_per_admin ?? 3),
    enable_2fa: Boolean(obj.enable_2fa),
    allowed_ips: obj.allowed_ips ?? "",
  });

  // ------------------------------------------
  // LOAD SETTINGS ONCE
  // ------------------------------------------
  const loadSettings = async () => {
    try {
      const res = await adminApi.get("/admin/iam/settings");
      if (res?.data) setSettings(normalize(res.data));
    } catch (err) {
      console.error("Failed to load IAM settings", err);
    }
  };

  // ------------------------------------------
  // SAVE SETTINGS
  // ------------------------------------------
  const saveSettings = async () => {
    try {
      setLoading(true);

      const payload = {
        ...settings,
        password_min_length: Number(settings.password_min_length),
        max_sessions_per_admin: Number(settings.max_sessions_per_admin),
        allowed_ips: settings.allowed_ips.trim(),
      };

      await adminApi.post("/admin/iam/settings", payload);
      alert("Settings saved successfully!");

    } catch (err) {
      console.error("Save error:", err);
      alert("Failed to save IAM settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings(); // only once
  }, []);

  // ------------------------------------------
  // STYLES
  // ------------------------------------------
  const card = {
    padding: 20,
    borderRadius: 14,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.10)",
    marginBottom: 24,
  };

  const label = {
    fontWeight: 600,
    marginBottom: 6,
    display: "block",
  };

  const input = {
    padding: 10,
    width: "100%",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.07)",
    color: "white",
    marginBottom: 12,
  };

  return (
    <div style={{ padding: 24, color: "white" }}>
      <h1
        style={{
          fontSize: 34,
          fontWeight: 900,
          background: "linear-gradient(90deg,#ffcd8a,#ff9a3c,#ff6a00)",
          WebkitBackgroundClip: "text",
          color: "transparent",
          marginBottom: 28,
        }}
      >
        Security & IAM Settings
      </h1>

      {/* PASSWORD POLICY */}
      <div style={card}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16 }}>
          <Lock color="#ffa24a" size={20} />
          <h2 style={{ fontSize: 22 }}>Password Policy</h2>
        </div>

        <label style={label}>Minimum Password Length</label>
        <input
          type="number"
          min={4}
          style={input}
          value={settings.password_min_length}
          autoComplete="off"
          onChange={(e) =>
            setSettings({ ...settings, password_min_length: Number(e.target.value) })
          }
        />

        <label style={label}>
          <input
            type="checkbox"
            checked={settings.password_require_numbers}
            onChange={(e) =>
              setSettings({ ...settings, password_require_numbers: e.target.checked })
            }
          />{" "}
          Require Numbers
        </label>

        <label style={label}>
          <input
            type="checkbox"
            checked={settings.password_require_symbols}
            onChange={(e) =>
              setSettings({ ...settings, password_require_symbols: e.target.checked })
            }
          />{" "}
          Require Symbols
        </label>
      </div>

      {/* SESSION POLICY */}
      <div style={card}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16 }}>
          <ShieldCheck color="#ff7b00" size={20} />
          <h2 style={{ fontSize: 22 }}>Session Policy</h2>
        </div>

        <label style={label}>Max Sessions per Admin</label>
        <input
          type="number"
          min={1}
          style={input}
          value={settings.max_sessions_per_admin}
          autoComplete="off"
          onChange={(e) =>
            setSettings({ ...settings, max_sessions_per_admin: Number(e.target.value) })
          }
        />

        <label style={label}>
          <input
            type="checkbox"
            checked={settings.enable_2fa}
            onChange={(e) => setSettings({ ...settings, enable_2fa: e.target.checked })}
          />{" "}
          Enable 2-Factor Authentication (2FA)
        </label>
      </div>

      {/* IP WHITELIST */}
      <div style={card}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16 }}>
          <Globe color="#ff5e3a" size={20} />
          <h2 style={{ fontSize: 22 }}>IP Whitelist</h2>
        </div>

        <label style={label}>Allowed IPs (comma separated)</label>

        <textarea
          style={{ ...input, height: 120, resize: "vertical" }}
          value={settings.allowed_ips}
          autoComplete="off"
          onChange={(e) => setSettings({ ...settings, allowed_ips: e.target.value })}
        />
      </div>

      {/* SAVE BUTTON */}
      <button
        onClick={saveSettings}
        disabled={loading}
        style={{
          padding: "12px 26px",
          borderRadius: 12,
          background: "linear-gradient(90deg,#ff9a3c,#ff6a00)",
          border: "none",
          cursor: "pointer",
          fontWeight: 700,
          fontSize: 16,
          color: "black",
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          opacity: loading ? 0.7 : 1,
        }}
      >
        <Save size={20} />
        {loading ? "Saving…" : "Save Settings"}
      </button>
    </div>
  );
}
