"use client";

import Message from "./Message";
import useGetMessage from "../../context/useGetMessage";
import useGetSocketMessage from "../../context/useGetSocketMessage";
import useConversation from "../../zustand/userConveration";
import { useTheme } from "../../context/ThemeContext";
import { useRef, useEffect } from "react";
import { MessageCircle } from "lucide-react";

function Messages() {
  const { loading, messages = [] } = useGetMessage();
  const { selectedConversation } = useConversation();
  const { theme } = useTheme();
  const isLight = theme === "light";
  useGetSocketMessage();
  const lastMsgRef = useRef();

  useEffect(() => {
    setTimeout(() => {
      if (lastMsgRef.current) {
        lastMsgRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  }, [messages]);

  if (loading) {
    return (
      <div className="h-full flex flex-col justify-end p-5 space-y-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}
          >
            <div
              className="rounded-2xl px-4 py-3"
              style={{
                width: `${140 + ((i * 30) % 80)}px`,
                height: "36px",
                background: isLight
                  ? "rgba(127,119,221,0.08)"
                  : "rgba(175,169,236,0.06)",
                animation: "shimmer 1.5s infinite",
                backgroundSize: "200% 100%",
              }}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="h-full p-5">
      {messages.length === 0 ? (
        <div className="h-full flex items-center justify-center">
          <div
            className="text-center p-8 rounded-3xl max-w-xs"
            style={{
              background: isLight
                ? "rgba(255,252,255,0.6)"
                : "rgba(22,12,40,0.6)",
              backdropFilter: "blur(16px)",
              border: isLight
                ? "1px solid rgba(127,119,221,0.12)"
                : "1px solid rgba(140,100,200,0.1)",
            }}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{
                background:
                  "linear-gradient(135deg, rgba(127,119,221,0.2), rgba(212,83,126,0.2))",
              }}
            >
              <MessageCircle
                className="w-6 h-6"
                style={{ color: isLight ? "#7F77DD" : "#AFA9EC" }}
              />
            </div>
            <h3
              className="text-base font-bold mb-2"
              style={{
                color: isLight ? "#1A1228" : "#F0EAF8",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              Say hello to {selectedConversation?.fullName}
            </h3>
            <p
              className="text-xs leading-relaxed"
              style={{ color: isLight ? "#9E88B8" : "#7A6A90" }}
            >
              Send a message to start the conversation
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-1">
          {/* Date chip */}
          <div className="flex justify-center mb-4">
            <span
              className="text-xs px-3 py-1 rounded-full"
              style={{
                background: isLight
                  ? "rgba(255,252,255,0.7)"
                  : "rgba(22,12,40,0.7)",
                backdropFilter: "blur(8px)",
                border: isLight
                  ? "1px solid rgba(127,119,221,0.12)"
                  : "1px solid rgba(140,100,200,0.1)",
                color: isLight ? "#9E88B8" : "#7A6A90",
              }}
            >
              Today
            </span>
          </div>

          {messages.map((message, index) => (
            <div
              key={message._id ?? message.clientMessageId ?? index}
              ref={index === messages.length - 1 ? lastMsgRef : null}
            >
              <Message message={message} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Messages;
