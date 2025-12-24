import React from "react";

export default function Footer() {
  return (
    <footer
      style={{
        width: "100%",
        padding: "16px 0",
        textAlign: "center",
        fontSize: "13px",
        color: "#b5b5b5",
        background: "#0f0f0f",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        lineHeight: "1.6",
      }}
    >
      <div style={{ fontWeight: 600, color: "#ff8c00" }}>
        GramTeach.AI © 2026
      </div>

      <div>AI-powered learning for Bharat</div>

      <div style={{ marginTop: "6px" }}>
        <a href="mailto:contact@gramteach.ai" style={{ color: "#b5b5b5" }}>
          contact@gramteach.ai
        </a>
        {" · "}
        <span style={{ cursor: "pointer" }}>Privacy</span>
        {" · "}
        <span style={{ cursor: "pointer" }}>Terms</span>
      </div>

      <div style={{ fontSize: "11px", marginTop: "4px", color: "#888" }}>
        Currently in beta
      </div>
    </footer>
  );
}
