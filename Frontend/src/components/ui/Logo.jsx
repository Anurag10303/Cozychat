import { useId } from "react";

// Brand mark: two overlapping speech bubbles on a soft iris tile.
export function LogoMark({ size = 32, className = "" }) {
  const id = useId();
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6C6CF0" />
          <stop offset="0.55" stopColor="#8B5CF6" />
          <stop offset="1" stopColor="#A855F7" />
        </linearGradient>
        <linearGradient id={`${id}-dot`} x1="10" y1="15" x2="19" y2="15" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6C6CF0" />
          <stop offset="1" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill={`url(#${id}-bg)`} />
      <rect x="0.5" y="0.5" width="31" height="31" rx="8.5" stroke="white" strokeOpacity="0.14" />
      {/* back bubble */}
      <path
        d="M13.5 7.5h7.25a4.75 4.75 0 0 1 4.75 4.75v.5a4.75 4.75 0 0 1-1.6 3.56l.6 2.94-3.2-1.75h-7.8Z"
        fill="white"
        fillOpacity="0.42"
      />
      {/* front bubble */}
      <path
        d="M11.75 11h6.5A5.25 5.25 0 0 1 23.5 16.25v.5A5.25 5.25 0 0 1 18.25 22H13l-4.2 2.6.95-3.43A5.24 5.24 0 0 1 6.5 16.75v-.5A5.25 5.25 0 0 1 11.75 11Z"
        fill="white"
      />
      <circle cx="11.6" cy="16.5" r="1.15" fill={`url(#${id}-dot)`} />
      <circle cx="15" cy="16.5" r="1.15" fill={`url(#${id}-dot)`} />
      <circle cx="18.4" cy="16.5" r="1.15" fill={`url(#${id}-dot)`} />
    </svg>
  );
}

export default function Logo({ size = 32, showWordmark = true, className = "" }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark size={size} className="shrink-0 drop-shadow-[0_4px_12px_rgba(108,108,240,0.35)]" />
      {showWordmark && (
        <span className="text-[1.0625rem] font-semibold tracking-[-0.02em] text-fg">
          Cozy<span className="text-accent-text">Chat</span>
        </span>
      )}
    </span>
  );
}
