// src/admin/components/AdminSidebar.jsx
import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { adminTokenStore } from "../../utils/adminTokenStore";

import {
  LayoutDashboard,
  Users,
  Video,
  Folder,
  BarChart3,
  Shield,
  KeyRound,
  History,
  BarChart2,
  Settings,
  ChevronRight,
  ChevronDown,
} from "lucide-react";

export default function AdminSidebar() {
  const decoded = adminTokenStore.getDecoded();
  const isSuper = decoded?.is_superadmin || false;

  const location = useLocation();
  const [iamOpen, setIamOpen] = useState(false);

  /* Close IAM menu on route change */
  useEffect(() => {
    setIamOpen(false);
  }, [location.pathname]);

  /* ---------- BASE LINK STYLE ---------- */
  const baseLink =
    "flex items-center gap-3 px-4 py-2 rounded-md transition text-[15px]";

  const inactive =
    "text-gray-300 hover:text-orange-400 hover:bg-[#2a1f19]";

  const active =
    "bg-gradient-to-r from-orange-400 to-orange-600 text-black font-semibold shadow-md";

  return (
    <aside
      className="w-64 text-white"
      style={{
        position: "fixed",
        top: 95, // ⬅ navbar height
        left: 0,
        height: "calc(100vh - 95px)",
        background: "rgba(27,19,15,0.75)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        borderRight: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "4px 0 20px rgba(0,0,0,0.45)",
        paddingBottom: 24,
        zIndex: 40,
      }}
    >
      {/* HEADER */}
      <div className="px-6 pt-6 pb-4">
        <h2
          className="text-xl font-extrabold"
          style={{
            background:
              "linear-gradient(90deg,#ffcd8a,#ff9a3c,#ff6a00)",
            WebkitBackgroundClip: "text",
            color: "transparent",
          }}
        >
          Admin Console
        </h2>
      </div>

      {/* MAIN NAV */}
      <nav className="flex flex-col px-4 space-y-1">
        <NavLink
          to="/admin/dashboard"
          className={({ isActive }) =>
            `${baseLink} ${isActive ? active : inactive}`
          }
        >
          <LayoutDashboard size={18} /> Dashboard
        </NavLink>

        <NavLink
          to="/admin/users"
          className={({ isActive }) =>
            `${baseLink} ${isActive ? active : inactive}`
          }
        >
          <Users size={18} /> Users
        </NavLink>

        <NavLink
          to="/admin/lessons"
          className={({ isActive }) =>
            `${baseLink} ${isActive ? active : inactive}`
          }
        >
          <Video size={18} /> Lessons
        </NavLink>

        <NavLink
          to="/admin/storage"
          className={({ isActive }) =>
            `${baseLink} ${isActive ? active : inactive}`
          }
        >
          <Folder size={18} /> Storage
        </NavLink>

        <NavLink
          to="/admin/analytics"
          className={({ isActive }) =>
            `${baseLink} ${isActive ? active : inactive}`
          }
        >
          <BarChart3 size={18} /> Analytics
        </NavLink>

        {/* ================= IAM & SECURITY ================= */}
        {isSuper && (
          <div className="mt-4">
            <button
              onClick={() => setIamOpen((p) => !p)}
              className="w-full flex items-center justify-between px-4 py-2 text-gray-300 hover:text-orange-400"
            >
              <span className="flex items-center gap-3">
                <Shield size={18} /> IAM & Security
              </span>
              {iamOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>

            {iamOpen && (
              <div className="flex flex-col ml-6 mt-2 space-y-1">
                <NavLink
                  to="/admin/iam"
                  className={({ isActive }) =>
                    `${baseLink} ${isActive ? active : inactive}`
                  }
                >
                  <Shield size={16} /> IAM Dashboard
                </NavLink>

                <NavLink
                  to="/admin/iam/sessions"
                  className={({ isActive }) =>
                    `${baseLink} ${isActive ? active : inactive}`
                  }
                >
                  <KeyRound size={16} /> Active Sessions
                </NavLink>

                {/* ✅ FIXED ROUTE */}
                <NavLink
                  to="/admin/manage"
                  className={({ isActive }) =>
                    `${baseLink} ${isActive ? active : inactive}`
                  }
                >
                  <Users size={16} /> Manage Admins
                </NavLink>

                <NavLink
                  to="/admin/iam/login-history"
                  className={({ isActive }) =>
                    `${baseLink} ${isActive ? active : inactive}`
                  }
                >
                  <History size={16} /> Login History
                </NavLink>

                <NavLink
                  to="/admin/iam/activity"
                  className={({ isActive }) =>
                    `${baseLink} ${isActive ? active : inactive}`
                  }
                >
                  <BarChart2 size={16} /> Activity Logs
                </NavLink>

                <NavLink
                  to="/admin/iam/settings"
                  className={({ isActive }) =>
                    `${baseLink} ${isActive ? active : inactive}`
                  }
                >
                  <Settings size={16} /> IAM Settings
                </NavLink>
              </div>
            )}
          </div>
        )}
      </nav>
    </aside>
  );
}
