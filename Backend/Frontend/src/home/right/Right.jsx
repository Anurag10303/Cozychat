"use client"

import Chatuser from "./Chatuser"
import Messages from "./Messages"
import TypeMsg from "./TypeMsg"
import useConversation from "../../zutstand/userConveration"
import { useTheme } from "../../context/ThemeContext"

function Right() {
  const { selectedConversation } = useConversation()
  const { theme } = useTheme()

  if (!selectedConversation) {
    return (
      <div
        className={`
        flex-1 flex items-center justify-center transition-all duration-300
        ${theme === "light" ? "bg-gradient-to-br from-blue-50 via-white to-purple-50" : "bg-slate-900"}
      `}
      >
        <div className="text-center">
          <div
            className={`
            w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-300 animate-pulse
            ${theme === "light" ? "bg-gradient-to-br from-blue-200 to-purple-200" : "bg-slate-700"}
          `}
          >
            <span className="text-2xl">💬</span>
          </div>
          <h3
            className={`
            text-lg font-semibold mb-2 transition-colors duration-300
            ${theme === "light" ? "text-gray-800" : "text-white"}
          `}
          >
            Welcome to Chat
          </h3>
          <p
            className={`
            transition-colors duration-300
            ${theme === "light" ? "text-gray-600" : "text-slate-400"}
          `}
          >
            Select a conversation from the sidebar to start messaging
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`
      flex-1 flex flex-col h-screen transition-all duration-300
      ${theme === "light" ? "bg-gradient-to-b from-blue-50 to-purple-50" : "bg-slate-900"}
    `}
    >
      {/* Fixed height header */}
      <div className="flex-shrink-0">
        <Chatuser />
      </div>

      {/* Scrollable messages area */}
      <div className="flex-1 min-h-0">
        <Messages />
      </div>

      {/* Fixed height footer */}
      <div className="flex-shrink-0">
        <TypeMsg />
      </div>
    </div>
  )
}

export default Right
