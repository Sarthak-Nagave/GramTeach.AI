import React, { useEffect, useState } from "react";
import api from "../services/api"; 
import { adminTokenStore } from "../utils/adminTokenStore";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    users: 0,
    lessons: 0,
    pending_jobs: 0,
    s3_used: "0 GB",
    active_users: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Block page if no admin token
    const token = adminTokenStore.getToken();
    if (!token) {
      navigate("/"); // redirect home
      return;
    }

    const load = async () => {
      try {
        const res = await api.get("/admin/stats");
        setStats(res.data);
      } catch (err) {
        console.error("Admin stats load error:", err);
        navigate("/"); // fallback redirect
      }
      setLoading(false);
    };

    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-gray-800"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">
        Admin Dashboard
      </h2>

      {/* GRID */}
      <div className="grid md:grid-cols-3 gap-6 mt-6">
        
        {/* Users */}
        <Card title="Users" value={stats.users} subtitle="Total registered" />

        {/* Lessons */}
        <Card title="Lessons" value={stats.lessons} subtitle="Created lessons" />

        {/* Pending Jobs */}
        <Card
          title="Pending Jobs"
          value={stats.pending_jobs}
          subtitle="Render queue"
        />

        {/* S3 Storage */}
        <Card
          title="S3 Storage"
          value={stats.s3_used}
          subtitle="Used Storage"
        />

        {/* Active Users */}
        <Card
          title="Active Users"
          value={stats.active_users}
          subtitle="Last 24 hrs"
        />

        {/* Analytics */}
        <div className="p-5 rounded-xl shadow bg-white border">
          <h3 className="font-semibold text-lg">Analytics</h3>
          <div className="text-sm text-gray-500 mt-2">
            Engagement charts & AI insights coming soon
          </div>
        </div>
      </div>
    </div>
  );
}

// Reusable Card Component
function Card({ title, value, subtitle }) {
  return (
    <div className="p-5 rounded-xl shadow bg-white border">
      <h3 className="font-semibold text-lg">{title}</h3>
      <div className="text-3xl font-bold mt-3">{value}</div>
      <div className="text-sm text-gray-500 mt-1">{subtitle}</div>
    </div>
  );
}
