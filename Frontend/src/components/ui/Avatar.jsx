import { useEffect, useState } from "react";

const TONES = 6;

function toneFor(name = "") {
  let sum = 0;
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
  return sum % TONES;
}

function getInitials(name = "") {
  return (
    name
      .trim()
      .split(/\s+/)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?"
  );
}

/**
 * Circular avatar with image → initials fallback and an optional presence dot.
 * `ringClass` sets the presence dot's border so it cuts cleanly into any surface.
 */
export default function Avatar({
  name = "",
  src,
  size = 40,
  online = false,
  selected = false,
  ringClass = "border-elevated",
  className = "",
}) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);

  const tone = toneFor(name);
  const showImage = src && src.trim() && !failed;
  const dot = Math.max(10, Math.round(size * 0.28));

  return (
    <span
      className={`relative inline-flex shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <span
        className={`flex h-full w-full items-center justify-center overflow-hidden rounded-full font-semibold tracking-tight select-none transition-shadow duration-200 ${
          selected ? "ring-2 ring-accent ring-offset-2 ring-offset-elevated" : ""
        }`}
        style={{
          background: `var(--av-${tone}-bg)`,
          color: `var(--av-${tone}-fg)`,
          fontSize: Math.max(11, Math.round(size * 0.36)),
        }}
      >
        {showImage ? (
          <img
            src={src}
            alt={name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
            onError={() => setFailed(true)}
          />
        ) : (
          getInitials(name)
        )}
      </span>
      {online && (
        <span
          className={`absolute right-0 bottom-0 rounded-full border-2 bg-online ${ringClass}`}
          style={{ width: dot, height: dot }}
          aria-label="Online"
        />
      )}
    </span>
  );
}
