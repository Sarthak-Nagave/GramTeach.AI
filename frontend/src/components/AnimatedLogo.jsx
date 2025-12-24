import React from "react";
import "./logo-anim.css";

export default function AnimatedLogo() {
  return (
    <div className="logo-wrapper">
      <img
        src="/logo_flat.svg"
        alt="GramTeach Logo"
        className="logo-3d"
      />
    </div>
  );
}
