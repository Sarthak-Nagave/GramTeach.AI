// src/admin/pages/AdminManage.jsx
import React, { useEffect, useState } from "react";
import adminApi from "../adminApi";
import { Plus, Trash2, ShieldCheck, ArrowUp, ArrowDown, Key } from "lucide-react";

export default function AdminManage() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [role, setRole] = useState("admin");

  const normalize = (a) => ({
    id: a.id,
    email: a.email || "unknown",
    role: a.role || "admin",
    is_superadmin: Boolean(a.is_superadmin),
  });

  const loadAdmins = async () => {
    try {
      setLoading(true);
      const res = await adminApi.get("/admin/admins");
      setAdmins((res.data || []).map(normalize));
    } catch (err) {
      console.error("Load admins error:", err);
      alert("Failed to load admins");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const createAdmin = async () => {
    if (!email || !pw) return alert("Email & password required");

    try {
      await adminApi.post("/admin/create", {
        email,
        password: pw,
        role,
      });
      setEmail("");
      setPw("");
      setRole("admin");
      loadAdmins();
      alert("Admin created successfully");
    } catch (err) {
      console.error("Create admin error:", err);
      alert("Failed to create admin");
    }
  };

  const deleteAdmin = async (id, is_superadmin) => {
    if (is_superadmin) return alert("Cannot delete superadmin!");
    if (!confirm("Delete this admin?")) return;

    try {
      await adminApi.delete(`/admin/delete/${id}`);
      loadAdmins();
    } catch (err) {
      console.error("Delete admin error:", err);
      alert("Failed to delete admin");
    }
  };

  const promote = async (id) => {
    try {
      await adminApi.post(`/admin/promote/${id}`);
      loadAdmins();
    } catch (err) {
      console.error("Promote admin error:", err);
      alert("Failed to promote");
    }
  };

  const demote = async (id) => {
    try {
      await adminApi.post(`/admin/demote/${id}`);
      loadAdmins();
    } catch (err) {
      console.error("Demote admin error:", err);
      alert("Failed to demote");
    }
  };

  const changePassword = async (id) => {
    const newPass = prompt("Enter new password:");
    if (!newPass) return;

    try {
      await adminApi.post(`/admin/reset-password/${id}`, {
        new_password: newPass,
      });
      alert("Password updated");
    } catch (err) {
      console.error("Password reset error:", err);
      alert("Failed to update password");
    }
  };

  return (
    <div className="admin-page">
      <h1 className="admin-title">Manage Admins (IAM)</h1>

      {/* CREATE ADMIN FORM */}
      <div className="create-bar">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Admin Email"
          type="email"
          className="input"
        />

        <input
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          placeholder="Password"
          className="input"
        />

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="input"
        >
          <option value="admin">Admin</option>
          <option value="superadmin">Superadmin</option>
          <option value="content_manager">Content Manager</option>
          <option value="moderator">Moderator</option>
          <option value="viewer">Viewer</option>
        </select>

        <button onClick={createAdmin} className="btn">
          <Plus size={18} /> Create
        </button>
      </div>

      {/* TABLE */}
      {loading ? (
        <div className="loading">Loading…</div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Role</th>
              <th style={{ width: 360 }}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {admins.map((a) => (
              <tr key={a.id}>
                <td className="email-cell">{a.email}</td>
                <td className="role-cell">
                  {a.role}
                  {a.is_superadmin && (
                    <span className="superadmin">
                      <ShieldCheck size={16} />
                    </span>
                  )}
                </td>

                <td>
                  <button className="btn small" onClick={() => changePassword(a.id)}>
                    <Key size={16} />
                  </button>

                  {!a.is_superadmin && (
                    <button className="btn small" onClick={() => promote(a.id)}>
                      <ArrowUp size={16} /> Promote
                    </button>
                  )}

                  {a.is_superadmin && (
                    <button className="btn small" onClick={() => demote(a.id)}>
                      <ArrowDown size={16} /> Demote
                    </button>
                  )}

                  {!a.is_superadmin && (
                    <button
                      className="btn small danger"
                      onClick={() => deleteAdmin(a.id, a.is_superadmin)}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* ===== ULTRA PREMIUM CSS ===== */}
      <style>{`
        .admin-page {
          padding: 26px;
          color: white;
          background: radial-gradient(circle at top, #1c1c1c, #0b0b0b);
          min-height: 100vh;
        }

        .admin-title {
          font-size: 36px;
          font-weight: 900;
          margin-bottom: 22px;
          background: linear-gradient(90deg, #ffb36b, #ff7a18);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .create-bar {
          display: flex;
          gap: 10px;
          padding: 16px;
          margin-bottom: 26px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 14px;
          backdrop-filter: blur(8px);
        }

        .input {
          padding: 10px 12px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.25);
          background: rgba(0,0,0,0.6);
          color: white;
        }

        .input:focus {
          outline: none;
          border-color: #ff9a3c;
          box-shadow: 0 0 0 2px rgba(255,154,60,0.25);
        }

        .btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          background: linear-gradient(135deg, #ff9a3c, #ff6a00);
          border-radius: 12px;
          font-weight: 700;
          cursor: pointer;
          border: none;
          transition: 0.25s ease;
        }

        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(255,140,60,0.45);
        }

        .btn.small {
          padding: 6px 12px;
          margin-right: 6px;
        }

        .btn.danger {
          background: linear-gradient(135deg, #ff4d4d, #b30000);
        }

        .admin-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0 14px;
        }

        thead th {
          font-size: 13px;
          opacity: 0.7;
          text-align: left;
          padding-bottom: 8px;
        }

        tbody tr {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.14);
          backdrop-filter: blur(6px);
          transition: 0.25s ease;
        }

        tbody tr:hover {
          border-color: #ff9a3c;
          box-shadow: 0 0 22px rgba(255,140,60,0.35);
        }

        tbody td {
          padding: 14px;
          vertical-align: middle;
        }

        .email-cell {
          font-weight: 600;
        }

        .role-cell {
          font-weight: 700;
          text-transform: capitalize;
        }

        .superadmin {
          color: #4cff79;
          margin-left: 6px;
        }

        .loading {
          opacity: 0.7;
          font-style: italic;
        }
      `}</style>
    </div>
  );
}
