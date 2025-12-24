// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { listLessons } from "../services/api";
import { Link } from "react-router-dom";
import { PlayCircle, Eye, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();

  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (authLoading || !user) return;

    let mounted = true;

    const load = async () => {
      try {
        if (mounted) setLoading(true);
        const res = await listLessons();
        let data = res.data || [];

        const getVideoURL = (lesson) =>
          lesson.video_url ||
          lesson.video ||
          lesson.final_video ||
          lesson.s3_url ||
          null;

        data = data.filter((lesson) => {
          const url = getVideoURL(lesson);
          return url && typeof url === "string" && url.trim().length > 0;
        });

        if (mounted) setLessons(data);
      } catch (err) {
        console.error("Lessons load error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    const interval = setInterval(load, 15000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [user, authLoading]);

  const renderThumbnail = (lesson) => {
    const thumb = lesson.thumbnail_url || lesson.thumbnail;

    if (!thumb) {
      return (
        <div
          style={{
            width: "100%",
            height: 160,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#120a07",
          }}
        >
          <PlayCircle size={60} color="rgba(255,255,255,0.15)" />
        </div>
      );
    }

    return (
      <img
        src={thumb}
        alt={lesson.title}
        style={{
          width: "100%",
          height: 160,
          objectFit: "cover",
          display: "block",
        }}
      />
    );
  };

  // 🔍 SEARCH FILTER ONLY
  const filtered = lessons.filter((l) => {
    const q = searchQuery.toLowerCase();
    return (
      l.title?.toLowerCase().includes(q) ||
      l.topic?.toLowerCase().includes(q)
    );
  });

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh] text-gray-500">
        Checking authentication…
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0f0f0f", paddingBottom: 40 }}>
      <div className="container" style={{ paddingTop: 28 }}>

        {/* Header + Search */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 18,
            gap: 16,
          }}
        >
          <h1 style={{ color: "#fff", fontSize: 30, fontWeight: 800 }}>
            My Lessons
          </h1>

          {/* 🔍 PREMIUM SEARCH BAR */}
          <input
            type="text"
            placeholder="Search lessons..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              maxWidth: 320,
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid var(--border)",
              background: "#1b1b1b",
              color: "#fff",
              outline: "none",
              fontSize: 15,
            }}
          />

          <Link
            to="/create"
            className="btn btn-primary"
            style={{ padding: "10px 18px", whiteSpace: "nowrap" }}
          >
            Create Lesson
          </Link>
        </div>

        {/* Section */}
        {loading ? (
          <div className="card" style={{ padding: 30, textAlign: "center" }}>
            <Loader2 className="animate-spin" />
            <p style={{ marginTop: 12, color: "#aaa" }}>Loading lessons…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="card" style={{ padding: 30, textAlign: "center" }}>
            <p style={{ color: "#aaa" }}>No completed lessons found.</p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 18,
            }}
          >
            {filtered.map((lesson) => (
              <article
                key={lesson.id}
                style={{
                  background: "rgba(255,255,255,0.02)",
                  borderRadius: 14,
                  padding: 10,
                  boxShadow: "0 0 40px rgba(0,0,0,0.25)",
                }}
              >
                <div style={{ borderRadius: 10, overflow: "hidden" }}>
                  {renderThumbnail(lesson)}
                </div>

                <div style={{ padding: "10px 4px" }}>
                  <h3 style={{ color: "#fff", fontSize: 18, fontWeight: 700 }}>
                    {lesson.title}
                  </h3>
                  <p style={{ color: "#aaa", fontSize: 14 }}>
                    {lesson.topic}
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: 10,
                    alignItems: "center",
                  }}
                >
                  <Link
                    to={`/watch/${lesson.id}`}
                    className="btn btn-primary"
                    style={{ padding: "8px 12px", fontSize: 14 }}
                  >
                    <Eye size={14} /> Watch
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
