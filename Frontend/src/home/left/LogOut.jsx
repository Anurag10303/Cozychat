"use client";

import { Power } from "lucide-react";
import { useSocketContext } from "../../context/SocketContext";
import useConversation from "../../zustand/userConveration";
import { useTheme } from "../../context/ThemeContext";

function LogOut() {
  const { socket } = useSocketContext();
  const { setSelectedConversation } = useConversation();
  const { theme } = useTheme();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setSelectedConversation(null);
    socket?.disconnect();
    window.location.href = "/signIn";
  };

  return (
    <div
      className={`
        p-4 border-t flex items-center justify-center transition-all duration-500
        ${
          theme === "light"
            ? "border-blue-200/40 bg-gradient-to-r from-blue-50/80 to-purple-50/80 backdrop-blur-md"
            : "border-slate-800/60 bg-gradient-to-r from-slate-900/70 to-slate-800/70 backdrop-blur-md"
        }
      `}
    >
      <button
        onClick={handleLogout}
        className={`
          flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm
          transition-all duration-500 transform hover:scale-105 active:scale-95 shadow-md
          ${
            theme === "light"
              ? "bg-gradient-to-r from-rose-100 via-pink-100 to-purple-100 hover:from-rose-200 hover:via-pink-200 hover:to-purple-200 border border-rose-200 text-rose-700 hover:text-rose-800 hover:shadow-rose-300/40"
              : "bg-gradient-to-r from-red-900/40 via-rose-900/30 to-red-900/40 hover:from-red-800/50 hover:via-rose-800/40 hover:to-red-800/50 border border-red-700/40 text-red-400 hover:text-red-300 hover:shadow-red-500/20"
          }
        `}
      >
        <Power
          className={`
            w-4 h-4 transition-all duration-500 group-hover:rotate-12
            ${theme === "light" ? "text-rose-600" : "text-red-400"}
          `}
        />
        <span>Sign Out</span>
      </button>
    </div>
  );
}

export default LogOut;
