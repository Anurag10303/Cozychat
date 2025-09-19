"use client"

import Message from "./Message"
import useGetMessage from "../../context/useGetMessage"
import Loading from "../../components/Loading"
import { useRef, useEffect } from "react"
import useGetSocketMessage from "../../context/useGetSocketMessage"
import useConversation from "../../zutstand/userConveration"
import { useTheme } from "../../context/ThemeContext"

function Messages() {
  const { loading, messages } = useGetMessage()
  const { selectedConversation } = useConversation()
  const { theme } = useTheme()
  useGetSocketMessage()
  const lastMsgRef = useRef()

  useEffect(() => {
    setTimeout(() => {
      if (lastMsgRef.current) {
        lastMsgRef.current.scrollIntoView({ behavior: "smooth" })
      }
    }, 100)
  }, [messages])

  if (loading) {
    return (
      <div
        className={`
        h-full flex items-center justify-center transition-all duration-300
        ${theme === "light" ? "bg-gradient-to-b from-blue-50 to-purple-50" : "bg-slate-900"}
      `}
      >
        <Loading />
      </div>
    )
  }

  return (
    <div
      className={`
      h-full overflow-y-auto transition-all duration-300 msg
      ${theme === "light" ? "bg-gradient-to-b from-blue-50 to-purple-50" : "bg-slate-900"}
    `}
    >
      <div className="p-4 space-y-1">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div
              className={`
              w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-300
              ${theme === "light" ? "bg-gradient-to-br from-blue-200 to-purple-200" : "bg-slate-700"}
            `}
            >
              <span className="text-xl">👋</span>
            </div>
            <h3
              className={`
              text-lg font-semibold mb-2 transition-colors duration-300
              ${theme === "light" ? "text-gray-800" : "text-white"}
            `}
            >
              Say hello to {selectedConversation?.fullName}
            </h3>
            <p
              className={`
              transition-colors duration-300
              ${theme === "light" ? "text-gray-600" : "text-slate-400"}
            `}
            >
              Start your conversation by sending a message
            </p>
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              const showAvatar = index === 0 || messages[index - 1]?.senderId !== message.senderId
              return (
                <div key={message._id} ref={lastMsgRef}>
                  <Message message={message} showAvatar={showAvatar} />
                </div>
              )
            })}
          </>
        )}
      </div>
    </div>
  )
}

export default Messages
