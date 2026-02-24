"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative p-2 rounded-xl transition-all duration-300 transform hover:scale-110
        ${
          theme === "light"
            ? "bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 shadow-md shadow-orange-400/30 hover:shadow-orange-400/50"
            : "bg-gradient-to-r from-[#1f1c2c] via-[#2d2a42] to-[#4b3974] hover:from-[#2d2a42] hover:to-[#5b478c] shadow-[0_0_15px_rgba(91,71,140,0.5)]"
        }
      `}
    >
      <div className="relative w-5 h-5">
        {/* ☀️ Light mode icon */}
        <Sun
          className={`
            absolute inset-0 w-5 h-5 transition-all duration-500 transform
            ${
              theme === "light"
                ? "text-white rotate-0 scale-100 opacity-100"
                : "text-purple-300 rotate-90 scale-0 opacity-0"
            }
          `}
        />

        {/* 🌙 Dark mode icon */}
        <Moon
          className={`
            absolute inset-0 w-5 h-5 transition-all duration-500 transform
            ${
              theme === "dark"
                ? "text-indigo-300 rotate-0 scale-100 opacity-100"
                : "text-slate-400 -rotate-90 scale-0 opacity-0"
            }
          `}
        />
      </div>

      {/* Subtle glowing ring when active */}
      <div
        className={`
          absolute inset-0 rounded-xl blur-md opacity-0 transition-opacity duration-500
          ${
            theme === "dark"
              ? "bg-indigo-500/30 opacity-70"
              : "bg-orange-400/30 opacity-70"
          }
        `}
      ></div>
    </button>
  );
}

export default ThemeToggle;
