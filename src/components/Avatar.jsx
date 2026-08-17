"use client";

import { useState } from "react";

const COLORS = ["#FF5C7C", "#FFC145", "#9D8DF1", "#5CC9FF", "#7ED957"];

function colorFor(name) {
  const str = name || "?";
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

function initialsFor(name) {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  return parts.length > 1
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : parts[0].slice(0, 2).toUpperCase();
}

export default function Avatar({ src, name, size = 40, className = "" }) {
  const [errored, setErrored] = useState(false);

  if (!src || errored) {
    return (
      <div
        className={`flex items-center justify-center rounded-full font-semibold text-[#15121F] shrink-0 ${className}`}
        style={{ width: size, height: size, backgroundColor: colorFor(name), fontSize: size * 0.38 }}
      >
        {initialsFor(name)}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={name || "User"}
      onError={() => setErrored(true)}
      className={`rounded-full object-cover shrink-0 ${className}`}
      style={{ width: size, height: size }}
    />
  );
}