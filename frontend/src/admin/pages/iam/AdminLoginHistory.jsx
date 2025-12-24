// src/admin/pages/iam/AdminLoginHistory.jsx
import React, { useEffect, useState } from "react";
import adminApi from "../../../admin/adminApi";

export default function AdminLoginHistory() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- Normalize backend fields so UI never breaks ---
  const normalize = (r) => ({
    id: r.id,
    email: r.email || r.admin_email || "unknown",
    ip: r.ip || r.client_ip || "unknown",
    user_agent: r.user_agent || r.ua || "unknown",
    success: Boolean(r.success),
    created_at: r.created_at || r.timestamp || null,
  });

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await adminApi.get("/admin/login-history"); // final route
      const raw = Array.isArray(res.data) ? res.data : [];
      setRows(raw.map(normalize));
    } catch (err) {
      console.error("Login history error:", err);
      alert("Failed to load login history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div style={{ padding: 24, color: "white" }}>
      <h1
        style={{
          fontSize: 28,
          marginBottom: 18,
          fontWeight: 900,
          background: "linear-gradient(90deg,#ffcd8a,#ff9a3c,#ff6a00)",
          WebkitBackgroundClip: "text",
          color: "transparent",
        }}
      >
        Admin Login History
      </h1>

      {loading ? (
        <div style={{ opacity: 0.7 }}>Loading…</div>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            color: "white",
            background: "rgba(255,255,255,0.03)",
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          <thead>
            <tr style={{ background: "#ff7b00", color: "#000", fontWeight: 700 }}>
              <th style={{ padding: 10 }}>Email</th>
              <th style={{ padding: 10 }}>IP</th>
              <th style={{ padding: 10 }}>User Agent</th>
              <th style={{ padding: 10 }}>Success</th>
              <th style={{ padding: 10 }}>Timestamp</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((r) => (
              <tr
                key={r.id}
                style={{
                  borderBottom: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.04)",
                }}
              >
                <td style={{ padding: 10 }}>{r.email}</td>
                <td style={{ padding: 10 }}>{r.ip}</td>

                <td
                  style={{
                    padding: 10,
                    maxWidth: 350,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {r.user_agent}
                </td>

                <td style={{ padding: 10 }}>{r.success ? "✅" : "❌"}</td>

                <td style={{ padding: 10 }}>
                  {r.created_at
                    ? new Date(r.created_at).toLocaleString()
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
