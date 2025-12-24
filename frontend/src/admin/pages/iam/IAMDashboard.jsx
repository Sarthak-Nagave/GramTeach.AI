import React, { useEffect, useState, useRef } from "react";
import adminApi from "../../../admin/adminApi";
import {
  Activity,
  Users,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { adminTokenStore } from "../../../utils/adminTokenStore";

export default function IAMDashboard() {
  const [stats, setStats] = useState({
    admins: 0,
    sessions: 0,
    activity: 0,
  });

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  const wsRef = useRef(null);
  const reconnectTimer = useRef(null);
  const isMounted = useRef(false);
  const isConnecting = useRef(false);

  /* -------------------------------------------------------------
     LOAD STATS (REFRESH WORKS)
  ------------------------------------------------------------- */
  const loadStats = async () => {
    if (loading) return;

    try {
      setLoading(true);

      const [admins, sessions, activity] = await Promise.all([
        adminApi.get("/admin/admins"),
        adminApi.get("/admin/sessions"),
        adminApi.get("/admin/activity"),
      ]);

      if (!isMounted.current) return;

      setStats({
        admins: admins.data?.length || 0,
        sessions: sessions.data?.length || 0,
        activity: activity.data?.length || 0,
      });
    } catch (err) {
      console.error("Stats error:", err);
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------------------------------------------
     CONNECT WEBSOCKET (SAFE)
  ------------------------------------------------------------- */
  const connectWebSocket = () => {
    if (isConnecting.current || !isMounted.current) return;

    const token = adminTokenStore.get();
    if (!token) return;

    if (
      wsRef.current &&
      wsRef.current.readyState !== WebSocket.CLOSED
    ) {
      return;
    }

    isConnecting.current = true;

    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const wsUrl = `${protocol}://${window.location.hostname}:8000/ws/iam?token=${token}`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      isConnecting.current = false;
      console.log("IAM WS connected");
    };

    ws.onmessage = (msg) => {
      if (!isMounted.current) return;

      try {
        const data = JSON.parse(msg.data);
        const evt = {
          event: data.event || data.type || "Unknown",
          data: data.data || {},
          time: data.time || new Date().toLocaleString(),
        };

        setEvents((prev) => [evt, ...prev.slice(0, 19)]);
      } catch (e) {
        console.error("WS parse error:", e);
      }
    };

    ws.onclose = () => {
      isConnecting.current = false;
      wsRef.current = null;

      if (!isMounted.current) return;

      reconnectTimer.current = setTimeout(connectWebSocket, 4000);
    };
  };

  /* -------------------------------------------------------------
     MOUNT / UNMOUNT
  ------------------------------------------------------------- */
  useEffect(() => {
    isMounted.current = true;

    loadStats();
    connectWebSocket();

    return () => {
      isMounted.current = false;

      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);

      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []);

  /* -------------------------------------------------------------
     STYLES
  ------------------------------------------------------------- */
  const cardStyle = {
    padding: "18px",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    boxShadow: "0 0 18px rgba(255,140,20,0.15)",
  };

  return (
    <div
      style={{
        padding: 24,
        color: "white",
        minHeight: "calc(100vh - 95px - 70px)", // ✅ FIX FOOTER ISSUE
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h1
        style={{
          fontSize: 34,
          fontWeight: 900,
          marginBottom: 18,
          background: "linear-gradient(90deg,#ffcd8a,#ff9a3c,#ff6a00)",
          WebkitBackgroundClip: "text",
          color: "transparent",
        }}
      >
        IAM & Security Dashboard
      </h1>

      {/* STATS */}
      <div
        style={{
          display: "grid",
          gap: 18,
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          marginBottom: 30,
        }}
      >
        <div style={cardStyle}>
          <div style={{ display: "flex", gap: 10 }}>
            <Users color="#ffa24a" /> Admins
          </div>
          <div style={{ fontSize: 36, fontWeight: 700 }}>
            {stats.admins}
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ display: "flex", gap: 10 }}>
            <ShieldCheck color="#ff7b00" /> Active Sessions
          </div>
          <div style={{ fontSize: 36, fontWeight: 700 }}>
            {stats.sessions}
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ display: "flex", gap: 10 }}>
            <Activity color="#ff5e3a" /> Activity Logs
          </div>
          <div style={{ fontSize: 36, fontWeight: 700 }}>
            {stats.activity}
          </div>
        </div>

        {/* 🔄 REFRESH (WORKING + ANIMATED) */}
        <button
          onClick={loadStats}
          disabled={loading}
          style={{
            ...cardStyle,
            cursor: loading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            fontWeight: 700,
            opacity: loading ? 0.6 : 1,
          }}
        >
          <RefreshCw
            size={18}
            className={loading ? "spin" : ""}
          />
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* LIVE EVENTS */}
      <h2 style={{ fontSize: 22, marginBottom: 12 }}>
        Live Security Events
      </h2>

      <div
        style={{
          maxHeight: 420,
          overflowY: "auto",
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.08)",
          padding: 12,
          background: "rgba(255,255,255,0.03)",
          flex: 1,
        }}
      >
        {events.length === 0 ? (
          <div style={{ opacity: 0.6 }}>
            Waiting for security events…
          </div>
        ) : (
          events.map((e, i) => (
            <div
              key={i}
              style={{
                padding: "10px 0",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div style={{ fontWeight: 700 }}>{e.event}</div>
              <div style={{ fontSize: 14, opacity: 0.8 }}>
                {JSON.stringify(e.data)}
              </div>
              <div style={{ fontSize: 12, opacity: 0.5 }}>
                {e.time}
              </div>
            </div>
          ))
        )}
      </div>

      {/* 🔥 SPIN ANIMATION */}
      <style>{`
        .spin {
          animation: spin 0.9s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
