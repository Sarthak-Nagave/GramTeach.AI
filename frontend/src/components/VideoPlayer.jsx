// src/components/VideoPlayer.jsx
import React, { useEffect, useRef, useState } from "react";

export default function VideoPlayer({ src, scenes = [], onEnded }) {
  const videoRef = useRef(null);
  const [activeSubtitle, setActiveSubtitle] = useState("");

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateSubtitle = () => {
      const t = video.currentTime;
      const scene = scenes.find((s) => t >= s.start && t < s.end);
      setActiveSubtitle(scene ? scene.subtitle : "");
    };

    video.addEventListener("timeupdate", updateSubtitle);

    return () => video.removeEventListener("timeupdate", updateSubtitle);
  }, [scenes]);

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1100px",   // ⭐ perfect safe width
        margin: "0 auto",
        padding: "12px",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          background: "#000",
          borderRadius: "14px",
          overflow: "hidden",

          /* ⭐ TRUE RESPONSIVE THEATRE MODE */
          paddingTop: "42%", // ~21:9 ratio but SAFE for all screens

          boxShadow: "0 12px 35px rgba(0,0,0,0.45)",
        }}
      >
        <video
          ref={videoRef}
          src={src}
          controls
          autoPlay
          playsInline
          onEnded={onEnded}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "contain", // ⭐ no overflow ever
          }}
        />

        {activeSubtitle && (
          <div
            style={{
              position: "absolute",
              bottom: "6%",
              width: "100%",
              textAlign: "center",
              pointerEvents: "none",
            }}
          >
            <span
              style={{
                background: "rgba(0,0,0,0.55)",
                padding: "6px 16px",
                borderRadius: "8px",
                color: "#fff",
                fontWeight: 600,
                fontSize: "clamp(14px, 1.6vw, 22px)",
                textShadow: "0 2px 6px rgba(0,0,0,0.9)",
              }}
            >
              {activeSubtitle}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
