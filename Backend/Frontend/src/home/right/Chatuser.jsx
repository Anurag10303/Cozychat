"use client"

import useConversation from "../../zutstand/userConveration"
import { useSocketContext } from "../../context/SocketContext"
import { useTheme } from "../../context/ThemeContext"
import { Phone, Video, MoreVertical } from "lucide-react"
import BASE_URL from "../../config"

function Chatuser() {
  const { selectedConversation } = useConversation()
  const { onlineUser } = useSocketContext()
  const { theme } = useTheme()
  const isOnline = selectedConversation && onlineUser.includes(selectedConversation._id)

  const getInitials = (name) => {
    return (
      name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase() || "U"
    )
  }

  return (
    <div
      className={`
      h-16 border-b px-4 flex items-center justify-between transition-all duration-300
      ${
        theme === "light"
          ? "bg-gradient-to-r from-white via-blue-50 to-purple-50 border-blue-200/50 shadow-lg"
          : "bg-slate-800 border-slate-700"
      }
    `}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <div
            className={`
            w-10 h-10 rounded-full overflow-hidden flex items-center justify-center transition-all duration-300
            ${theme === "light" ? "bg-gradient-to-br from-blue-100 to-purple-100" : "bg-slate-700"}
          `}
          >
            {selectedConversation.avatar?.trim() ? (
            <img
              alt={selectedConversation?.fullName}
              src={`${BASE_URL}/uploads/${selectedConversation.avatar}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = "none"
                e.target.nextSibling.style.display = "flex"
              }}
            />
            ):null}
            {!selectedConversation.avatar?.trim()&&(
            <div
              className={`
                w-full h-full text-sm font-medium flex items-center justify-center
                ${theme === "light" ? "bg-gradient-to-br from-blue-400 to-purple-500 text-white" : "bg-slate-700 text-white"}
              `}
              // style={{ display: "none" }}
            >
              {getInitials(selectedConversation.fullName||"")}
            </div>
            )}
          </div>
          {isOnline && (
            <div
              className={`
              absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 rounded-full animate-pulse
              ${
                theme === "light"
                  ? "bg-green-400 border-white shadow-lg shadow-green-400/50"
                  : "bg-green-500 border-slate-800"
              }
            `}
            />
          )}
        </div>
        <div>
          <h2
            className={`
            font-semibold transition-colors duration-300
            ${theme === "light" ? "text-gray-800" : "text-white"}
          `}
          >
            {selectedConversation?.fullName || "Unknown"}
          </h2>
          <span
            className={`
            text-xs px-2 py-1 rounded-full transition-all duration-300
            ${
              isOnline
                ? theme === "light"
                  ? "bg-green-100 text-green-700 shadow-sm"
                  : "bg-green-500/20 text-green-400"
                : theme === "light"
                  ? "bg-gray-100 text-gray-600"
                  : "bg-slate-600 text-slate-300"
            }
          `}
          >
            {isOnline ? "Online" : "Offline"}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          className={`
          p-2 rounded-lg transition-all duration-300 transform hover:scale-105
          ${
            theme === "light"
              ? "text-blue-600 hover:text-blue-700 hover:bg-blue-50 shadow-sm hover:shadow-md"
              : "text-slate-400 hover:text-white hover:bg-slate-700"
          }
        `}
        >
          <Phone className="w-4 h-4" />
        </button>
        <button
          className={`
          p-2 rounded-lg transition-all duration-300 transform hover:scale-105
          ${
            theme === "light"
              ? "text-purple-600 hover:text-purple-700 hover:bg-purple-50 shadow-sm hover:shadow-md"
              : "text-slate-400 hover:text-white hover:bg-slate-700"
          }
        `}
        >
          <Video className="w-4 h-4" />
        </button>
        <button
          className={`
          p-2 rounded-lg transition-all duration-300 transform hover:scale-105
          ${
            theme === "light"
              ? "text-gray-600 hover:text-gray-700 hover:bg-gray-50 shadow-sm hover:shadow-md"
              : "text-slate-400 hover:text-white hover:bg-slate-700"
          }
        `}
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default Chatuser
