"use client";

import Message from "./Message";
import useGetMessage from "../../context/useGetMessage";
import useGetSocketMessage from "../../context/useGetSocketMessage";
import useConversation from "../../zustand/userConveration";
import { useTheme } from "../../context/ThemeContext";
import { useRef, useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { useSocketContext } from "../../context/SocketContext";

const getDateLabel = (dateStr) => {
  if (!dateStr) return "Today";
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

function Messages() {
  const { loading, messages = [] } = useGetMessage();
  const { selectedConversation } = useConversation();
  const { socket } = useSocketContext();
  const { theme } = useTheme();
  const isLight = theme === "light";
  useGetSocketMessage();

  const lastMsgRef = useRef();
  const [typingUser, setTypingUser] = useState(null);

  // Scroll to bottom when messages change or typing indicator appears/disappears
  useEffect(() => {
    lastMsgRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUser]);

  // Typing indicator listeners
  useEffect(() => {
    if (!socket || !selectedConversation) return;

    const typingTimeoutRef = { current: null };

    const handleTyping = ({ senderId }) => {
      if (senderId?.toString() === selectedConversation?._id?.toString()) {
        setTypingUser(senderId);
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setTypingUser(null), 1500);
      }
    };

    const handleStopTyping = ({ senderId }) => {
      if (senderId?.toString() === selectedConversation?._id?.toString())
        setTypingUser(null);
    };

    socket.on("typing", handleTyping);
    socket.on("stopTyping", handleStopTyping);

    return () => {
      socket.off("typing", handleTyping);
      socket.off("stopTyping", handleStopTyping);
      clearTimeout(typingTimeoutRef.current);
    };
  }, [socket, selectedConversation]);

  // Emit markSeen when user opens a conversation with unread messages
  useEffect(() => {
    if (!socket || !selectedConversation || messages.length === 0) return;

    const hasUnread = messages.some(
      (msg) =>
        msg.senderId?.toString() === selectedConversation._id?.toString() &&
        msg.status !== "seen",
    );

    if (!hasUnread) return;

    socket.emit("markSeen", {
      conversationId: selectedConversation.conversationId,
      senderId: selectedConversation._id,
    });
  }, [messages, selectedConversation, socket]);

  if (loading) {
    return (
      <div className="h-full flex flex-col justify-end p-5 space-y-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}
          >
            <div
              className="rounded-2xl px-4 py-3 skeleton-shimmer"
              style={{
                width: `${140 + ((i * 30) % 80)}px`,
                height: "36px",
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
          {/* Dynamic date chip */}
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
              {getDateLabel(messages[0]?.createdAt)}
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

          {/* Typing indicator */}
          {typingUser && (
            <div className="flex justify-start mt-1 pl-1" ref={lastMsgRef}>
              <div
                className="px-4 py-2.5"
                style={{
                  background: isLight
                    ? "rgba(255,255,255,0.88)"
                    : "rgba(30,20,48,0.9)",
                  border: isLight
                    ? "1px solid rgba(127,80,160,0.1)"
                    : "1px solid rgba(140,100,200,0.14)",
                  borderRadius: "18px 18px 18px 4px",
                  backdropFilter: "blur(12px)",
                }}
              >
                <div className="flex gap-1 items-center h-4">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="typing-dot w-1.5 h-1.5 rounded-full block"
                      style={{
                        background: isLight ? "#9E88B8" : "#7A6A90",
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Messages;