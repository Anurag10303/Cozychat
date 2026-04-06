"use client";

import useConversation from "../../zustand/userConveration";
import { useSocketContext } from "../../context/SocketContext";
import { useTheme } from "../../context/ThemeContext";
import { Phone, Video, MoreVertical } from "lucide-react";
import BASE_URL from "../../config";

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

function Chatuser() {
  const { selectedConversation } = useConversation();
  const { onlineUser } = useSocketContext();
  const { theme } = useTheme();
  const isLight = theme === "light";

  const isOnline =
    selectedConversation &&
    onlineUser.map(String).includes(String(selectedConversation._id));
  const colorIdx = getColorIndex(selectedConversation?.fullName || "");
  const colors = AVATAR_COLORS[colorIdx][isLight ? "light" : "dark"];

  const actionBtnStyle = {
    width: "34px",
    height: "34px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: isLight ? "rgba(127,119,221,0.08)" : "rgba(175,169,236,0.08)",
    border: isLight
      ? "1px solid rgba(127,119,221,0.15)"
      : "1px solid rgba(175,169,236,0.1)",
    cursor: "pointer",
    transition: "all 0.2s",
  };

  return (
    <div className="h-16 px-5 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="relative">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold overflow-hidden"
            style={{ background: colors.bg, color: colors.text }}
          >
            {selectedConversation?.avatar?.trim() ? (
              <img
                src={`${BASE_URL}/uploads/${selectedConversation.avatar}`}
                alt={selectedConversation?.fullName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            ) : (
              getInitials(selectedConversation?.fullName || "")
            )}
          </div>
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

        <div>
          <h2
            className="text-sm font-bold"
            style={{
              color: isLight ? "#1A1228" : "#F0EAF8",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            {selectedConversation?.fullName || "Unknown"}
          </h2>
          <p
            className="text-xs font-medium mt-0.5"
            style={{
              color: isOnline ? "#3DD68C" : isLight ? "#9E88B8" : "#7A6A90",
            }}
          >
            {isOnline ? "Online now" : "Offline"}
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        <button
          style={actionBtnStyle}
          className="hover:scale-105 transition-transform"
        >
          <Phone
            className="w-3.5 h-3.5"
            style={{ color: isLight ? "#7F77DD" : "#AFA9EC" }}
          />
        </button>
        <button
          style={actionBtnStyle}
          className="hover:scale-105 transition-transform"
        >
          <Video
            className="w-3.5 h-3.5"
            style={{ color: isLight ? "#7F77DD" : "#AFA9EC" }}
          />
        </button>
        <button
          style={actionBtnStyle}
          className="hover:scale-105 transition-transform"
        >
          <MoreVertical
            className="w-3.5 h-3.5"
            style={{ color: isLight ? "#7F77DD" : "#AFA9EC" }}
          />
        </button>
      </div>
    </div>
  );
}

export default Chatuser;
