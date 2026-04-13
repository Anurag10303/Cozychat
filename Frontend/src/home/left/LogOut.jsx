"use client";

import { LogOut as LogOutIcon } from "lucide-react";
import { useSocketContext } from "../../context/SocketContext";
import useConversation from "../../zustand/userConveration";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthProvider";
import BASE_URL from "../../config";

function LogOut() {
  const { socket } = useSocketContext();
  const { setSelectedConversation } = useConversation();
  const { theme } = useTheme();
  const [authUser] = useAuth();
  const isLight = theme === "light";

  const getInitials = (name = "") =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const handleLogout = () => {
    localStorage.removeItem("RealChat"); // ✅ match the key used in SignIn
    setSelectedConversation(null);
    socket?.disconnect();
    window.location.href = "/login";
  };

  const avatarUrl = authUser?.user?.avatar;
  const displayName = authUser?.user?.fullName;

  return (
    <div className="p-4 flex items-center gap-3">
      {/* Current user avatar */}
      <div
        className="w-9 h-9 rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center text-xs font-bold"
        style={{
          background: isLight ? "#EEEDFE" : "#1C1440",
          color: isLight ? "#3C3489" : "#CECBF6",
          border: isLight
            ? "2px solid rgba(127,119,221,0.3)"
            : "2px solid rgba(175,169,236,0.2)",
        }}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName || "avatar"}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = "none";
            }} // ✅ fallback to initials if image 404s
          />
        ) : displayName ? (
          getInitials(displayName)
        ) : (
          "Me"
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-semibold truncate"
          style={{ color: isLight ? "#1A1228" : "#F0EAF8" }}
        >
          {displayName || "You"}
        </p>
        <p className="text-xs" style={{ color: "#3DD68C" }}>
          Active now
        </p>
      </div>

      <button
        onClick={handleLogout}
        className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105 flex-shrink-0"
        style={{
          background: isLight ? "rgba(226,75,74,0.08)" : "rgba(226,75,74,0.1)",
          border: isLight
            ? "1px solid rgba(226,75,74,0.15)"
            : "1px solid rgba(226,75,74,0.12)",
        }}
        title="Logout"
      >
        <LogOutIcon className="w-3.5 h-3.5" style={{ color: "#E24B4A" }} />
      </button>
    </div>
  );
}

export default LogOut;
