// src/pages/LessonPackages.jsx
import React from "react";
import { Link } from "react-router-dom";

const classes = [
  { id: 1, grade: "1st Standard", desc: "Basic learning videos for class 1 students." },
  { id: 2, grade: "2nd Standard", desc: "Fun learning concepts for class 2." },
  { id: 3, grade: "3rd Standard", desc: "Skill-based topics for class 3." },
  { id: 4, grade: "4th Standard", desc: "General knowledge and academic basics." },
  { id: 5, grade: "5th Standard", desc: "Maths, science & language foundation." },
  { id: 6, grade: "6th Standard", desc: "Core subject explanation videos." },
  { id: 7, grade: "7th Standard", desc: "Science, maths & English skill lessons." },
  { id: 8, grade: "8th Standard", desc: "Smart learning + concept builder." },
  { id: 9, grade: "9th Standard", desc: "Exam-focused lessons & skills." },
  { id: 10, grade: "10th Standard", desc: "Board exam preparation content." },
  { id: 11, grade: "11th Standard", desc: "Subject-focused academic support." },
  { id: 12, grade: "12th Standard", desc: "Higher secondary skill-based lessons." },
];

export default function LessonPackages() {
  return (
    <div
      className="page"
      style={{
        minHeight: "100vh",
        background: "var(--bg-100)",
        paddingTop: 40,
        paddingBottom: 60,
      }}
    >
      <div className="container">

        {/* PAGE TITLE */}
        <h1
          className="h1"
          style={{
            marginBottom: 28,
            fontWeight: 800,
            background: "linear-gradient(90deg, #ff8800, #ff5500)",
            WebkitBackgroundClip: "text",
            color: "transparent",
          }}
        >
          Lesson Packages (1st – 12th)
        </h1>

        {/* GRID */}
        <div
          className="grid-3"
          style={{
            gap: 24,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          }}
        >
          {classes.map((c) => (
            <div
              key={c.id}
              className="card"
              style={{
                padding: 24,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: 14,
                boxShadow: "0 0 24px rgba(255,120,20,0.12)",
                transition: "0.3s ease",
                backdropFilter: "blur(6px)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 0 35px rgba(255,120,20,0.25)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0px)";
                e.currentTarget.style.boxShadow = "0 0 24px rgba(255,120,20,0.12)";
              }}
            >
              {/* TITLE */}
              <h2 style={{ fontWeight: 800, color: "#ff8b2f", marginBottom: 6 }}>
                {c.grade}
              </h2>

              {/* DESCRIPTION */}
              <p style={{ color: "var(--muted)", marginBottom: 16, lineHeight: 1.5 }}>
                {c.desc}
              </p>

              {/* FIXED BUTTON */}
              <Link
                to={`/packages/${c.id}`}
                className="btn btn-primary"
                style={{
                  padding: "10px 16px",
                  width: "fit-content",
                  fontSize: 15,
                  fontWeight: 600,
                }}
              >
                Choose Package →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
