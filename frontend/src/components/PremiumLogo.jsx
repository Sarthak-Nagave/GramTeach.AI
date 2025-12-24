// src/components/PremiumLogo.jsx
import React from "react";

export default function PremiumLogo({size=40}){
  return (
    <svg width={size} height={size} viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg" style={{borderRadius:12}}>
      <defs>
        <linearGradient id="g1" x1="0" x2="1">
          <stop offset="0" stopColor="#5EE7DF"/>
          <stop offset="0.45" stopColor="#7C5CFF"/>
          <stop offset="1" stopColor="#4F46E5"/>
        </linearGradient>
      </defs>
      <rect width="160" height="160" rx="28" fill="url(#g1)"/>
      <path d="M44 44 L100 80 L44 116 Z" fill="#fff" />
    </svg>
  );
}
