import React from "react";

export default function AdminFooter() {
  return (
    <footer
      style={{
        marginTop: "40px",
        padding: "14px 0",
        textAlign: "center",
        fontSize: "12px",
        color: "rgba(255,255,255,0.55)",
        borderTop: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <span style={{ color: "#ff8c00", fontWeight: 600 }}>
        GramTeach.AI
      </span>{" "}
      © 2026 · Admin Panel
    </footer>
  );
}
