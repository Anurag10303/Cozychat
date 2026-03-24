"use client";
import LogOut from "./LogOut";
import Search from "./Search";
import Users from "./Users";
import ThemeToggle from "../../components/ThemeToogle";
import { useTheme } from "../../context/ThemeContext";
import { MessageCircle } from "lucide-react";

function Left() {
  const { theme } = useTheme();
  const isLight = theme === "light";

  return (
    <div
      className="w-80 flex flex-col h-full flex-shrink-0"
      style={{
        background: isLight ? "rgba(255,252,255,0.88)" : "rgba(18,10,32,0.95)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderRight: isLight
          ? "1px solid rgba(127,119,221,0.15)"
          : "1px solid rgba(140,100,200,0.12)",
      }}
    >
      {/* Header */}
      <div
        className="p-4 flex flex-col gap-3"
        style={{
          borderBottom: isLight
            ? "1px solid rgba(127,119,221,0.12)"
            : "1px solid rgba(140,100,200,0.1)",
          background: isLight ? "rgba(248,242,255,0.6)" : "rgba(22,12,40,0.6)",
        }}
      >
        <div className="flex items-center gap-3">
          {/* Logo */}
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, #7F77DD, #D4537E)",
              boxShadow: "0 4px 12px rgba(127,119,221,0.35)",
            }}
          >
            <MessageCircle className="w-4 h-4 text-white" />
          </div>

          <h1
            className="text-lg font-extrabold tracking-tight"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              background: "linear-gradient(135deg, #7F77DD, #D4537E)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            CozyChat
          </h1>

          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>

        <Search />
      </div>

      {/* User list */}
      <div className="flex-1 overflow-hidden">
        <Users />
      </div>

      {/* Footer */}
      <div
        style={{
          borderTop: isLight
            ? "1px solid rgba(127,119,221,0.12)"
            : "1px solid rgba(140,100,200,0.1)",
          background: isLight ? "rgba(248,242,255,0.6)" : "rgba(22,12,40,0.6)",
        }}
      >
        <LogOut />
      </div>
    </div>
  );
}

export default Left;
