"use client";

import Chatuser from "./Chatuser";
import Messages from "./Messages";
import TypeMsg from "./TypeMsg";
import useConversation from "../../zustand/userConveration";
import { useTheme } from "../../context/ThemeContext";

function Right() {
  const { selectedConversation } = useConversation();
  const { theme } = useTheme();

  // 🎨 Shared theme styles
  const bgColor =
    theme === "light"
      ? "bg-gradient-to-br from-blue-50 via-white to-purple-50"
      : "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900";

  const textColor = theme === "light" ? "text-gray-800" : "text-slate-100";

  // 💬 When no conversation is selected
  if (!selectedConversation) {
    return (
      <div
        className={`flex-1 flex items-center justify-center ${bgColor} transition-all duration-500`}
      >
        <div
          className={`text-center p-8 rounded-2xl shadow-lg backdrop-blur-md border 
          ${theme === "light" ? "border-gray-200" : "border-slate-700"}`}
        >
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 
            shadow-md animate-pulse transition-all duration-300 
            ${
              theme === "light"
                ? "bg-gradient-to-br from-blue-200 to-purple-200"
                : "bg-slate-700"
            }`}
          >
            <span className="text-4xl">💬</span>
          </div>

          <h3 className={`text-2xl font-bold mb-3 ${textColor}`}>
            Welcome to CozyChat
          </h3>
          <p
            className={`max-w-md mx-auto leading-relaxed transition-colors duration-300 
            ${theme === "light" ? "text-gray-600" : "text-slate-400"}`}
          >
            Start a new conversation or select an existing one from the sidebar
            to begin chatting.
          </p>
        </div>
      </div>
    );
  }

  // 💬 When a conversation is active
  return (
    <div
      className={`flex-1 flex flex-col h-screen ${bgColor} transition-all duration-500`}
    >
      {/* Header */}
      <div
        className={`flex-shrink-0 shadow-sm sticky top-0 z-10 
        ${
          theme === "light" ? "bg-white/70 backdrop-blur-md" : "bg-slate-800/70"
        }`}
      >
        <Chatuser />
      </div>

      {/* Messages */}
      <div
        className={`flex-1 overflow-y-auto px-2 sm:px-4 py-2 scrollbar-thin scrollbar-thumb-rounded-md 
        ${
          theme === "light"
            ? "scrollbar-thumb-blue-300"
            : "scrollbar-thumb-slate-600"
        }`}
      >
        <Messages />
      </div>

      {/* Message input */}
      <div
        className={`flex-shrink-0 border-t 
        ${
          theme === "light"
            ? "border-gray-200 bg-white/80"
            : "border-slate-700 bg-slate-800/70"
        }`}
      >
        <TypeMsg />
      </div>
    </div>
  );
}

export default Right;
