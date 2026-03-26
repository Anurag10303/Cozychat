"use client";

import useSendMessage from "../../context/useSendMessage";
import { useState, useRef } from "react";
import { useSocketContext } from "../../context/SocketContext";
import useConversation from "../../zustand/userConveration";
import { useTheme } from "../../context/ThemeContext";
import { Paperclip, Send, Smile } from "lucide-react";

function TypeMsg() {
  const { loading, sendMessages } = useSendMessage();
  const { selectedConversation } = useConversation();
  const { theme } = useTheme();
  const isLight = theme === "light";
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || loading) return;
    await sendMessages(message.trim());
    setMessage("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const typingTimeoutRef = useRef(null);
  const { socket } = useSocketContext();
  
  const handleChange = (e) => {
    setMessage(e.target.value);

    if (!socket) return;

    // 🔥 emit typing
    socket.emit("typing", { receiverId: selectedConversation._id });

    // 🔥 debounce stopTyping
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", { receiverId: selectedConversation._id });
    }, 1000);
  };

  const canSend = message.trim() && !loading && selectedConversation;

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        {/* Attach */}
        <button
          type="button"
          disabled={!selectedConversation}
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 hover:scale-105 disabled:opacity-40"
          style={{
            background: isLight
              ? "rgba(127,119,221,0.08)"
              : "rgba(175,169,236,0.06)",
            border: isLight
              ? "1px solid rgba(127,119,221,0.15)"
              : "1px solid rgba(175,169,236,0.1)",
          }}
        >
          <Paperclip
            className="w-4 h-4"
            style={{ color: isLight ? "#7F77DD" : "#AFA9EC" }}
          />
        </button>

        {/* Input box */}
        <div
          className="flex-1 flex items-center gap-3 rounded-2xl px-4 py-2.5 transition-all duration-200"
          style={{
            background: isLight
              ? "rgba(248,242,255,0.9)"
              : "rgba(30,18,50,0.9)",
            border: isLight
              ? "1px solid rgba(127,119,221,0.18)"
              : "1px solid rgba(140,100,200,0.15)",
            backdropFilter: "blur(10px)",
          }}
        >
          <button
            type="button"
            className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
          >
            <Smile
              className="w-4 h-4"
              style={{ color: isLight ? "#9E88B8" : "#7A6A90" }}
            />
          </button>

          <input
            type="text"
            placeholder={
              !selectedConversation
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
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Send
              className="w-4 h-4"
              style={{
                color: canSend ? "#fff" : isLight ? "#9E88B8" : "#7A6A90",
                marginLeft: "2px",
              }}
            />
          )}
        </button>
      </form>
    </div>
  );
}

export default TypeMsg;
