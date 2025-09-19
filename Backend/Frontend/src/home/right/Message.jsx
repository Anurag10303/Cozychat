"use client"
import "./Message.css"
import { useAuth } from "../../context/AuthProvider"
import { useTheme } from "../../context/ThemeContext"

function Message({ message }) {
  const [authUser] = useAuth()
  const { theme } = useTheme()
  const itsMe = message.senderId === authUser?.user?._id
  const createdAt = new Date(message.createdAt)
  const formatedTime = createdAt.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <div className={`flex mb-2 ${itsMe ? "justify-end" : "justify-start"}`}>
      <div className="flex flex-col items-end max-w-xs">
        <div
          className={`
          px-4 py-2 rounded-lg shadow transition-all duration-300 transform hover:scale-[1.02]
          ${
            itsMe
              ? theme === "light"
                ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-blue-500/25"
                : "bg-blue-500 text-white"
              : theme === "light"
                ? "bg-white text-gray-800 shadow-lg border border-gray-100"
                : "bg-white text-gray-800"
          }
        `}
        >
          {message.message}
        </div>
        <div
          className={`
          text-xs mt-1 pr-1 transition-colors duration-300
          ${theme === "light" ? "text-gray-500" : "text-gray-400"}
        `}
        >
          {formatedTime}
        </div>
      </div>
    </div>
  )
}

export default Message
