"use client"

import { Sun, Moon } from "lucide-react"
import { useTheme } from "../context/ThemeContext"

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative p-2 rounded-xl transition-all duration-300 transform hover:scale-105
        ${
          theme === "light"
            ? "bg-gradient-to-r from-amber-400 to-orange-500 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40"
            : "bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 shadow-lg"
        }
      `}
    >
      <div className="relative w-5 h-5">
        <Sun
          className={`
            absolute inset-0 w-5 h-5 transition-all duration-300 transform
            ${
              theme === "light"
                ? "text-white rotate-0 scale-100 opacity-100"
                : "text-slate-400 rotate-90 scale-0 opacity-0"
            }
          `}
        />
        <Moon
          className={`
            absolute inset-0 w-5 h-5 transition-all duration-300 transform
            ${
              theme === "dark"
                ? "text-blue-300 rotate-0 scale-100 opacity-100"
                : "text-slate-400 -rotate-90 scale-0 opacity-0"
            }
          `}
        />
      </div>
    </button>
  )
}

export default ThemeToggle
