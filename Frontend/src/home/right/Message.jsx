import { useAuth } from "../../context/AuthProvider";
import { useE2EE } from "../../context/E2EEContext";
import useConversation from "../../zustand/userConveration";
import { Check, CheckCheck, Download, FileText, Lock, Pause, Play, Unlock, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { isEncrypted } from "../../utils/crypto";
import { EASE } from "../../lib/motion";

// Placeholders E2EEContext.decryptText returns when a message can't be read.
const UNREADABLE = new Set(["[Decryption failed]", "[Encrypted — key unavailable]"]);

// ── Lightbox ──────────────────────────────────────────────────
function Lightbox({ url, open, onClose }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
        >
          <motion.img
            src={url}
            alt="Full size attachment"
            className="max-h-[88dvh] max-w-full rounded-2xl object-contain shadow-2xl"
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.28, ease: EASE }}
            onClick={(e) => e.stopPropagation()}
          />
          <div className="safe-top absolute top-4 right-4 flex gap-2">
            <a
              href={url}
              download
              className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20"
              onClick={(e) => e.stopPropagation()}
              aria-label="Download image"
            >
              <Download className="h-4 w-4" />
            </a>
            <button
              type="button"
              onClick={onClose}
              className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20"
              aria-label="Close preview"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

// ── Audio waveform player ─────────────────────────────────────
const BAR_HEIGHTS = [
  4, 7, 12, 8, 14, 6, 10, 16, 9, 13, 5, 11, 15, 8, 12, 6, 14, 10, 7, 13, 9, 5, 11, 16, 8, 12, 7, 4,
];

