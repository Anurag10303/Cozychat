"use client"

import useSendMessage from "../../context/useSendMessage"
import { useState } from "react"
import useConversation from "../../zutstand/userConveration"
import { useTheme } from "../../context/ThemeContext"
import { Paperclip, Hash, Send } from "lucide-react"

function TypeMsg() {
  const { loading, sendMessages } = useSendMessage()
  const { selectedConversation } = useConversation()
  const { theme } = useTheme()
  const [message, setMessage] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!message.trim() || loading) return
    await sendMessages(message.trim())
    setMessage("")
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div
      className={`
      p-4 border-t transition-all duration-300
      ${
        theme === "light"
          ? "bg-gradient-to-r from-white via-blue-50 to-purple-50 border-blue-200/50"
          : "bg-slate-800 border-slate-700"
      }
    `}
    >
      <form onSubmit={handleSubmit} className="flex items-end gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className={`
            p-2 rounded-lg transition-all duration-300 transform hover:scale-105
            ${
              theme === "light"
                ? "text-blue-600 hover:text-blue-700 hover:bg-blue-100 shadow-sm hover:shadow-md"
                : "text-slate-400 hover:text-white hover:bg-slate-700"
            }
          `}
            disabled={!selectedConversation}
          >
            <Paperclip className="w-4 h-4" />
          </button>
          <button
            type="button"
            className={`
            p-2 rounded-lg transition-all duration-300 transform hover:scale-105
            ${
              theme === "light"
                ? "text-purple-600 hover:text-purple-700 hover:bg-purple-100 shadow-sm hover:shadow-md"
                : "text-slate-400 hover:text-white hover:bg-slate-700"
            }
          `}
            disabled={!selectedConversation}
          >
            <Hash className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder={!selectedConversation ? "Select a conversation to start messaging..." : "Type your message..."}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading || !selectedConversation}
            className={`
              w-full px-4 py-2 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.01]
              ${
                theme === "light"
                  ? "bg-white border border-blue-200 text-gray-800 placeholder:text-blue-400 focus:border-blue-400 focus:ring-blue-400/20 shadow-lg"
                  : "bg-slate-700 border border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
              }
            `}
          />
        </div>
        <button
          type="submit"
          disabled={!message.trim() || loading || !selectedConversation}
          className={`
            px-4 py-2 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transform hover:scale-105
            ${
              theme === "light"
                ? "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg shadow-blue-500/25"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }
          `}
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          Send
        </button>
      </form>
    </div>
  )
}

export default TypeMsg
