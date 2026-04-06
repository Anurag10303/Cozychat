"use client";

import useConversation from "../../zustand/userConveration.js";
import { useSocketContext } from "../../context/SocketContext.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";
import BASE_URL from "../../config.js";
import { useState } from "react";

const AVATAR_COLORS = [
  {
    light: { bg: "#EEEDFE", text: "#3C3489" },
    dark: { bg: "#1C1440", text: "#CECBF6" },
  },
  {
    light: { bg: "#FBEAF0", text: "#72243E" },
    dark: { bg: "#2A0C1A", text: "#ED93B1" },
  },
  {
    light: { bg: "#E1F5EE", text: "#085041" },
    dark: { bg: "#061A12", text: "#5DCAA5" },
  },
  {
    light: { bg: "#E6F1FB", text: "#0C447C" },
    dark: { bg: "#06142A", text: "#85B7EB" },
  },
  {
    light: { bg: "#FAEEDA", text: "#633806" },
    dark: { bg: "#2A1E06", text: "#FAC775" },
  },
];

function getColorIndex(name = "") {
  let sum = 0;
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
  return sum % AVATAR_COLORS.length;
}

function getInitials(name = "") {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function User({ user }) {
  const { onlineUser } = useSocketContext();
  console.log("user._id:", String(user._id), "onlineUsers:", onlineUser);
  const isOnline = user.isOnline ?? onlineUser.includes(String(user._id));
  const { selectedConversation, setSelectedConversation } = useConversation();
  const isSelected = selectedConversation?._id === user._id;
  const { theme } = useTheme();
  const isLight = theme === "light";
  const [imgError, setImgError] = useState(false);

  const colorIdx = getColorIndex(user.fullName);
  const colors = AVATAR_COLORS[colorIdx][isLight ? "light" : "dark"];

  const unread = user.unreadCount || 0;

  return (
    <div
      className="flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all duration-200"
      style={{
        background: isSelected
          ? isLight
            ? "rgba(127,119,221,0.12)"
            : "rgba(127,119,221,0.18)"
          : "transparent",
        border: isSelected
          ? isLight
            ? "1px solid rgba(127,119,221,0.25)"
            : "1px solid rgba(175,169,236,0.2)"
          : "1px solid transparent",
        boxShadow: isSelected ? "0 2px 16px rgba(127,119,221,0.1)" : "none",
      }}
      onClick={() => setSelectedConversation(user)}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold overflow-hidden"
          style={{
            background: colors.bg,
            color: colors.text,
            boxShadow: isSelected
              ? `0 0 0 2px #7F77DD, 0 0 0 4px rgba(127,119,221,0.15)`
              : "none",
          }}
        >
          {user.avatar && !imgError ? (
            <img
              src={`${BASE_URL}/uploads/${user.avatar}`}
              alt={user.fullName}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          ) : (
            getInitials(user.fullName)
          )}
        </div>

        {/* Online dot */}
        {isOnline && (
          <div
            className="absolute bottom-0 right-0 w-3 h-3 rounded-full"
            style={{
              background: "#3DD68C",
              border: `2px solid ${isLight ? "rgba(255,252,255,0.95)" : "rgba(18,10,32,0.95)"}`,
            }}
          />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h3
            className="text-sm font-semibold truncate"
            style={{ color: isLight ? "#1A1228" : "#F0EAF8" }}
          >
            {user.fullName}
          </h3>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* ✅ Unread badge — only show when not selected and has unread */}
            {!isSelected && unread > 0 && (
              <span
                className="text-xs font-bold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #7F77DD, #D4537E)",
                  color: "#fff",
                  fontSize: "10px",
                  lineHeight: 1,
                }}
              >
                {unread > 99 ? "99+" : unread}
              </span>
            )}

            {/* Online pill */}
            {isOnline && (
              <span
                className="text-xs font-medium px-2 py-0.5 rounded-full"
                style={{
                  background: isLight
                    ? "rgba(61,214,140,0.12)"
                    : "rgba(61,214,140,0.1)",
                  color: "#3DD68C",
                }}
              >
                Online
              </span>
            )}
          </div>
        </div>

        <p
          className="text-xs truncate mt-0.5"
          style={{ color: isLight ? "#9E88B8" : "#7A6A90" }}
        >
          {user.email}
        </p>
      </div>
    </div>
  );
}

export default User;
