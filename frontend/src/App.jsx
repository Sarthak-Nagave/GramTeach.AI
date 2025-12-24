// src/App.jsx
import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { onAuthStateChanged, getAuth } from "firebase/auth";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer"; // ✅ FOOTER IMPORT

// USER PAGES
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CreateLesson from "./pages/CreateLesson";
import WatchLesson from "./pages/WatchLesson";
import MotivationalVideos from "./pages/MotivationalVideos";
import RuralPath from "./pages/RuralPath";
import LessonPackages from "./pages/LessonPackages";
import Profile from "./pages/Profile";

// ADMIN PAGES
import AdminLayout from "./admin/layout/AdminLayout";
import AdminDashboard from "./admin/pages/Dashboard";
import AdminUsers from "./admin/pages/Users";
import AdminLessons from "./admin/pages/Lessons";
import AdminStorage from "./admin/pages/Storage";
import AdminAnalytics from "./admin/pages/Analytics";
import AdminManage from "./admin/pages/AdminManage";
import AdminLogin from "./admin/pages/AdminLogin";

// IAM MODULE
import IAMDashboard from "./admin/pages/iam/IAMDashboard";
import AdminSessions from "./admin/pages/iam/AdminSessions";
import AdminLoginHistory from "./admin/pages/iam/AdminLoginHistory";
import AdminActivityLogs from "./admin/pages/iam/AdminActivityLogs";
import IAMSettings from "./admin/pages/iam/IAMSettings";

// TOKEN STORE
import { adminTokenStore } from "./utils/adminTokenStore";

const auth = getAuth();

// SAFE JWT DECODE
function decodeJwtSafe(token) {
  try {
    const seg = token?.split(".")[1];
    if (!seg) return null;
    return JSON.parse(atob(seg.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
}

export default function App() {
  /* ---------------- USER AUTH ---------------- */
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  /* ---------------- ADMIN AUTH ---------------- */
  const [adminToken, setAdminToken] = useState(
    adminTokenStore.isValid() ? adminTokenStore.get() : null
  );
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  const location = useLocation();

  /* -------- FIREBASE USER LISTENER -------- */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoadingUser(false);
    });
    return unsub;
  }, []);

  /* -------- ADMIN TOKEN SYNC -------- */
  useEffect(() => {
    const sync = () => {
      const token = adminTokenStore.isValid()
        ? adminTokenStore.get()
        : null;

      setAdminToken((prev) => (prev === token ? prev : token));
    };

    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  /* -------- SUPERADMIN FLAG -------- */
  useEffect(() => {
    const payload = decodeJwtSafe(adminToken);
    setIsSuperAdmin(Boolean(payload?.is_superadmin));
  }, [adminToken]);

  if (loadingUser) return <div>Loading…</div>;

  /* -------- UI VISIBILITY -------- */
  const isAdminLoginPage = location.pathname === "/admin-login";
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 text-gray-900">
      
      {/* NAVBAR — USER ONLY */}
      {!isAdminRoute && !isAdminLoginPage && <Navbar />}

      {/* MAIN CONTENT */}
      <div className="flex-1">
        <Routes>
          {/* ================= PUBLIC ================= */}
          <Route path="/" element={<Home />} />

          {/* ================= USER LOGIN ================= */}
          <Route
            path="/login"
            element={!user ? <Login /> : <Navigate to="/dashboard" replace />}
          />

          {/* ================= USER ROUTES ================= */}
          <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/create" element={user ? <CreateLesson /> : <Navigate to="/login" />} />
          <Route path="/watch/:id" element={user ? <WatchLesson /> : <Navigate to="/login" />} />
          <Route path="/motivational" element={user ? <MotivationalVideos /> : <Navigate to="/login" />} />
          <Route path="/basic-skills" element={user ? <RuralPath /> : <Navigate to="/login" />} />
          <Route path="/packages" element={user ? <LessonPackages /> : <Navigate to="/login" />} />
          <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />

          {/* ================= ADMIN LOGIN ================= */}
          <Route
            path="/admin-login"
            element={
              adminTokenStore.isValid()
                ? <Navigate to="/admin/dashboard" replace />
                : <AdminLogin />
            }
          />

          {/* ================= ADMIN PANEL ================= */}
          <Route
            path="/admin/*"
            element={
              adminTokenStore.isValid()
                ? <AdminLayout />
                : <Navigate to="/admin-login" replace />
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="lessons" element={<AdminLessons />} />
            <Route path="storage" element={<AdminStorage />} />
            <Route path="analytics" element={<AdminAnalytics />} />

            {/* SUPERADMIN ONLY */}
            <Route
              path="manage"
              element={isSuperAdmin ? <AdminManage /> : <Navigate to="/admin/dashboard" replace />}
            />
            <Route
              path="iam"
              element={isSuperAdmin ? <IAMDashboard /> : <Navigate to="/admin/dashboard" replace />}
            />
            <Route
              path="iam/sessions"
              element={isSuperAdmin ? <AdminSessions /> : <Navigate to="/admin/dashboard" replace />}
            />
            <Route
              path="iam/login-history"
              element={isSuperAdmin ? <AdminLoginHistory /> : <Navigate to="/admin/dashboard" replace />}
            />
            <Route
              path="iam/activity"
              element={isSuperAdmin ? <AdminActivityLogs /> : <Navigate to="/admin/dashboard" replace />}
            />
            <Route
              path="iam/settings"
              element={isSuperAdmin ? <IAMSettings /> : <Navigate to="/admin/dashboard" replace />}
            />
          </Route>
        </Routes>
      </div>

      {/* FOOTER — USER ONLY */}
      {!isAdminRoute && !isAdminLoginPage && <Footer />}
    </div>
  );
}
