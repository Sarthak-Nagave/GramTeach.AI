// src/admin/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import adminApi from "../../admin/adminApi";
// PREMIUM ICONS
import {
  Users as UsersIcon,
  Video as VideoIcon,
  Package as JobsIcon,
} from "lucide-react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

// Generate last N days
function makeLastNDates(n) {
  const arr = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    arr.push(d.toISOString().slice(0, 10));
  }
  return arr;
}

// Reusable Premium Card Component
function AdminCard({ title, value, Icon }) {
  return (
    <div className="admin-card">
      <p className="admin-card-title">{title}</p>
      <h2 className="admin-card-value">{value}</h2>

      <div className="admin-card-icon">
        <Icon size={32} strokeWidth={1.5} />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState({ users: 0, lessons: 0 });
  const [growthData, setGrowthData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const uRes = await adminApi.get("/admin/users").catch(() => ({ data: [] }));
        const users = Array.isArray(uRes.data) ? uRes.data : [];

        const lRes = await adminApi.get("/admin/lessons").catch(() => ({ data: [] }));
        const lessons = Array.isArray(lRes.data) ? lRes.data : [];

        const aRes = await adminApi.get("/admin/analytics").catch(() => ({ data: {} }));
        const growth = aRes?.data?.user_growth || [];

        const last30 = makeLastNDates(30);
        const map = {};

        growth.forEach((x) => {
          if (!x?.date) return;
          const d = x.date.slice(0, 10);
          map[d] = (map[d] || 0) + (x.count || 0);
        });

        const formatted = last30.map((d) => ({
          day: d,
          users: map[d] || 0,
        }));

        setStats({ users: users.length, lessons: lessons.length });
        setGrowthData(formatted);

      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="admin-dashboard">

      <h1 className="admin-page-title">Admin Dashboard</h1>

      {/* METRIC CARDS */}
      <div className="admin-grid-3">
        <AdminCard title="Total Users" value={stats.users} Icon={UsersIcon} />
        <AdminCard title="Total Lessons" value={stats.lessons} Icon={VideoIcon} />
        <AdminCard title="Pending Jobs" value="0" Icon={JobsIcon} />
      </div>

      {/* PREMIUM GRAPH */}
      <div className="admin-chart-box">
        <h2 className="chart-title">User Growth (Last 30 Days)</h2>

        {loading ? (
          <div className="chart-loading">Loading chart…</div>
        ) : (
          <ResponsiveContainer width="100%" height={330}>
            <LineChart data={growthData}>
              <defs>
                {/* Neon Gradient Line */}
                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#ff8a3d" />
                  <stop offset="50%" stopColor="#ff5e00" />
                  <stop offset="100%" stopColor="#ff3c00" />
                </linearGradient>
              </defs>

              <CartesianGrid stroke="#2c1d14" strokeDasharray="4 4" />
              <XAxis dataKey="day" tick={{ fill: "#d8d8d8", fontSize: 11 }} />
              <YAxis tick={{ fill: "#d8d8d8" }} />

              <Tooltip
                contentStyle={{
                  background: "#1b130f",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "#fff",
                  borderRadius: "10px",
                }}
              />

              <Line
                type="natural"
                dataKey="users"
                stroke="url(#lineGradient)"
                strokeWidth={4}
                dot={{ r: 6, fill: "#ff6a00", stroke: "white", strokeWidth: 1 }}
                activeDot={{ r: 8, fill: "#ff8a3d" }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* STYLES */}
      <style>{`
        .admin-dashboard { padding: 22px; color: white; }

        .admin-page-title {
          font-size: 42px;
          font-weight: 900;
          margin-bottom: 28px;
          letter-spacing: -0.5px;
        }

        /* GRID */
        .admin-grid-3 {
          display: grid;
          gap: 24px;
          grid-template-columns: repeat(3, 1fr);
          margin-bottom: 32px;
        }
        @media (max-width: 900px) {
          .admin-grid-3 {
            grid-template-columns: repeat(1, 1fr);
          }
        }

        /* CARD */
        .admin-card {
          position: relative;
          padding: 26px;
          border-radius: 18px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          backdrop-filter: blur(10px);
          transition: 0.25s ease;
        }

        .admin-card:hover {
          border-color: #ff7a2b;
          transform: translateY(-4px);
          box-shadow: 0 0 35px rgba(255,120,40,0.35);
        }

        .admin-card-title { font-size: 16px; opacity: 0.75; }
        .admin-card-value { font-size: 46px; font-weight: 900; margin-top: 6px; }

        .admin-card-icon {
          position: absolute;
          bottom: 16px;
          right: 18px;
          color: #ff7a2b;
          opacity: 0.95;
        }

        /* CHART BOX */
        .admin-chart-box {
          padding: 26px;
          background: rgba(255,255,255,0.06);
          border-radius: 18px;
          border: 1px solid rgba(255,255,255,0.12);
          backdrop-filter: blur(10px);
          transition: 0.25s ease;
        }

        .admin-chart-box:hover {
          border-color: #ff7a2b;
          box-shadow: 0 0 35px rgba(255,120,40,0.35);
        }

        .chart-title {
          font-size: 22px;
          font-weight: 700;
          margin-bottom: 16px;
          color: #ff7a2b;
        }

        .chart-loading {
          padding: 40px;
          text-align: center;
          opacity: 0.7;
        }
      `}</style>
    </div>
  );
}
