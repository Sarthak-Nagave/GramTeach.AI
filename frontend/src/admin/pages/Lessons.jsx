// src/admin/pages/Lessons.jsx
import React, { useEffect, useState } from "react";
import adminApi from "../../admin/adminApi";

export default function Lessons() {
  const [lessons, setLessons] = useState([]);

  const load = async () => {
    const res = await adminApi.get("/admin/lessons");
    setLessons(res.data || []);
  };

  const del = async (id) => {
    await adminApi.delete(`/admin/lessons/${id}`);
    load();
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="lessons-page">

      <h1 className="admin-title">Lessons</h1>

      {lessons.length === 0 && (
        <p className="text-gray-400">No lessons found.</p>
      )}

      {/* ---- GRID WITH 4 CARDS PER ROW ---- */}
      <div className="lessons-grid">
        {lessons.map((l) => (
          <div key={l.id} className="lesson-card">

            {/* Thumbnail */}
            {l.thumbnail_url ? (
              <img
                src={l.thumbnail_url}
                className="lesson-thumb"
                alt="Lesson Thumbnail"
              />
            ) : (
              <div className="lesson-thumb placeholder">No Thumbnail</div>
            )}

            {/* Title */}
            <div className="lesson-title">
              {l.title || "Untitled Lesson"}
            </div>

            {/* Meta */}
            <div className="lesson-meta">
              <div>ID: {l.id}</div>
              <div>Owner: {l.owner_uid}</div>
              <div>
                Created:{" "}
                {l.created_at
                  ? new Date(l.created_at).toLocaleDateString()
                  : "Unknown"}
              </div>

              <div>Status: {l.status} ({l.progress}%)</div>
            </div>

            {/* Video link */}
            {l.video_url && (
              <a
                href={l.video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="view-video"
              >
                ▶ Watch Video
              </a>
            )}

            {/* Delete button */}
            <button className="delete-btn" onClick={() => del(l.id)}>
              🗑 Delete
            </button>
          </div>
        ))}
      </div>

      {/* SCOPED PREMIUM CSS */}
      <style>{`
        .lessons-page {
          padding: 20px;
          color: #fff;
        }

        .admin-title {
          font-size: 34px;
          font-weight: 800;
          margin-bottom: 24px;
        }

        /* GRID SYSTEM */
        .lessons-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 22px;
        }

        @media (max-width: 1200px) {
          .lessons-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 900px) {
          .lessons-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 600px) {
          .lessons-grid {
            grid-template-columns: 1fr;
          }
        }

        /* CARD UI */
        .lesson-card {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.12);
          padding: 16px;
          border-radius: 14px;
          backdrop-filter: blur(6px);
          display: flex;
          flex-direction: column;
          gap: 10px;
          transition: 0.25s ease;
        }

        .lesson-card:hover {
          border-color: #ff7a2b;
          box-shadow: 0 0 25px rgba(255,120,40,0.4);
          transform: translateY(-4px);
        }

        /* THUMBNAIL */
        .lesson-thumb {
          width: 100%;
          height: 140px;
          object-fit: cover;
          border-radius: 10px;
          background: rgba(255,255,255,0.08);
        }

        .lesson-thumb.placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          color: #aaa;
          font-size: 14px;
        }

        /* TITLE */
        .lesson-title {
          font-size: 18px;
          font-weight: 700;
          margin-top: 6px;
          color: #fff;
        }

        .lesson-meta {
          font-size: 13px;
          color: #d3c7bc;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        /* WATCH VIDEO LINK */
        .view-video {
          color: #ff7a2b;
          font-size: 14px;
          text-decoration: none;
          margin-top: 4px;
        }
        .view-video:hover {
          text-shadow: 0 0 10px rgba(255,120,40,0.6);
        }

        /* DELETE BUTTON */
        .delete-btn {
          margin-top: 10px;
          padding: 10px;
          border-radius: 10px;
          border: none;
          width: 100%;
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
