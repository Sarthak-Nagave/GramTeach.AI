// src/admin/pages/iam/AdminActivityLogs.jsx
import React, { useEffect, useState } from "react";
import adminApi from "../../../admin/adminApi";

export default function AdminActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  // Normalize log fields to prevent breaking UI
  const normalize = (log) => ({
    id: log.id,
    action: log.action || "Unknown Action",
    meta: log.meta || log.metadata || {},
    created_at: log.created_at || log.timestamp || null,
  });

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await adminApi.get("/admin/activity"); // FINAL correct route
      const raw = Array.isArray(res.data) ? res.data : [];
      setLogs(raw.map(normalize));
    } catch (err) {
      console.error("Activity logs error:", err);
      alert("Failed to load activity logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
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
        Admin Activity Logs
      </h1>

      {loading ? (
        <div style={{ opacity: 0.7 }}>Loading…</div>
      ) : (
        <div style={{ marginTop: 12 }}>
          {logs.map((log) => (
            <div
              key={log.id}
              style={{
                padding: 16,
                marginBottom: 14,
                background: "rgba(255,255,255,0.05)",
                borderLeft: "4px solid #ff7b00",
                borderRadius: 10,
              }}
            >
              {/* ACTION TEXT */}
              <div style={{ fontSize: 17, fontWeight: 700 }}>
                {log.action}
              </div>

              {/* META JSON */}
              <pre
                style={{
                  background: "rgba(0,0,0,0.35)",
                  padding: 12,
                  borderRadius: 8,
                  marginTop: 8,
                  fontSize: 13,
                  whiteSpace: "pre-wrap",
                }}
              >
                {JSON.stringify(log.meta, null, 2)}
              </pre>

              {/* TIMESTAMP */}
              <div
                style={{
                  marginTop: 6,
                  fontSize: 12,
                  opacity: 0.6,
                }}
              >
                {log.created_at
                  ? new Date(log.created_at).toLocaleString()
                  : "—"}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
