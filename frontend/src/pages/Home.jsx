// src/pages/Home.jsx
import React from "react";
import { Link } from "react-router-dom";
import { Play } from "lucide-react";

export default function Home() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #0d0806, #1a120f)",
        paddingBottom: 80,
      }}
    >
      <div className="container" style={{ paddingTop: 40 }}>
        
        {/* HERO SECTION */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 420px",
            gap: 40,
            alignItems: "center",
          }}
        >
          {/* LEFT SECTION */}
          <div>
            <h1
              style={{
                fontSize: "clamp(34px, 5vw, 60px)",
                fontWeight: 900,
                lineHeight: "1.1",
                color: "white",
              }}
            >
              Empower Every Village with{" "}
              <span
                style={{
                  background: "linear-gradient(90deg, #ff7b00, #ffb566)",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                  textShadow: "0 0 12px rgba(255,120,0,0.7)",
                }}
              >
                GramTeach.AI
              </span>
            </h1>

            <p
              style={{
                marginTop: 14,
                color: "#c9b8a8",
                fontSize: 18,
                maxWidth: 600,
                lineHeight: 1.5,
              }}
            >
              Create AI-powered video lessons, teach in local languages,
              and help students build real skills — from digital basics,
              banking, UPI to smart farming tools.
            </p>

            {/* ACTION BUTTONS */}
            <div style={{ display: "flex", gap: 14, marginTop: 24 }}>
              <Link
                to="/create"
                className="btn btn-primary"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "12px 20px",
                  fontSize: 16,
                }}
              >
                <Play size={18} /> Create Lesson
              </Link>

              <Link
                to="/basic-skills"
                className="btn btn-outline"
                style={{
                  padding: "12px 20px",
                  fontSize: 16,
                  borderColor: "#ff7b00",
                  color: "#ffb78a",
                }}
              >
                Basic Skills
              </Link>
            </div>

            {/* TOP FEATURE GRID */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 18,
                marginTop: 34,
              }}
            >
              {[
                { title: "AI Lessons", desc: "Scripts & videos made automatically." },
                { title: "Fast Video", desc: "From idea to lesson in minutes." },
                { title: "Multi-Language", desc: "English, Hindi, Marathi." },
              ].map((card) => (
                <div
                  key={card.title}
                  style={{
                    background: "rgba(30, 22, 18, 0.6)",
                    borderRadius: 14,
                    padding: 22,
                    border: "1px solid rgba(255,120,0,0.25)",
                    boxShadow: "0 0 16px rgba(255,120,0,0.15)",
                    transition: "0.25s",
                  }}
                  className="hover-card"
                >
                  <h3
                    style={{
                      fontSize: 20,
                      color: "#ff9b50",
                      marginBottom: 6,
                      fontWeight: 700,
                    }}
                  >
                    {card.title}
                  </h3>
                  <p style={{ color: "#c9b8a8" }}>{card.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT PREVIEW PANEL */}
          <div
            style={{
              background: "rgba(30, 22, 18, 0.7)",
              padding: 28,
              borderRadius: 16,
              border: "1px solid rgba(255,120,0,0.25)",
              boxShadow: "0 0 20px rgba(255,120,0,0.2)",
            }}
          >
            <div
              style={{
                height: 240,
                borderRadius: 12,
                background: "rgba(0,0,0,0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Play size={70} color="#7c5cff" />
            </div>

            {/* PREVIEW BUTTONS */}
            <div
              style={{
                display: "flex",
                marginTop: 18,
                justifyContent: "space-between",
                gap: 10,
              }}
            >
              {["AI Script", "Subtitles", "Voice"].map((text) => (
                <button
                  key={text}
                  style={{
                    flex: 1,
                    padding: "10px 0",
                    background: "rgba(50,40,32,0.8)",
                    borderRadius: 8,
                    color: "#ffb78a",
                    fontWeight: 600,
                    fontSize: 14,
                    border: "1px solid rgba(255,120,0,0.3)",
                    cursor: "pointer",
                    transition: "0.25s",
                  }}
                  className="hover-card"
                >
                  {text}
                </button>
              ))}
            </div>

            <p
              style={{
                marginTop: 14,
                fontSize: 14,
                color: "#c9b8a8",
                textAlign: "center",
              }}
            >
              Instant preview of lesson assets.
            </p>
          </div>
        </section>

        {/* LOWER GRID */}
        <section style={{ marginTop: 50 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: 20,
            }}
          >
            {[
              { title: "Practical Skills", desc: "Designed for real-world impact." },
              { title: "Local Languages", desc: "Hindi, Marathi, English built-in." },
              { title: "Teacher Tools", desc: "Export, share, schedule classes." },
            ].map((card) => (
              <div
                key={card.title}
                style={{
                  background: "rgba(30,22,18,0.6)",
                  padding: 26,
                  borderRadius: 14,
                  border: "1px solid rgba(255,120,0,0.25)",
                  boxShadow: "0 0 16px rgba(255,120,0,0.15)",
                }}
                className="hover-card"
              >
                <h3 style={{ color: "#ff9b50", fontSize: 20, fontWeight: 700 }}>
                  {card.title}
                </h3>
                <p style={{ marginTop: 6, color: "#c9b8a8" }}>{card.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
