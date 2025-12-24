// src/admin/AdminRoutes.jsx
import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";

import AdminLayout from "./layout/AdminLayout";

// REGULAR ADMIN PAGES
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Lessons from "./pages/Lessons";
import Storage from "./pages/Storage";
import Analytics from "./pages/Analytics";

// IAM MODULE PAGES
import IAMDashboard from "./pages/iam/IAMDashboard";
import AdminSessions from "./pages/iam/AdminSessions";
import AdminManage from "./pages/iam/AdminManage";
import AdminLoginHistory from "./pages/iam/AdminLoginHistory";
import AdminActivityLogs from "./pages/iam/AdminActivityLogs";
import IAMSettings from "./pages/iam/IAMSettings";

export default function AdminRoutes() {
  return (
    <Routes>
      {/* ALL ADMIN ROUTES WRAPPED IN LAYOUT */}
      <Route path="/" element={<AdminLayout />}>

        {/* 🔥 FORCE ADMIN DEFAULT */}
        <Route index element={<Navigate to="dashboard" replace />} />

        {/* MAIN ADMIN */}
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="lessons" element={<Lessons />} />
        <Route path="storage" element={<Storage />} />
        <Route path="analytics" element={<Analytics />} />

        {/* ============================== */}
        {/*        IAM MODULE ROUTES       */}
        {/* ============================== */}
        <Route path="iam">
          {/* ❌ NO IAM INDEX ROUTE */}
          <Route index element={<Navigate to="/admin/dashboard" replace />} />

          <Route path="sessions" element={<AdminSessions />} />
          <Route path="manage" element={<AdminManage />} />
          <Route path="login-history" element={<AdminLoginHistory />} />
          <Route path="activity" element={<AdminActivityLogs />} />
          <Route path="settings" element={<IAMSettings />} />
        </Route>

      </Route>
    </Routes>
  );
}
