"use client";

import { useAuth } from "../../context/AuthProvider";
import { useTheme } from "../../context/ThemeContext";
import {
  Check,
  CheckCheck,
  Download,
  Play,
  FileText,
  Music,
} from "lucide-react";
import { useState, useRef } from "react";

// ── Lightbox ──────────────────────────────────────────────────
function Lightbox({ url, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.88)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="relative max-w-[90vw] max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={url}
          alt="full"
          className="max-w-full max-h-[85vh] rounded-xl object-contain"
        />
        <div className="absolute top-3 right-3 flex gap-2">
          <a
            href={url}
            download
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.15)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <Download className="w-4 h-4 text-white" />
          </a>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold"
            style={{ background: "rgba(255,255,255,0.15)" }}
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Audio waveform player ─────────────────────────────────────
function AudioPlayer({ url, isLight }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);
  const accent = isLight ? "#7F77DD" : "#AFA9EC";

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play();
      setPlaying(true);
    }
  };

  const onTimeUpdate = () => {
    const a = audioRef.current;
    if (!a) return;
    setProgress(a.duration ? (a.currentTime / a.duration) * 100 : 0);
  };

  const onLoaded = () => setDuration(audioRef.current?.duration || 0);
  const onEnded = () => {
    setPlaying(false);
    setProgress(0);
  };

  const seek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    if (audioRef.current)
      audioRef.current.currentTime = pct * audioRef.current.duration;
  };

  const fmt = (s) =>
    `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  const bars = Array.from({ length: 28 }, (_, i) => {
    const heights = [
      4, 7, 12, 8, 14, 6, 10, 16, 9, 13, 5, 11, 15, 8, 12, 6, 14, 10, 7, 13, 9,
      5, 11, 16, 8, 12, 7, 4,
    ];
    return heights[i % heights.length];
  });

  return (
    <div className="flex items-center gap-3 w-52">
      <audio
        ref={audioRef}
        src={url}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoaded}
        onEnded={onEnded}
      />
      <button
        onClick={toggle}
        className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
        style={{ background: accent }}
      >
        {playing ? (
          <span className="w-3 h-3 flex gap-0.5">
            {[0, 1].map((i) => (
              <span key={i} className="w-1 h-full rounded-sm bg-white" />
            ))}
          </span>
        ) : (
          <Play className="w-3.5 h-3.5 text-white ml-0.5" />
        )}
      </button>

      <div className="flex-1 flex flex-col gap-1">
        <div
          className="flex items-end gap-[2px] h-8 cursor-pointer"
          onClick={seek}
        >
          {bars.map((h, i) => {
            const filled = (i / bars.length) * 100 < progress;
            return (
              <div
                key={i}
                className="flex-1 rounded-full transition-all duration-100"
                style={{
                  height: `${h}px`,
                  background: filled
                    ? accent
                    : isLight
                      ? "rgba(127,119,221,0.25)"
                      : "rgba(175,169,236,0.2)",
                  minWidth: "2px",
                }}
              />
            );
          })}
        </div>
        <span
          className="text-xs"
          style={{ color: isLight ? "#9E88B8" : "#7A6A90" }}
        >
          {duration
            ? fmt(duration * (progress / 100)) + " / " + fmt(duration)
            : "0:00"}
        </span>
      </div>
    </div>
  );
}

// ── Video player ──────────────────────────
function VideoPlayer({ url, isLight }) {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef(null);

  if (playing) {
    return (
      <video
        ref={videoRef}
        src={url}
        controls
        autoPlay
        className="max-w-[260px] max-h-[200px] rounded-xl object-cover"
      />
    );
  }

  return (
    <div
      className="relative max-w-[260px] cursor-pointer group"
      onClick={() => setPlaying(true)}
    >
      <video
        src={url + "#t=0.5"}
        className="max-w-[260px] max-h-[200px] rounded-xl object-cover"
        preload="metadata"
      />
      <div
        className="absolute inset-0 flex items-center justify-center rounded-xl transition-opacity group-hover:opacity-90"
        style={{ background: "rgba(0,0,0,0.35)" }}
      >
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.9)" }}
        >
          <Play className="w-5 h-5 ml-0.5" style={{ color: "#1A1228" }} />
        </div>
      </div>
    </div>
  );
}

// ── Document attachment ───────────────────────────────────────
function DocumentAttachment({ url, fileName, mimeType, isLight }) {
  const ext = fileName?.split(".").pop()?.toUpperCase() || "FILE";
  const [downloading, setDownloading] = useState(false);

  const handleClick = async (e) => {
    e.preventDefault();

    try {
      setDownloading(true);
      const response = await fetch(url);

      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      // Create a temporary <a> and click it — forces download
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = fileName || "document";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Clean up blob URL
      setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
    } catch (err) {
      console.error("Download error:", err);
      // Fallback — open in new tab
      window.open(url, "_blank", "noopener,noreferrer");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <a
      onClick={handleClick}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl no-underline transition-all hover:scale-[1.02]"
      style={{
        background: isLight
          ? "rgba(127,119,221,0.08)"
          : "rgba(175,169,236,0.07)",
        border: isLight
          ? "1px solid rgba(127,119,221,0.18)"
          : "1px solid rgba(175,169,236,0.12)",
        minWidth: "180px",
        maxWidth: "240px",
      }}
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold"
        style={{
          background: isLight
            ? "rgba(127,119,221,0.15)"
            : "rgba(175,169,236,0.12)",
          color: isLight ? "#7F77DD" : "#AFA9EC",
        }}
      >
        {ext}
      </div>

      <div className="flex-1 min-w-0">
        <p
          className="text-xs font-medium truncate"
          style={{ color: isLight ? "#1A1228" : "#F0EAF8" }}
        >
          {fileName || "Document"}
        </p>
        <p
          className="text-xs"
          style={{ color: isLight ? "#9E88B8" : "#7A6A90" }}
        >
          Tap to download
        </p>
      </div>

      <Download
        className="w-4 h-4 flex-shrink-0"
        style={{ color: isLight ? "#7F77DD" : "#AFA9EC" }}
      />
    </a>
  );
}
// ── Main Message component ────────────────────────────────────
function Message({ message }) {
  const [authUser] = useAuth();
  const { theme } = useTheme();
  const isLight = theme === "light";
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const itsMe =
    message.senderId?.toString() === authUser?.user?._id?.toString();

  const formattedTime = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const getStatusIcon = () => {
    if (!itsMe) return null;
    const color =
      message.status === "seen" ? "#4FC3F7" : isLight ? "#9E88B8" : "#7A6A90";
    return message.status === "sent" ? (
      <Check className="w-3 h-3" style={{ color }} />
    ) : (
      <CheckCheck className="w-3 h-3" style={{ color }} />
    );
  };

  const bubbleStyle = itsMe
    ? {
        background: isLight ? "rgba(127,119,221,0.14)" : "rgba(100,80,200,0.3)",
        border: isLight
          ? "1px solid rgba(127,119,221,0.28)"
          : "1px solid rgba(175,169,236,0.2)",
        borderRadius: "18px 18px 4px 18px",
        backdropFilter: "blur(12px)",
        color: isLight ? "#26215C" : "#CECBF6",
      }
    : {
        background: isLight ? "rgba(255,255,255,0.88)" : "rgba(30,20,48,0.9)",
        border: isLight
          ? "1px solid rgba(127,80,160,0.1)"
          : "1px solid rgba(140,100,200,0.14)",
        borderRadius: "18px 18px 18px 4px",
        backdropFilter: "blur(12px)",
        color: isLight ? "#1E1828" : "#E8DFF5",
      };

  const hasFile = !!message.fileUrl;

  return (
    <>
      {lightboxOpen && message.fileType === "image" && (
        <Lightbox
          url={message.fileUrl}
          onClose={() => setLightboxOpen(false)}
        />
      )}

      <div
        className={`flex mb-2 ${itsMe ? "justify-end" : "justify-start"}`}
        style={{
          animation: itsMe
            ? "slideInRight 0.25s ease-out"
            : "slideInLeft 0.25s ease-out",
        }}
      >
        <div
          className={`flex flex-col max-w-[72%] ${itsMe ? "items-end" : "items-start"}`}
        >
          <div
            className="px-3 py-2.5 transition-all duration-200 hover:scale-[1.01]"
            style={bubbleStyle}
          >
            {hasFile && message.fileType === "image" && (
              <img
                src={message.fileUrl}
                alt="attachment"
                className="max-w-[260px] max-h-[200px] rounded-xl object-cover mb-1 cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setLightboxOpen(true)}
              />
            )}

            {hasFile && message.fileType === "video" && (
              <div className="mb-1">
                <VideoPlayer url={message.fileUrl} isLight={isLight} />
              </div>
            )}

            {hasFile && message.fileType === "audio" && (
              <div className="mb-1 py-1">
                <AudioPlayer url={message.fileUrl} isLight={isLight} />
              </div>
            )}

            {hasFile && message.fileType === "document" && (
              <div className="mb-1">
                <DocumentAttachment
                  url={message.fileUrl}
                  fileName={message.fileName}
                  mimeType={message.fileMimeType}
                  isLight={isLight}
                />
              </div>
            )}

            {message.message && (
              <p className="text-sm leading-relaxed break-words">
                {message.message}
              </p>
            )}
          </div>

          <div
            className={`flex items-center gap-1 mt-1 ${itsMe ? "pr-1" : "pl-1"}`}
          >
            <span
              className="text-xs"
              style={{ color: isLight ? "#B098C0" : "#6A5A80" }}
            >
              {formattedTime}
            </span>
            {getStatusIcon()}
          </div>
        </div>
      </div>
    </>
  );
}

export default Message;
