// src/admin/pages/Storage.jsx
import React, { useEffect, useState } from "react";
import adminApi from "../../admin/adminApi";
import { Trash2, FileVideo, FileImage, File } from "lucide-react";

export default function Storage() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await adminApi.get("/admin/s3/list");
      setFiles(res.data.files || []);
    } catch (e) {
      console.error("S3 List Error:", e);
    }
    setLoading(false);
  };

  const del = async (key) => {
    if (!window.confirm("Delete this file permanently?")) return;

    await adminApi.delete(`/admin/s3/delete/${key}`);
    load();
  };

  useEffect(() => {
    load();
  }, []);

  const formatSize = (bytes) => {
    if (!bytes) return "0 MB";
    return (bytes / 1024 / 1024).toFixed(2) + " MB";
  };

  const getIcon = (key) => {
    if (key.endsWith(".mp4")) return <FileVideo className="storage-icon video" />;
    if (key.endsWith(".jpg") || key.endsWith(".png"))
      return <FileImage className="storage-icon image" />;
    return <File className="storage-icon other" />;
  };

  return (
    <div className="storage-page">

      <h1 className="admin-title">Storage</h1>

      {loading && <p className="text-gray-400">Loading files...</p>}
      {!loading && files.length === 0 && (
        <p className="text-gray-400">No files stored in S3.</p>
      )}

      {/* GRID – 4 cards per row */}
      <div className="storage-grid">
        {files.map((f) => (
          <div key={f.Key} className="storage-card">

            {/* Left side: icon + name */}
            <div className="storage-left">
              {getIcon(f.Key)}

              <div className="storage-info">
                <div className="storage-name">{f.Key}</div>
                <div className="storage-size">{formatSize(f.Size)}</div>

                {f.Url && (
                  <a
                    href={f.Url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="storage-preview"
                  >
                    ▶ Preview
                  </a>
                )}
              </div>
            </div>

            {/* Delete Button */}
            <button className="storage-delete" onClick={() => del(f.Key)}>
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>

      {/* PREMIUM SCOPED CSS */}
      <style>{`
        .storage-page {
          padding: 20px;
          color: white;
        }

        .admin-title {
          font-size: 34px;
          font-weight: 800;
          margin-bottom: 24px;
        }

        /* GRID */
        .storage-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 22px;
        }

        @media (max-width: 1200px) {
          .storage-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 900px) {
          .storage-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 600px) {
          .storage-grid {
            grid-template-columns: 1fr;
          }
        }

        /* CARD */
        .storage-card {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 14px;
          padding: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          backdrop-filter: blur(6px);
          transition: 0.25s ease;
        }

        .storage-card:hover {
          border-color: #ff7a2b;
          box-shadow: 0 0 25px rgba(255,120,40,0.35);
          transform: translateY(-4px);
        }

        .storage-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        /* ICON COLORS */
        .storage-icon {
          width: 24px;
          height: 24px;
        }
        .storage-icon.video { color: #9d60ff; }
        .storage-icon.image { color: #4ad97b; }
        .storage-icon.other { color: #bbbbbb; }

        .storage-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .storage-name {
          font-size: 14px;
          font-weight: 600;
          overflow-wrap: anywhere;
        }

        .storage-size {
          font-size: 12px;
          color: #d0c5bd;
        }

        .storage-preview {
          font-size: 12px;
          color: #ff7a2b;
          text-decoration: none;
        }
        .storage-preview:hover {
          text-shadow: 0 0 10px rgba(255,120,40,0.6);
        }

        /* DELETE BUTTON */
        .storage-delete {
          background: linear-gradient(90deg, #ff4d4d, #b30000);
          border: none;
          padding: 8px 10px;
          border-radius: 10px;
          color: white;
          cursor: pointer;
          transition: 0.25s ease;
        }

        .storage-delete:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 18px rgba(255,60,60,0.6);
        }
      `}</style>
    </div>
  );
}
