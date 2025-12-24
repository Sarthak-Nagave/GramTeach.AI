// src/admin/pages/iam/AdminSessions.jsx
import React, { useEffect, useState } from "react";
import adminApi from "../../../admin/adminApi";
import { Trash2, RefreshCw, MonitorSmartphone } from "lucide-react";

export default function AdminSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Normalize inconsistent backend field names
  const normalizeSession = (s) => ({
    id: s.id,
    admin_email: s.admin_email || s.email || s.user || "unknown",
    ip: s.ip || s.client_ip || s.ip_addr || "unknown",
    ua: s.ua || s.user_agent || s.userAgent || "unknown",
    created_at: s.created_at || s.login_at || s.created || null,
    expires_at: s.expires_at || s.expires || s.expiry || null,
  });

  // Load sessions
  const loadSessions = async () => {
    setLoading(true);
    try {
      const res = await adminApi.get("/admin/sessions");
      const raw = Array.isArray(res.data) ? res.data : [];
      setSessions(raw.map(normalizeSession));
    } catch (err) {
      console.error("Failed loading sessions:", err);
      alert("Failed to load sessions");
    } finally {
      setLoading(false);
    }
  };

  // Revoke session
  const revokeSession = async (id) => {
    if (!confirm("Force logout this session?")) return;

    try {
      await adminApi.delete(`/admin/sessions/${id}`);

      // Optimistically remove from UI
      setSessions((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error("Failed to revoke session:", err);
      alert("Failed to revoke session");
      loadSessions(); // fallback reload
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const tableStyle = {
    width: "100%",
    color: "white",
    borderCollapse: "collapse",
  };

  const thStyle = {
    padding: "12px 10px",
    background: "rgba(255,255,255,0.07)",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    textAlign: "left",
  };

  const tdStyle = {
    padding: "10px 8px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  };

  return (
    <div style={{ padding: 24, color: "white" }}>
      <h1
        style={{
          fontSize: 32,
          marginBottom: 14,
          fontWeight: 900,
          background: "linear-gradient(90deg,#ffcd8a,#ff9a3c,#ff6a00)",
          WebkitBackgroundClip: "text",
          color: "transparent",
        }}
      >
        Active Sessions
      </h1>

      {/* Refresh Row */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
        <button
          onClick={loadSessions}
          style={{
            padding: "8px 14px",
            borderRadius: 10,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "white",
            display: "flex",
            alignItems: "center",
            gap: 8,
            cursor: "pointer",
          }}
        >
          <RefreshCw size={16} /> Refresh
        </button>

        {loading && <div style={{ opacity: 0.8 }}>Loading…</div>}
      </div>

      {/* No sessions */}
      {!loading && sessions.length === 0 && (
        <div style={{ opacity: 0.7 }}>No active admin sessions found.</div>
      )}

      {/* Table */}
      {!loading && sessions.length > 0 && (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Admin</th>
              <th style={thStyle}>IP</th>
              <th style={thStyle}>Device</th>
              <th style={thStyle}>Login Time</th>
              <th style={thStyle}>Expires</th>
              <th style={thStyle}></th>
            </tr>
          </thead>

          <tbody>
            {sessions.map((s) => (
              <tr key={s.id}>
                <td style={tdStyle}>{s.admin_email}</td>
                <td style={tdStyle}>{s.ip}</td>

                <td style={tdStyle}>
                  <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
                    <MonitorSmartphone size={16} />
                    <span
                      style={{
                        maxWidth: 300,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "inline-block",
                      }}
                    >
                      {s.ua}
                    </span>
                  </span>
                </td>

                <td style={tdStyle}>
                  {s.created_at ? new Date(s.created_at).toLocaleString() : "—"}
                </td>

                <td style={tdStyle}>
                  {s.expires_at ? new Date(s.expires_at).toLocaleString() : "—"}
                </td>

                <td style={tdStyle}>
                  <button
                    onClick={() => revokeSession(s.id)}
                    style={{
                      background: "linear-gradient(90deg,#ff4d4d,#ff0000)",
                      border: "none",
                      padding: "6px 10px",
                      borderRadius: 8,
                      cursor: "pointer",
                      color: "white",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Trash2 size={14} /> Logout
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
