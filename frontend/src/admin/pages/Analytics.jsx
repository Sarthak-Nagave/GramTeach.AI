// src/admin/pages/Analytics.jsx
import React, { useEffect, useState } from "react";
import adminApi from "../../admin/adminApi";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  ResponsiveContainer,
} from "recharts";

export default function Analytics() {
  const [userGrowth, setUserGrowth] = useState([]);
  const [lessonGrowth, setLessonGrowth] = useState([]);

  useEffect(() => {
    adminApi.get("/admin/analytics").then((res) => {
      const a = res.data;

      const sortedUsers = [...a.user_growth].sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );

      const sortedLessons = [...a.lesson_growth].sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );

      setUserGrowth(sortedUsers);
      setLessonGrowth(sortedLessons);
    });
  }, []);

  return (
    <div className="analytics-page">

      <h1 className="analytics-title">Analytics Dashboard</h1>

      {/* USER GROWTH */}
      <div className="analytics-card">
        <h3 className="analytics-card-title">User Growth (Last 30 Days)</h3>

        {userGrowth.length === 0 ? (
          <p className="analytics-empty">No user activity available.</p>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={userGrowth}>
              <CartesianGrid stroke="#2c2c2c" strokeDasharray="4 4" />
              <XAxis dataKey="date" tick={{ fill: "#ccc" }} />
              <YAxis allowDecimals={false} tick={{ fill: "#ccc" }} />
              <Tooltip
                contentStyle={{
                  background: "#1a1a1a",
                  border: "1px solid #444",
                  color: "#fff",
                }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#ff7a2b"
                strokeWidth={3}
                dot={{ r: 4, fill: "#ff7a2b" }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* LESSON GROWTH */}
      <div className="analytics-card">
        <h3 className="analytics-card-title">Lessons Created (Last 30 Days)</h3>

        {lessonGrowth.length === 0 ? (
          <p className="analytics-empty">No lesson activity available.</p>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={lessonGrowth}>
              <CartesianGrid stroke="#2c2c2c" strokeDasharray="4 4" />
              <XAxis dataKey="date" tick={{ fill: "#ccc" }} />
              <YAxis allowDecimals={false} tick={{ fill: "#ccc" }} />
              <Tooltip
                contentStyle={{
                  background: "#1a1a1a",
                  border: "1px solid #444",
                  color: "#fff",
                }}
              />
              <Bar dataKey="count" fill="#4ade80" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* STYLES */}
      <style>{`
        .analytics-page {
          padding: 20px;
          color: white;
        }

        .analytics-title {
          font-size: 34px;
          font-weight: 800;
          margin-bottom: 30px;
        }

        .analytics-card {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 16px;
          padding: 22px;
          margin-bottom: 30px;
          backdrop-filter: blur(8px);
          transition: 0.25s ease;
        }

        .analytics-card:hover {
          border-color: #ff7a2b;
          box-shadow: 0 0 25px rgba(255,120,40,0.35);
          transform: translateY(-4px);
        }

        .analytics-card-title {
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 16px;
          color: #ff7a2b;
        }

        .analytics-empty {
          color: #c5b9b2;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
}
