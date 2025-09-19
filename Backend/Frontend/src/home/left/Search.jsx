"use client"

import { CiSearch } from "react-icons/ci"
import useGetAllUsers from "../../context/useGetAllUsers"
import useConversation from "../../zutstand/userConveration"
import { useState } from "react"
import { useTheme } from "../../context/ThemeContext"

function Search() {
  const [search, setSearch] = useState("")
  const [allUsers] = useGetAllUsers()
  const { setSelectedConversation } = useConversation()
  const { theme } = useTheme()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!search) return
    const conversation = allUsers.find((user) => user.fullName.toLowerCase().includes(search.toLowerCase()))
    if (conversation) {
      setSelectedConversation(conversation)
      setSearch("")
    } else {
      alert("User Not Found")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <CiSearch
        className={`
        absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors duration-300
        ${theme === "light" ? "text-blue-500" : "text-slate-400"}
      `}
      />
      <input
        type="text"
        placeholder="Search conversations..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className={`
          w-full pl-10 pr-4 py-2 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 transform hover:scale-[1.01]
          ${
            theme === "light"
              ? "bg-white border border-blue-200 text-gray-800 placeholder:text-blue-400 focus:border-blue-400 focus:ring-blue-400/20 shadow-lg shadow-blue-500/10"
              : "bg-slate-800 border border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
          }
        `}
      />
    </form>
  )
}

export default Search
