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
  const {
    loading,
    isFetchingMore,
    hasMore,
    messages = [],
    fetchOlderMessages,
  } = useGetMessage();
  const { selectedConversation } = useConversation();
  const { socket } = useSocketContext();
  const { theme } = useTheme();
  const isLight = theme === "light";
  useGetSocketMessage();

  const lastMsgRef = useRef();
  const topRef = useRef();
  const containerRef = useRef();
  const [typingUser, setTypingUser] = useState(null);

  // ✅ Track whether this is the initial load for this conversation
  const isInitialLoad = useRef(true);

  // ✅ Reset initial load flag when conversation changes
  useEffect(() => {
    isInitialLoad.current = true;
  }, [selectedConversation?._id]);

  // ✅ Scroll logic:
  // - On initial load → instant jump to bottom (no smooth, no animation lag)
  // - On new socket message → smooth scroll to bottom
  // - On pagination prepend (fetchOlderMessages) → do NOT scroll at all
  useEffect(() => {
    if (messages.length === 0) return;

    if (isInitialLoad.current) {
      // Use requestAnimationFrame to wait for DOM paint before scrolling
      requestAnimationFrame(() => {
        lastMsgRef.current?.scrollIntoView({ behavior: "instant" });
        isInitialLoad.current = false;
      });
    }
  }, [messages]);

  // ✅ Separate effect — smooth scroll only for new incoming/outgoing messages
  // We detect "new message" by checking if the last message just changed
  const prevLastMsgId = useRef(null);
  useEffect(() => {
    if (messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    if (!lastMsg) return;

    const lastId = lastMsg._id ?? lastMsg.clientMessageId;

    // Only smooth scroll if a genuinely new message appeared at the bottom
    if (!isInitialLoad.current && lastId !== prevLastMsgId.current) {
      lastMsgRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    prevLastMsgId.current = lastId;
  }, [messages]);

  // ✅ IntersectionObserver — fetch older messages when user scrolls to top
  useEffect(() => {
    if (!topRef.current || !hasMore) return;

    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (!entry.isIntersecting || isFetchingMore) return;

        const container = containerRef.current;
        const prevScrollHeight = container?.scrollHeight ?? 0;

        await fetchOlderMessages();

        // Restore scroll position so view doesn't jump to top after prepend
        requestAnimationFrame(() => {
          if (container) {
            container.scrollTop = container.scrollHeight - prevScrollHeight;
          }
        });
      },
      { threshold: 1.0 },
    );

    observer.observe(topRef.current);
    return () => observer.disconnect();
  }, [hasMore, isFetchingMore, fetchOlderMessages]);

  // Typing indicator listeners
  useEffect(() => {
    if (!socket || !selectedConversation) return;

    const typingTimeoutRef = { current: null };

    const handleTyping = ({ senderId }) => {
      if (senderId?.toString() === selectedConversation._id?.toString()) {
        setTypingUser(senderId);
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setTypingUser(null), 1500);
      }
    };

    const handleStopTyping = ({ senderId }) => {
      if (senderId?.toString() === selectedConversation._id?.toString())
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

    // ✅ Only send senderId — backend uses senderId + receiverId (from socket auth)
    // conversationId was always undefined since user objects don't carry it
    socket.emit("markSeen", {
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
    <div ref={containerRef} className="h-full p-5 overflow-y-auto msg-scroll">
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
          {/* Top sentinel — IntersectionObserver watches this for pagination */}
          <div ref={topRef} className="h-1" />

          {/* Spinner while loading older messages */}
          {isFetchingMore && (
            <div className="flex justify-center py-3">
              <div
                className="w-4 h-4 border-2 rounded-full animate-spin"
                style={{
                  borderColor: isLight
                    ? "rgba(127,119,221,0.3)"
                    : "rgba(175,169,236,0.3)",
                  borderTopColor: isLight ? "#7F77DD" : "#AFA9EC",
                }}
              />
            </div>
          )}

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
