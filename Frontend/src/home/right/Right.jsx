"use client";

import Chatuser from "./Chatuser";
import Messages from "./Messages";
import TypeMsg from "./TypeMsg";
import useConversation from "../../zustand/userConveration";
import { useTheme } from "../../context/ThemeContext";
import { MessageCircle } from "lucide-react";

function Right() {
  const { selectedConversation } = useConversation();
  const { theme } = useTheme();
  const isLight = theme === "light";

  if (!selectedConversation) {
    return (
      <div
        className="flex-1 flex items-center justify-center relative overflow-hidden"
        style={{
          background: isLight
            ? "radial-gradient(ellipse at 30% 20%, #EDE0FF 0%, #FAF5FF 40%, #FFF0F8 100%)"
            : "radial-gradient(ellipse at 30% 20%, #1E0A35 0%, #0E0A18 50%, #120816 100%)",
        }}
      >
        {/* Background blobs */}
        <div
          className={`absolute top-[-80px] right-[-80px] w-72 h-72 rounded-full blur-[100px] opacity-20 ${isLight ? "bg-purple-300" : "bg-purple-900"}`}
          style={{ animation: "blob-float 8s ease-in-out infinite" }}
        />
        <div
          className={`absolute bottom-[-80px] left-[-80px] w-64 h-64 rounded-full blur-[100px] opacity-15 ${isLight ? "bg-pink-300" : "bg-pink-900"}`}
          style={{ animation: "blob-float 10s ease-in-out infinite reverse" }}
        />

        <div
          className="relative z-10 text-center p-10 rounded-3xl"
          style={{
            background: isLight
              ? "rgba(255,252,255,0.7)"
              : "rgba(22,12,40,0.7)",
            backdropFilter: "blur(20px)",
            border: isLight
              ? "1px solid rgba(127,119,221,0.15)"
              : "1px solid rgba(140,100,200,0.12)",
            boxShadow: "0 8px 40px rgba(127,119,221,0.12)",
          }}
        >
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6"
            style={{
              background: "linear-gradient(135deg, #7F77DD, #D4537E)",
              boxShadow: "0 8px 28px rgba(127,119,221,0.4)",
            }}
          >
            <MessageCircle className="w-9 h-9 text-white" />
          </div>

          <h3
            className="text-2xl font-bold mb-3"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              background: "linear-gradient(135deg, #7F77DD, #D4537E)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Welcome to CozyChat
          </h3>
          <p
            className="text-sm leading-relaxed max-w-xs mx-auto"
            style={{ color: isLight ? "#9E88B8" : "#7A6A90" }}
          >
            Select a conversation from the sidebar to start chatting.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex-1 flex flex-col h-screen"
      style={{
        background: isLight
          ? "radial-gradient(ellipse at 30% 0%, #EDE0FF 0%, #FAF5FF 35%, #FFF0F8 80%, #FAF5FF 100%)"
          : "radial-gradient(ellipse at 30% 0%, #1E0A35 0%, #0E0A18 40%, #100816 100%)",
      }}
    >
      {/* Header */}
      <div
        className="flex-shrink-0 sticky top-0 z-10"
        style={{
          background: isLight
            ? "rgba(255,252,255,0.82)"
            : "rgba(18,10,32,0.88)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: isLight
            ? "1px solid rgba(127,119,221,0.12)"
            : "1px solid rgba(140,100,200,0.1)",
        }}
      >
        <Chatuser />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto msg-scroll">
        <Messages />
      </div>

      {/* Input */}
      <div
        className="flex-shrink-0"
        style={{
          borderTop: isLight
            ? "1px solid rgba(127,119,221,0.12)"
            : "1px solid rgba(140,100,200,0.1)",
          background: isLight
            ? "rgba(255,252,255,0.82)"
            : "rgba(18,10,32,0.88)",
          backdropFilter: "blur(20px)",
        }}
      >
        <TypeMsg />
      </div>
    </div>
  );
}

export default Right;
