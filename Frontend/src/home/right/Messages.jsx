"use client";

import Message from "./Message";
import useGetMessage from "../../context/useGetMessage";
import Loading from "../../components/Loading";
import { useRef, useEffect } from "react";
import useGetSocketMessage from "../../context/useGetSocketMessage";
import useConversation from "../../zustand/userConveration";
import { useTheme } from "../../context/ThemeContext";

function Messages() {
  const { loading, messages } = useGetMessage();
  const { selectedConversation } = useConversation();
  const { theme } = useTheme();
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
      <div
        className={`
          h-full flex items-center justify-center transition-all duration-500
          ${
            theme === "light"
              ? "bg-gradient-to-b from-white via-blue-50 to-purple-50"
              : "bg-slate-950/90 backdrop-blur-lg"
          }
        `}
      >
        <Loading />
      </div>
    );
  }

  return (
    <div
      className={`
        h-full overflow-y-auto transition-all duration-500 msg
        scrollbar-thin scrollbar-thumb-rounded-xl
        ${
          theme === "light"
            ? "bg-gradient-to-b from-white via-blue-50 to-purple-50 scrollbar-thumb-blue-300/50 scrollbar-track-transparent"
            : "bg-slate-950/90 backdrop-blur-lg scrollbar-thumb-slate-700/60 scrollbar-track-slate-900/30"
        }
      `}
    >
      <div className="p-5 space-y-2">
        {messages.length === 0 ? (
          <div
            className={`
              text-center py-16 rounded-2xl transition-all duration-500
              ${
                theme === "light"
                  ? "bg-gradient-to-br from-blue-100/70 via-purple-100/70 to-pink-100/70 shadow-inner border border-blue-200/40"
                  : "bg-slate-800/50 border border-slate-700/50 shadow-inner"
              }
            `}
          >
            <div
              className={`
                w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5 transition-all duration-500 shadow-lg
                ${
                  theme === "light"
                    ? "bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 shadow-blue-400/30"
                    : "bg-gradient-to-br from-blue-700 via-purple-700 to-indigo-800 shadow-blue-900/40"
                }
              `}
            >
              <span className="text-2xl text-white drop-shadow-md">👋</span>
            </div>
            <h3
              className={`
                text-lg font-semibold mb-2 tracking-wide transition-colors duration-500
                ${theme === "light" ? "text-gray-800" : "text-white"}
              `}
            >
              Say hello to {selectedConversation?.fullName}
            </h3>
            <p
              className={`
                text-sm transition-colors duration-500
                ${theme === "light" ? "text-gray-600" : "text-slate-400"}
              `}
            >
              Start your conversation by sending a message 💬
            </p>
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              const showAvatar =
                index === 0 ||
                messages[index - 1]?.senderId !== message.senderId;
              return (
                <div key={message._id} ref={lastMsgRef}>
                  <Message message={message} showAvatar={showAvatar} />
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}

export default Messages;