function AudioPlayer({ url, mine }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

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
    if (audioRef.current) audioRef.current.currentTime = pct * audioRef.current.duration;
  };

  const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  return (
    <div className="flex w-[min(15rem,62vw)] items-center gap-3 py-1">
      <audio
        ref={audioRef}
        src={url}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoaded}
        onEnded={onEnded}
      />
      <motion.button
        type="button"
        onClick={toggle}
        whileTap={{ scale: 0.9 }}
        aria-label={playing ? "Pause" : "Play"}
        className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${
          mine ? "bg-white text-accent" : "bg-accent text-accent-fg"
        }`}
      >
        {playing ? <Pause className="h-3.5 w-3.5" fill="currentColor" /> : <Play className="ml-0.5 h-3.5 w-3.5" fill="currentColor" />}
      </motion.button>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex h-7 cursor-pointer items-center gap-[2px]" onClick={seek}>
          {BAR_HEIGHTS.map((h, i) => {
            const active = (i / BAR_HEIGHTS.length) * 100 < progress;
            return (
              <span
                key={i}
                className={`min-w-[2px] flex-1 rounded-full transition-colors duration-150 ${
                  mine
                    ? active ? "bg-white" : "bg-white/35"
                    : active ? "bg-accent" : "bg-line-strong"
                }`}
                style={{ height: `${h}px` }}
              />
            );
          })}
        </div>
        <span className={`font-mono text-[10.5px] tabular-nums ${mine ? "text-white/75" : "text-muted"}`}>
          {duration ? fmt(duration * (progress / 100)) + " / " + fmt(duration) : "0:00"}
        </span>
      </div>
    </div>
  );
}

// ── Video player ──────────────────────────────────────────────
function VideoPlayer({ url }) {
  const [playing, setPlaying] = useState(false);
  const cls = "block w-[min(18rem,68vw)] max-h-[20rem] rounded-[14px] object-cover bg-black";
  if (playing) {
    return <video src={url} controls autoPlay playsInline className={cls} />;
  }
  return (
    <button
      type="button"
      className="group relative block"
      onClick={() => setPlaying(true)}
      aria-label="Play video"
    >
      <video src={url + "#t=0.5"} className={cls} preload="metadata" playsInline muted />
      <span className="absolute inset-0 grid place-items-center rounded-[14px] bg-black/25 transition-colors group-hover:bg-black/35">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-white/95 text-[#111118] shadow-lg transition-transform duration-200 group-hover:scale-105">
          <Play className="ml-0.5 h-5 w-5" fill="currentColor" />
        </span>
      </span>
    </button>
  );
}

// ── Document attachment ───────────────────────────────────────
function DocumentAttachment({ url, fileName, mine }) {
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
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = fileName || "document";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
    } catch {
      window.open(url, "_blank", "noopener,noreferrer");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={downloading}
      className={`flex w-[min(16rem,64vw)] items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
        mine ? "bg-white/12 hover:bg-white/20" : "border border-line bg-surface-2 hover:bg-surface-3"
      }`}
    >
      <span
        className={`relative grid h-10 w-9 shrink-0 place-items-center rounded-lg ${
          mine ? "bg-white/20 text-white" : "bg-accent-soft text-accent-text"
        }`}
      >
        <FileText className="h-4 w-4" />
        <span
          className={`absolute -bottom-1.5 rounded px-1 font-mono text-[8px] leading-3 font-semibold ${
            mine ? "bg-white text-accent" : "bg-accent text-accent-fg"
          }`}
        >
          {ext.slice(0, 4)}
        </span>
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-medium">{fileName || "Document"}</span>
        <span className={`block text-[11px] ${mine ? "text-white/70" : "text-muted"}`}>
          {downloading ? "Downloading…" : "Tap to download"}
        </span>
      </span>
      {downloading ? (
        <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent opacity-70" />
      ) : (
        <Download className={`h-4 w-4 shrink-0 ${mine ? "text-white/85" : "text-muted"}`} />
      )}
    </button>
  );
}

// ── Main Message component ────────────────────────────────────
function Message({ message, groupStart = true, groupEnd = true }) {
  const [authUser] = useAuth();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const { decryptText } = useE2EE();
  const { selectedConversation } = useConversation();

  const [displayText, setDisplayText] = useState(null);
  const [decryptionDone, setDecryptionDone] = useState(false);

  const itsMe = message.senderId?.toString() === authUser?.user?._id?.toString();

  // ── Decrypt the message text ────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function decrypt() {
      // If sender cached the plaintext locally (optimistic send), use it directly
      if (message._decryptedMessage !== undefined) {
        if (!cancelled) {
          setDisplayText(message._decryptedMessage);
          setDecryptionDone(true);
        }
        return;
      }

      const raw = message.message;
      if (!raw) {
        if (!cancelled) {
          setDisplayText("");
          setDecryptionDone(true);
        }
        return;
      }

      // Determine the partner's ID for key derivation
      const partnerId = itsMe ? selectedConversation?._id : message.senderId?.toString();

      if (!partnerId) {
        if (!cancelled) {
          setDisplayText(raw);
          setDecryptionDone(true);
        }
        return;
      }

      const decrypted = await decryptText(partnerId, raw);
      if (!cancelled) {
        setDisplayText(decrypted);
        setDecryptionDone(true);
      }
    }

    setDecryptionDone(false);
    decrypt();
    return () => {
      cancelled = true;
    };
  }, [message.message, message._decryptedMessage, itsMe, selectedConversation?._id]);

  const wasEncrypted = isEncrypted(message.message);
  const created = new Date(message.createdAt);
  const formattedTime = created.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const fullTime = created.toLocaleString([], { dateStyle: "medium", timeStyle: "short" });

  const hasFile = !!message.fileUrl;
  const hasText = !!(message.message || message._decryptedMessage);
  const isVisualMedia = hasFile && (message.fileType === "image" || message.fileType === "video");

  // Corners tighten where consecutive messages from the same person meet.
  const R = "18px";
  const r = "6px";
  const radius = itsMe
    ? `${R} ${groupStart ? R : r} ${r} ${R}`
    : `${groupStart ? R : r} ${R} ${R} ${r}`;

  const renderStatus = () => {
    if (!itsMe) return null;
    const seen = message.status === "seen";
    const Icon = message.status === "sent" ? Check : CheckCheck;
    return (
      <Icon
        className={`h-3.5 w-3.5 ${seen ? "text-sky-200" : "text-white/70"}`}
        aria-label={message.status || "sent"}
      />
    );
  };

  const renderMeta = (overlay = false) => (
    <span
      className={`inline-flex items-center gap-1 text-[10.5px] leading-none tabular-nums select-none ${
        overlay
          ? "rounded-full bg-black/45 px-2 py-1 text-white backdrop-blur-sm"
          : itsMe
            ? "text-white/70"
            : "text-subtle"
      }`}
      title={fullTime}
    >
      {hasText &&
        (wasEncrypted ? (
          <Lock className="h-2.5 w-2.5 opacity-80" aria-label="End-to-end encrypted" />
        ) : (
          <Unlock
            className={`h-2.5 w-2.5 ${itsMe || overlay ? "text-amber-200" : "text-warning"}`}
            aria-label="Not encrypted (legacy message)"
          />
        ))}
      {formattedTime}
      {renderStatus()}
    </span>
  );

  const metaPosition = !hasText
    ? "mt-1 flex justify-end"
    : isVisualMedia
      ? "absolute right-3.5 bottom-2"
      : "absolute right-3 bottom-1.5";

  return (
    <>
      {message.fileType === "image" && (
        <Lightbox url={message.fileUrl} open={lightboxOpen} onClose={() => setLightboxOpen(false)} />
      )}

      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.22, ease: EASE }}
        className={`flex ${itsMe ? "justify-end" : "justify-start"} ${groupEnd ? "mb-2.5" : "mb-0.5"}`}
        style={{ transformOrigin: itsMe ? "bottom right" : "bottom left" }}
      >
        <div
          className={`relative max-w-[86%] xs:max-w-[80%] sm:max-w-[72%] lg:max-w-[64%] ${
            itsMe
              ? "bg-bubble-out bubble-gradient text-bubble-out-fg shadow-[0_2px_10px_-4px_rgba(106,90,224,0.5)]"
              : "border border-line bg-bubble-in text-bubble-in-fg shadow-soft"
          } ${isVisualMedia ? "p-1" : "px-3.5 py-2"}`}
          style={{ borderRadius: radius }}
        >
          {/* File attachments */}
          {hasFile && message.fileType === "image" && (
            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              className="relative block overflow-hidden rounded-[14px]"
              aria-label="Open image"
            >
              <img
                src={message.fileUrl}
                alt="Attachment"
                loading="lazy"
                decoding="async"
                className="block max-h-[20rem] w-[min(18rem,68vw)] object-cover transition-transform duration-300 hover:scale-[1.02]"
              />
              {!hasText && (
                <span className="absolute right-2 bottom-2">{renderMeta(true)}</span>
              )}
            </button>
          )}
          {hasFile && message.fileType === "video" && (
            <div className="relative">
              <VideoPlayer url={message.fileUrl} />
              {!hasText && (
                <span className="pointer-events-none absolute top-2 right-2">{renderMeta(true)}</span>
              )}
            </div>
          )}
          {hasFile && message.fileType === "audio" && <AudioPlayer url={message.fileUrl} mine={itsMe} />}
          {hasFile && message.fileType === "document" && (
            <div className="py-1">
              <DocumentAttachment url={message.fileUrl} fileName={message.fileName} mine={itsMe} />
            </div>
          )}

          {/* Decrypted message text */}
          {hasText && (
            <div className={isVisualMedia ? "px-2.5 pt-1.5 pb-1" : hasFile ? "pt-1" : ""}>
              {!decryptionDone ? (
                <span className="inline-flex items-center gap-1.5 py-0.5 text-xs opacity-60">
                  <span className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
                  Decrypting…
                </span>
              ) : (
                <p className="text-[0.9375rem] leading-[1.45] break-words whitespace-pre-wrap">
                  {UNREADABLE.has(displayText) ? (
                    <span
                      className="inline-flex items-center gap-1.5 italic opacity-70"
                      title="This message was encrypted with keys that have since changed, so it can't be decrypted."
                    >
                      <Lock className="h-3.5 w-3.5 shrink-0" />
                      Message can't be decrypted
                    </span>
                  ) : (
                    displayText
                  )}
                  {/* Invisible spacer reserves room so the floating meta never overlaps text */}
                  <span
                    className={`invisible ml-2 inline-block ${itsMe ? "w-[5.25rem]" : "w-[4.25rem]"}`}
                    aria-hidden="true"
                  />
                </p>
              )}
            </div>
          )}

          {/* Timestamp + status + encryption */}
          {(hasText || !isVisualMedia) && <span className={metaPosition}>{renderMeta()}</span>}
        </div>
      </motion.div>
    </>
  );
}

export default Message;
