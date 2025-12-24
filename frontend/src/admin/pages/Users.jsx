import React, { useEffect, useState } from "react";
import adminApi from "../../admin/adminApi";

export default function Users() {
  const [users, setUsers] = useState([]);

  const load = async () => {
    const res = await adminApi.get("/admin/users");
    setUsers(res.data || []);
  };

  const del = async (id) => {
    await adminApi.delete(`/admin/users/${id}`);
    load();
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="users-page">

      <h1 className="admin-title">Users</h1>

      <div className="users-grid">
        {users.map((u) => (
          <div key={u.id} className="user-card">

            <div>
              <div className="user-email">{u.email || "No email"}</div>
              <div className="user-meta">UID: {u.uid}</div>
              <div className="user-meta">
                Joined: {u.created_at ? new Date(u.created_at).toLocaleDateString() : "Unknown"}
              </div>
            </div>

            <button className="delete-btn" onClick={() => del(u.id)}>
              🗑 Delete
            </button>
          </div>
        ))}
      </div>

      {/* SCOPED PREMIUM CSS */}
      <style>{`
        .users-page {
          padding: 20px;
          color: #fff;
        }

        .admin-title {
          font-size: 34px;
          font-weight: 800;
          margin-bottom: 24px;
        }

        /* --- GRID FIXED --- */
        .users-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 22px;
        }

        @media (max-width: 900px) {
          .users-grid {
            grid-template-columns: 1fr;
          }
        }

        /* --- USER CARD --- */
        .user-card {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.15);
          padding: 20px;
          border-radius: 12px;
          backdrop-filter: blur(6px);
          transition: 0.25s ease;
        }

        .user-card:hover {
          border-color: #ff7a2b;
          box-shadow: 0 0 22px rgba(255,120,50,0.45);
          transform: translateY(-4px);
        }

        .user-email {
          font-size: 18px;
          font-weight: 600;
          color: #fff;
        }

        .user-meta {
          font-size: 14px;
          color: #d0c5bd;
          margin-top: 4px;
        }

        /* DELETE BUTTON */
        .delete-btn {
          margin-top: 14px;
          width: 100%;
          padding: 10px;
          border-radius: 10px;
          border: none;
          background: linear-gradient(90deg, #ff4d4d, #b30000);
          color: white;
          font-weight: 700;
          cursor: pointer;
          transition: 0.25s ease;
        }

        .delete-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 18px rgba(255,60,60,0.6);
        }
      `}</style>

    </div>
  );
}
