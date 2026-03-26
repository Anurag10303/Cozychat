"use client";

import { useAuth } from "../../context/AuthProvider";
import { useTheme } from "../../context/ThemeContext";
import { Check, CheckCheck } from "lucide-react";

function Message({ message }) {
  const [authUser] = useAuth();
  const { theme } = useTheme();
  const isLight = theme === "light";
  // ✅ convert both to string before comparing
  const itsMe =
    message.senderId?.toString() === authUser?.user?._id?.toString();

  const createdAt = new Date(message.createdAt);
  const formattedTime = createdAt.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const getStatusIcon = () => {
    if (!itsMe) return null;

    switch (message.status) {
      case "sent":
        return (
          <Check
            className="w-3 h-3"
            style={{ color: isLight ? "#9E88B8" : "#7A6A90" }}
          />
        );

      case "delivered":
        return (
          <CheckCheck
            className="w-3 h-3"
            style={{ color: isLight ? "#9E88B8" : "#7A6A90" }}
          />
        );

      case "seen":
        return (
          <CheckCheck
            className="w-3 h-3"
            style={{ color: "#4FC3F7" }} // 🔥 blue for seen
          />
        );

      default:
        return null;
    }
  };
  return (
    <div
      className={`flex mb-2 ${itsMe ? "justify-end" : "justify-start"}`}
      style={{
        animation: itsMe
          ? "slideInRight 0.25s ease-out"
          : "slideInLeft 0.25s ease-out",
      }}
    >
      <div
        className={`flex flex-col max-w-[72%] ${itsMe ? "items-end" : "items-start"}`}
      >
        <div
          className="px-4 py-2.5 transition-all duration-200 hover:scale-[1.01]"
          style={
            itsMe
              ? {
                  background: isLight
                    ? "rgba(127,119,221,0.14)"
                    : "rgba(100,80,200,0.3)",
                  border: isLight
                    ? "1px solid rgba(127,119,221,0.28)"
                    : "1px solid rgba(175,169,236,0.2)",
                  borderRadius: "18px 18px 4px 18px",
                  backdropFilter: "blur(12px)",
                  color: isLight ? "#26215C" : "#CECBF6",
                }
              : {
                  background: isLight
                    ? "rgba(255,255,255,0.88)"
                    : "rgba(30,20,48,0.9)",
                  border: isLight
                    ? "1px solid rgba(127,80,160,0.1)"
                    : "1px solid rgba(140,100,200,0.14)",
                  borderRadius: "18px 18px 18px 4px",
                  backdropFilter: "blur(12px)",
                  color: isLight ? "#1E1828" : "#E8DFF5",
                }
          }
        >
          <p className="text-sm leading-relaxed break-words">
            {message.message}
          </p>
        </div>

        {/* Timestamp + status */}
        <div
          className={`flex items-center gap-1 mt-1 ${itsMe ? "pr-1" : "pl-1"}`}
        >
          <span
            className="text-xs"
            style={{ color: isLight ? "#B098C0" : "#6A5A80" }}
          >
            {formattedTime}
          </span>
          {getStatusIcon()}
        </div>
      </div>
    </div>
  );
}

export default Message;
