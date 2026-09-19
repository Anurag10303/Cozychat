import useSendMessage from "../../context/useSendMessage";
import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSocketContext } from "../../context/SocketContext";
import useConversation from "../../zustand/userConveration";
import { FileText, Image, Music, Paperclip, SendHorizontal, Smile, Video, X } from "lucide-react";
import { EASE, spring } from "../../lib/motion";

const EMOJIS = [
  "😀", "😂", "🥲", "😊", "😍", "🥰", "😎", "🤔",
  "😅", "😭", "😴", "🙃", "😇", "🤗", "🙌", "👏",
  "👍", "👎", "🙏", "💪", "👋", "🤝", "✌️", "👌",
  "❤️", "🔥", "✨", "🎉", "💯", "✅", "☕", "🌙",
];

// pick icon based on file type
const FileIcon = ({ type }) => {
  if (type?.startsWith("image/")) return <Image className="h-4 w-4" />;
  if (type?.startsWith("video/")) return <Video className="h-4 w-4" />;
  if (type?.startsWith("audio/")) return <Music className="h-4 w-4" />;
  return <FileText className="h-4 w-4" />;
};

const formatSize = (bytes) =>
  bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(0)} KB` : `${(bytes / 1024 / 1024).toFixed(2)} MB`;

function EmojiPicker({ open, onPick, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (!ref.current?.contains(e.target) && !e.target.closest?.("[data-emoji-trigger]")) onClose();
    };
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 6, scale: 0.98 }}
          transition={{ duration: 0.18, ease: EASE }}
          className="absolute bottom-full left-0 z-20 mb-2 w-[min(19rem,calc(100vw-1.5rem))] origin-bottom-left rounded-2xl border border-line bg-elevated p-2 shadow-float"
          role="dialog"
          aria-label="Emoji picker"
        >
          <div className="grid grid-cols-8 gap-0.5">
            {EMOJIS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => onPick(e)}
                className="grid aspect-square place-items-center rounded-lg text-xl transition-transform hover:scale-110 hover:bg-surface-2"
                aria-label={`Insert ${e}`}
              >
                {e}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function TypeMsg() {
  const { loading, progress, sendMessages } = useSendMessage();
  const { selectedConversation } = useConversation();

  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null); // File object
  const [previewUrl, setPreviewUrl] = useState(null); // for image preview
  const [emojiOpen, setEmojiOpen] = useState(false);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const { socket } = useSocketContext();

  // Grow with content up to ~6 lines, then scroll inside.
  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [message]);

  // Focus the composer when a conversation opens (skip on touch to avoid popping the keyboard).
  useEffect(() => {
    if (window.matchMedia("(pointer: fine)").matches) textareaRef.current?.focus();
  }, [selectedConversation?._id]);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    if (file.type.startsWith("image/")) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
    // reset input so same file can be re-selected
    e.target.value = "";
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if ((!message.trim() && !selectedFile) || loading) return;
    await sendMessages(message.trim(), selectedFile || null);
    setMessage("");
    clearFile();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const emitTyping = () => {
    if (!socket) return;
    socket.emit("typing", { receiverId: selectedConversation._id });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", { receiverId: selectedConversation._id });
    }, 1000);
  };

  const handleChange = (e) => {
    setMessage(e.target.value);
    emitTyping();
  };

  const insertEmoji = (emoji) => {
    const el = textareaRef.current;
    const start = el?.selectionStart ?? message.length;
    const end = el?.selectionEnd ?? message.length;
    setMessage((m) => m.slice(0, start) + emoji + m.slice(end));
    emitTyping();
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(start + emoji.length, start + emoji.length);
    });
  };

  const canSend = (message.trim() || selectedFile) && !loading && selectedConversation;

  return (
    <div className="safe-bottom shrink-0 border-t border-line bg-bar px-2 pt-2.5 sm:px-4 lg:px-6">
      <div className="mx-auto w-full max-w-3xl">
        {/* ── File preview strip ──────────────────────────────── */}
        <AnimatePresence initial={false}>
          {selectedFile && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease: EASE }}
              className="overflow-hidden"
            >
              <div className="mb-2 flex items-center gap-3 rounded-xl border border-line bg-surface px-2.5 py-2 shadow-soft">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="h-11 w-11 shrink-0 rounded-lg object-cover" />
                ) : (
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent-text">
                    <FileIcon type={selectedFile.type} />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-fg">{selectedFile.name}</p>
                  <p className="text-xs text-muted">{formatSize(selectedFile.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={clearFile}
                  disabled={loading}
                  aria-label="Remove attachment"
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-fg disabled:opacity-40"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Upload progress bar ─────────────────────────────── */}
        <AnimatePresence>
          {loading && progress > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mb-2 px-1"
            >
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-muted">Uploading…</span>
                <span className="font-mono font-medium text-accent-text tabular-nums">{progress}%</span>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-surface-3">
                <motion.div
                  className="brand-gradient h-full rounded-full"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.2 }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Input row ───────────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="relative flex items-end gap-1.5 sm:gap-2">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx"
            onChange={handleFileSelect}
            disabled={!selectedConversation}
          />

          <EmojiPicker open={emojiOpen} onPick={insertEmoji} onClose={() => setEmojiOpen(false)} />

          {/* Attach button */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.9 }}
            disabled={!selectedConversation || loading}
            onClick={() => fileInputRef.current?.click()}
            aria-label="Attach a file"
            title="Attach"
            className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl transition-colors disabled:opacity-40 ${
              selectedFile ? "bg-accent-soft text-accent-text" : "text-muted hover:bg-surface-2 hover:text-fg"
            }`}
          >
            <Paperclip className="h-5 w-5" />
          </motion.button>

          {/* Text input */}
          <div className="flex min-w-0 flex-1 items-end gap-1 rounded-2xl border border-line bg-surface pr-1 pl-1.5 shadow-soft transition-[border-color,box-shadow] duration-200 focus-within:border-accent focus-within:ring-4 focus-within:ring-ring">
            <button
              type="button"
              data-emoji-trigger
              onClick={() => setEmojiOpen((o) => !o)}
              aria-label="Insert emoji"
              aria-expanded={emojiOpen}
              className={`mb-1 grid h-9 w-9 shrink-0 place-items-center rounded-xl transition-colors ${
                emojiOpen ? "bg-accent-soft text-accent-text" : "text-subtle hover:text-fg"
              }`}
            >
              <Smile className="h-5 w-5" />
            </button>
            <textarea
              ref={textareaRef}
              rows={1}
              placeholder={
                selectedFile
                  ? "Add a caption…"
                  : !selectedConversation
                    ? "Select a conversation…"
                    : "Write a message…"
              }
              value={message}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              disabled={loading || !selectedConversation}
              enterKeyHint="send"
              aria-label="Message"
              className="scroll-thin max-h-40 min-h-[2.75rem] flex-1 resize-none bg-transparent py-[0.7rem] text-[16px] leading-[1.4] text-fg outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:text-[0.9375rem]"
            />
          </div>

          {/* Send button */}
          <motion.button
            type="submit"
            disabled={!canSend}
            whileTap={canSend ? { scale: 0.9 } : undefined}
            animate={{ scale: canSend ? 1 : 0.94 }}
            transition={spring}
            aria-label="Send message"
            className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl transition-colors duration-200 ${
              canSend
                ? "bubble-gradient text-accent-fg shadow-accent hover:brightness-110"
                : "bg-surface-2 text-subtle"
            }`}
          >
            {loading && progress === 0 ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <SendHorizontal className="h-[18px] w-[18px]" />
            )}
          </motion.button>
        </form>
        <p className="mt-1.5 hidden text-center text-[11px] text-subtle lg:block">
          <kbd className="font-mono">Enter</kbd> to send · <kbd className="font-mono">Shift + Enter</kbd> for a new line
        </p>
      </div>
    </div>
  );
}

export default TypeMsg;
