"use client";

import useSendMessage from "../../context/useSendMessage";
import { useState, useRef } from "react";
import { useSocketContext } from "../../context/SocketContext";
import useConversation from "../../zustand/userConveration";
import { useTheme } from "../../context/ThemeContext";
import {
  Paperclip,
  Send,
  Smile,
  X,
  FileText,
  Music,
  Video,
  Image,
} from "lucide-react";

// pick icon based on file type
const FileIcon = ({ type }) => {
  if (type?.startsWith("image/")) return <Image className="w-4 h-4" />;
  if (type?.startsWith("video/")) return <Video className="w-4 h-4" />;
  if (type?.startsWith("audio/")) return <Music className="w-4 h-4" />;
  return <FileText className="w-4 h-4" />;
};

function TypeMsg() {
  const { loading, progress, sendMessages } = useSendMessage();
  const { selectedConversation } = useConversation();
  const { theme } = useTheme();
  const isLight = theme === "light";

  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null); // File object
  const [previewUrl, setPreviewUrl] = useState(null); // for image preview
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const { socket } = useSocketContext();

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

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleChange = (e) => {
    setMessage(e.target.value);
    if (!socket) return;
    socket.emit("typing", { receiverId: selectedConversation._id });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", { receiverId: selectedConversation._id });
    }, 1000);
  };

  const canSend =
    (message.trim() || selectedFile) && !loading && selectedConversation;

  const accent = isLight ? "#7F77DD" : "#AFA9EC";
  const subColor = isLight ? "#9E88B8" : "#7A6A90";
  const inputBg = isLight ? "rgba(248,242,255,0.9)" : "rgba(30,18,50,0.9)";
  const inputBorder = isLight
    ? "1px solid rgba(127,119,221,0.18)"
    : "1px solid rgba(140,100,200,0.15)";

  return (
    <div className="px-4 pb-4 pt-2">
      {/* ── File preview strip ──────────────────────────────── */}
      {selectedFile && (
        <div
          className="flex items-center gap-3 mb-2 px-3 py-2 rounded-xl"
          style={{ background: inputBg, border: inputBorder }}
        >
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="preview"
              className="w-10 h-10 object-cover rounded-lg flex-shrink-0"
            />
          ) : (
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{
                background: isLight
                  ? "rgba(127,119,221,0.1)"
                  : "rgba(175,169,236,0.08)",
                color: accent,
              }}
            >
              <FileIcon type={selectedFile.type} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p
              className="text-xs font-medium truncate"
              style={{ color: isLight ? "#1A1228" : "#F0EAF8" }}
            >
              {selectedFile.name}
            </p>
            <p className="text-xs" style={{ color: subColor }}>
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          <button
            type="button"
            onClick={clearFile}
            className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" style={{ color: subColor }} />
          </button>
        </div>
      )}

      {/* ── Upload progress bar ─────────────────────────────── */}
      {loading && progress > 0 && (
        <div className="mb-2 px-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs" style={{ color: subColor }}>
              Uploading...
            </span>
            <span className="text-xs font-medium" style={{ color: accent }}>
              {progress}%
            </span>
          </div>
          <div
            className="h-1 rounded-full overflow-hidden"
            style={{
              background: isLight
                ? "rgba(127,119,221,0.12)"
                : "rgba(175,169,236,0.08)",
            }}
          >
            <div
              className="h-full rounded-full transition-all duration-200"
              style={{
                width: `${progress}%`,
                background: "linear-gradient(90deg, #7F77DD, #D4537E)",
              }}
            />
          </div>
        </div>
      )}

      {/* ── Input row ───────────────────────────────────────── */}
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx"
          onChange={handleFileSelect}
          disabled={!selectedConversation}
        />

        {/* Attach button */}
        <button
          type="button"
          disabled={!selectedConversation || loading}
          onClick={() => fileInputRef.current?.click()}
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 hover:scale-105 disabled:opacity-40"
          style={{
            background: selectedFile
              ? isLight
                ? "rgba(127,119,221,0.18)"
                : "rgba(175,169,236,0.14)"
              : isLight
                ? "rgba(127,119,221,0.08)"
                : "rgba(175,169,236,0.06)",
            border: selectedFile ? `1px solid ${accent}` : inputBorder,
          }}
        >
          <Paperclip className="w-4 h-4" style={{ color: accent }} />
        </button>

        {/* Text input */}
        <div
          className="flex-1 flex items-center gap-3 rounded-2xl px-4 py-2.5 transition-all duration-200"
          style={{
            background: inputBg,
            border: inputBorder,
            backdropFilter: "blur(10px)",
          }}
        >
          <button
            type="button"
            className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
          >
            <Smile className="w-4 h-4" style={{ color: subColor }} />
          </button>
          <input
            type="text"
            placeholder={
              selectedFile
                ? "Add a caption..."
                : !selectedConversation
                  ? "Select a conversation..."
                  : "Write a message..."
            }
            value={message}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            disabled={loading || !selectedConversation}
            className="flex-1 bg-transparent text-sm outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ color: isLight ? "#1A1228" : "#F0EAF8" }}
          />
        </div>

        {/* Send button */}
        <button
          type="submit"
          disabled={!canSend}
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: canSend
              ? "linear-gradient(135deg, #7F77DD, #D4537E)"
              : isLight
                ? "rgba(127,119,221,0.15)"
                : "rgba(175,169,236,0.08)",
            boxShadow: canSend ? "0 4px 14px rgba(127,119,221,0.4)" : "none",
          }}
        >
          {loading && progress === 0 ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Send
              className="w-4 h-4"
              style={{ color: canSend ? "#fff" : subColor, marginLeft: "2px" }}
            />
          )}
        </button>
      </form>
    </div>
  );
}

export default TypeMsg;
