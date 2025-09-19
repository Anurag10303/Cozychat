"use client"

import LogOut from "./LogOut"
import Search from "./Search"
import Users from "./Users"
import ThemeToggle from "../../components/ThemeToogle"
import { useTheme } from "../../context/ThemeContext"

function Left() {
  const { theme } = useTheme()

  return (
    <div
      className={`
      w-80 border-r flex flex-col h-full transition-all duration-500
      ${
        theme === "light"
          ? "bg-gradient-to-b from-white via-blue-50 to-purple-50 border-blue-200/50 shadow-xl shadow-blue-500/10"
          : "bg-slate-900 border-slate-700"
      }
    `}
    >
      {/* Header */}
      <div
        className={`
        p-4 border-b transition-all duration-300
        ${theme === "light" ? "border-blue-200/50 bg-gradient-to-r from-blue-50 to-purple-50" : "border-slate-700/50"}
      `}
      >
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`
            p-2 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105
            ${
              theme === "light"
                ? "bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 shadow-blue-500/25 animate-pulse"
                : "bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg"
            }
          `}
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            text-xl font-semibold transition-all duration-300
            ${
              theme === "light"
                ? "text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text"
                : "text-white"
            }
          `}
          >
            Messages
          </h1>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>
        <Search />
      </div>

      {/* User List */}
      <div className="flex-1 overflow-hidden">
        <Users />
      </div>

      {/* Logout positioned at bottom */}
      <LogOut />
    </div>
  )
}

export default Left
