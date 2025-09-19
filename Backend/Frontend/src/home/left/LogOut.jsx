"use client"

import { Power } from "lucide-react"
import { useSocketContext } from "../../context/SocketContext"
import useConversation from "../../zutstand/userConveration"
import { useTheme } from "../../context/ThemeContext"

function LogOut() {
  const { socket } = useSocketContext()
  const { setSelectedConversation } = useConversation()
  const { theme } = useTheme()

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setSelectedConversation(null)
    socket?.disconnect()
    window.location.href = "/signIn"
  }

  return (
    <div
      className={`
      p-4 border-t transition-all duration-300
      ${
        theme === "light"
          ? "border-blue-200/50 bg-gradient-to-r from-rose-50 to-pink-50"
          : "border-slate-700/50 bg-gradient-to-r from-slate-800 to-slate-900"
      }
    `}
    >
      <button
        onClick={handleLogout}
        className={`
          w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all duration-300 group transform hover:scale-[1.02]
          ${
            theme === "light"
              ? "bg-gradient-to-r from-red-100 to-pink-100 hover:from-red-200 hover:to-pink-200 border border-red-200 hover:border-red-300 shadow-lg shadow-red-500/10 hover:shadow-red-500/20"
              : "bg-red-600/10 hover:bg-red-600/20 border border-red-500/20 hover:border-red-500/40"
          }
        `}
      >
        <Power
          className={`
          w-4 h-4 transition-all duration-300
          ${theme === "light" ? "text-red-600 group-hover:text-red-700" : "text-red-400 group-hover:text-red-300"}
        `}
        />
        <span
          className={`
          font-medium text-sm transition-all duration-300
          ${theme === "light" ? "text-red-600 group-hover:text-red-700" : "text-red-400 group-hover:text-red-300"}
        `}
        >
          Sign Out
        </span>
      </button>
    </div>
  )
}

export default LogOut
