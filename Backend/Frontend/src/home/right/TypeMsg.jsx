"use client";

import useSendMessage from "../../context/useSendMessage";
import { useState } from "react";
import useConversation from "../../zutstand/userConveration";
import { useTheme } from "../../context/ThemeContext";
import { Paperclip, Hash, Send } from "lucide-react";

function TypeMsg() {
  const { loading, sendMessages } = useSendMessage();
  const { selectedConversation } = useConversation();
  const { theme } = useTheme();
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

  return (
    <div
      className={`
      p-4 border-t transition-all duration-500
      ${
        theme === "light"
          ? "bg-gradient-to-r from-white via-blue-50 to-purple-50 border-blue-200/50"
          : "bg-slate-900/70 backdrop-blur-md border-slate-700/60"
      }
    `}
    >
      <form onSubmit={handleSubmit} className="flex items-end gap-3">
        {/* Left Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            className={`
              p-2 rounded-xl transition-all duration-300 transform hover:scale-110 active:scale-95
              ${
                theme === "light"
                  ? "text-blue-600 hover:text-blue-700 hover:bg-blue-100 shadow-sm hover:shadow-blue-300/30"
                  : "text-slate-400 hover:text-blue-400 hover:bg-slate-800 shadow-md shadow-blue-500/10"
              }
            `}
            disabled={!selectedConversation}
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <button
            type="button"
            className={`
              p-2 rounded-xl transition-all duration-300 transform hover:scale-110 active:scale-95
              ${
                theme === "light"
                  ? "text-purple-600 hover:text-purple-700 hover:bg-purple-100 shadow-sm hover:shadow-purple-300/30"
                  : "text-slate-400 hover:text-purple-400 hover:bg-slate-800 shadow-md shadow-purple-500/10"
              }
            `}
            disabled={!selectedConversation}
          >
            <Hash className="w-4 h-4" />
          </button>
        </div>

        {/* Input Field */}
        <div className="flex-1 relative group">
          <input
            type="text"
            placeholder={
              !selectedConversation
                ? "Select a conversation to start messaging..."
                : "Type your message..."
            }
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading || !selectedConversation}
            className={`
              w-full px-4 py-2.5 rounded-xl text-sm transition-all duration-500 focus:outline-none focus:ring-2 
              disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.01]
              ${
                theme === "light"
                  ? "bg-white/90 border border-blue-200 text-gray-800 placeholder:text-blue-400 focus:border-blue-400 focus:ring-blue-400/20 shadow-md shadow-blue-500/10"
                  : "bg-slate-800/70 border border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20 shadow-lg shadow-blue-500/5"
              }
            `}
          />
          {/* Glow effect on hover */}
          <div
            className={`
              absolute inset-0 rounded-xl transition-all duration-700 pointer-events-none
              ${
                theme === "light"
                  ? "group-hover:shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                  : "group-hover:shadow-[0_0_20px_rgba(59,130,246,0.25)]"
              }
            `}
          />
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={!message.trim() || loading || !selectedConversation}
          className={`
            px-5 py-2.5 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 transform hover:scale-105 active:scale-95
            disabled:opacity-50 disabled:cursor-not-allowed
            ${
              theme === "light"
                ? "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white shadow-lg shadow-blue-500/25"
                : "bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-700/20"
            }
          `}
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">Send</span>
        </button>
      </form>
    </div>
  );
}

export default TypeMsg;
