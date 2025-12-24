// src/components/PrimaryButton.jsx
import React from "react";

export default function PrimaryButton({ children, icon, onClick, variant = "primary", className = "" }) {
  const base = "btn " + (variant === "primary" ? "btn-primary" : "btn-outline");
  return (
    <button onClick={onClick} className={`${base} ${className}`}>
      <span className="btn-icon" aria-hidden>{icon}</span>
      <span>{children}</span>
    </button>
  );
}
