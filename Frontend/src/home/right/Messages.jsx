import Message from "./Message";
import useGetMessage from "../../context/useGetMessage";
import useGetSocketMessage from "../../context/useGetSocketMessage";
import useConversation from "../../zustand/userConveration";
import { useRef, useEffect, useState, Fragment } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, Lock } from "lucide-react";
import { useSocketContext } from "../../context/SocketContext";
import Avatar from "../../components/ui/Avatar";
import { EASE } from "../../lib/motion";

const GROUP_WINDOW_MS = 5 * 60 * 1000;

const getDateLabel = (dateStr) => {
  if (!dateStr) return "Today";
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString([], {
    weekday: date.getFullYear() === today.getFullYear() ? "short" : undefined,
    month: "short",
    day: "numeric",
    year: date.getFullYear() === today.getFullYear() ? undefined : "numeric",
  });
};

const dayKey = (d) => (d ? new Date(d).toDateString() : new Date().toDateString());

const sameGroup = (a, b) =>
  a &&
  b &&
  a.senderId?.toString() === b.senderId?.toString() &&
  dayKey(a.createdAt) === dayKey(b.createdAt) &&
  Math.abs(new Date(b.createdAt) - new Date(a.createdAt)) < GROUP_WINDOW_MS;

function DateDivider({ label }) {
  return (
    <div className="sticky top-2 z-[5] my-4 flex justify-center">
      <span className="rounded-full border border-line bg-elevated/90 px-3 py-1 text-[11px] font-medium tracking-wide text-muted shadow-soft backdrop-blur-md">
        {label}
      </span>
    </div>
  );
}

function EncryptionNotice() {
  return (
    <div className="mx-auto mb-2 flex max-w-sm items-start gap-2 rounded-xl border border-line bg-elevated/80 px-3.5 py-2.5 text-[11.5px] leading-relaxed text-muted backdrop-blur-md">
      <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-text" />
      <span>
        Messages are end-to-end encrypted. No one outside this chat, not even CozyChat, can read
        them.
      </span>
    </div>
  );
}

function TypingBubble() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 4, scale: 0.96 }}
      transition={{ duration: 0.2, ease: EASE }}
      className="mt-1 flex origin-bottom-left justify-start"
      aria-live="polite"
      aria-label="Typing"
    >
      <div className="flex h-9 items-center gap-1 rounded-2xl rounded-bl-md border border-line bg-bubble-in px-4 shadow-soft">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="block h-1.5 w-1.5 rounded-full bg-subtle"
            animate={{ y: [0, -4, 0], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
          />
        ))}
      </div>
    </motion.div>
  );
}

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
  useGetSocketMessage();

  const lastMsgRef = useRef();
  const topRef = useRef();
  const containerRef = useRef();
  const [typingUser, setTypingUser] = useState(null);
  const [showJump, setShowJump] = useState(false);

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

  // Keep the typing bubble in view, but only if the reader is already near the bottom
  useEffect(() => {
    const c = containerRef.current;
    if (!typingUser || !c) return;
    if (c.scrollHeight - c.scrollTop - c.clientHeight < 160) {
      c.scrollTo({ top: c.scrollHeight, behavior: "smooth" });
    }
  }, [typingUser]);

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

  const onScroll = (e) => {
    const c = e.currentTarget;
    setShowJump(c.scrollHeight - c.scrollTop - c.clientHeight > 480);
  };

  const jumpToLatest = () => {
    const c = containerRef.current;
    c?.scrollTo({ top: c.scrollHeight, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="mx-auto flex h-full max-w-3xl flex-col justify-end gap-3 px-4 py-6 sm:px-6" aria-busy="true">
        {[180, 240, 140, 280, 200, 160].map((w, i) => (
          <div key={i} className={`flex ${i % 3 === 1 ? "justify-end" : "justify-start"}`}>
            <div className="skeleton h-10 max-w-[70%] rounded-2xl" style={{ width: w }} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="relative h-full">
      <div
        ref={containerRef}
        onScroll={onScroll}
        className="scroll-thin h-full overflow-x-hidden overflow-y-auto overscroll-contain"
      >
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: EASE }}
              className="flex max-w-xs flex-col items-center rounded-3xl border border-line bg-elevated/90 px-8 py-9 text-center shadow-card backdrop-blur-md"
            >
              <Avatar
                name={selectedConversation?.fullName}
                src={selectedConversation?.avatar}
                size={64}
              />
              <h3 className="mt-4 text-base font-semibold tracking-[-0.01em] text-fg">
                Say hello to {selectedConversation?.fullName?.split(" ")[0]}
              </h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
                This is the beginning of your conversation. Messages are end-to-end encrypted.
              </p>
            </motion.div>
          </div>
        ) : (
          <div className="mx-auto w-full max-w-3xl px-3 pt-3 pb-4 sm:px-6 lg:px-8">
            {/* Top sentinel — IntersectionObserver watches this for pagination */}
            <div ref={topRef} className="h-1" />

            {/* Spinner while loading older messages */}
            {isFetchingMore && (
              <div className="flex justify-center py-3">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-line-strong border-t-accent" />
              </div>
            )}

            {!hasMore && !isFetchingMore && <EncryptionNotice />}

            {messages.map((message, index) => {
              const prev = messages[index - 1];
              const next = messages[index + 1];
              const newDay = !prev || dayKey(prev.createdAt) !== dayKey(message.createdAt);
              return (
                <Fragment key={message._id ?? message.clientMessageId ?? index}>
                  {newDay && <DateDivider label={getDateLabel(message.createdAt)} />}
                  <div ref={index === messages.length - 1 ? lastMsgRef : null}>
                    <Message
                      message={message}
                      groupStart={newDay || !sameGroup(prev, message)}
                      groupEnd={!sameGroup(message, next)}
                    />
                  </div>
                </Fragment>
              );
            })}

            {/* Typing indicator */}
            <AnimatePresence>
              {typingUser && (
                <div key="typing" ref={lastMsgRef}>
                  <TypingBubble />
                </div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showJump && (
          <motion.button
            type="button"
            onClick={jumpToLatest}
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.2, ease: EASE }}
            aria-label="Jump to latest message"
            className="absolute right-4 bottom-4 grid h-10 w-10 place-items-center rounded-full border border-line bg-elevated text-muted shadow-float hover:text-fg sm:right-6"
          >
            <ArrowDown className="h-4 w-4" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Messages;
