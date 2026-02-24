"use client";
import LogOut from "./LogOut";
import Search from "./Search";
import Users from "./Users";
import ThemeToggle from "../../components/ThemeToogle";
import { useTheme } from "../../context/ThemeContext";

function Left() {
  const { theme } = useTheme();

  return (
    <div
      className={`
        w-80 flex flex-col h-full transition-all duration-500
        ${
          theme === "light"
            ? "bg-gradient-to-b from-white/90 via-blue-50/70 to-purple-50/90 backdrop-blur-md border-r border-blue-200/40 shadow-lg shadow-blue-500/10"
            : "bg-gradient-to-b from-[#0f172a] via-[#1e293b] to-[#0f172a] border-r border-slate-800/60 shadow-xl shadow-slate-900/30"
        }
      `}
    >
      {/* Header */}
      <div
        className={`
          p-4 border-b flex flex-col gap-3 transition-all duration-500
          ${
            theme === "light"
              ? "border-blue-200/40 bg-gradient-to-r from-blue-50/70 to-purple-50/70"
              : "border-slate-700/50 bg-gradient-to-r from-slate-800/60 to-slate-900/60"
          }
        `}
      >
        <div className="flex items-center gap-3">
          <div
            className={`
              p-2 rounded-xl transition-all duration-500 transform hover:scale-110
              ${
                theme === "light"
                  ? "bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 shadow-lg shadow-blue-500/30"
                  : "bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-700 shadow-lg shadow-blue-900/40"
              }
            `}
          >
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-4.126-.98L3 20l1.98-5.874A8.955 8.955 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z"
              />
            </svg>
          </div>

          <h1
            className={`
              text-xl font-semibold tracking-wide transition-all duration-300
              ${
                theme === "light"
                  ? "text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text"
                  : "text-gray-100"
              }
            `}
          >
            CozyChat
          </h1>

          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>

        <Search />
      </div>

      {/* User List */}
      <div
        className={`
          flex-1 overflow-hidden transition-all duration-500
          ${
            theme === "light"
              ? "scrollbar-thin scrollbar-thumb-blue-300"
              : "scrollbar-thin scrollbar-thumb-slate-700"
          }
        `}
      >
        <Users />
      </div>

      {/* Footer / Logout */}
      <div
        className={`
          border-t px-4 py-3 transition-all duration-500
          ${
            theme === "light"
              ? "border-blue-200/50 bg-gradient-to-r from-blue-50/70 to-purple-50/70"
              : "border-slate-800/50 bg-gradient-to-r from-slate-900/80 to-slate-800/80"
          }
        `}
      >
        <LogOut />
      </div>
    </div>
  );
}

export default Left;
