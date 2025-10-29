"use client";

import { CiSearch } from "react-icons/ci";
import useGetAllUsers from "../../context/useGetAllUsers";
import useConversation from "../../zutstand/userConveration";
import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";

function Search() {
  const [search, setSearch] = useState("");
  const [allUsers] = useGetAllUsers();
  const { setSelectedConversation } = useConversation();
  const { theme } = useTheme();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!search) return;
    const conversation = allUsers.find((user) =>
      user.fullName.toLowerCase().includes(search.toLowerCase())
    );
    if (conversation) {
      setSelectedConversation(conversation);
      setSearch("");
    } else {
      alert("User Not Found");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative group">
      {/* Icon */}
      <CiSearch
        className={`
          absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-all duration-300
          ${
            theme === "light"
              ? "text-blue-500 group-hover:text-blue-600"
              : "text-slate-400 group-hover:text-blue-400"
          }
        `}
      />

      {/* Input */}
      <input
        type="text"
        placeholder="Search conversations..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className={`
          w-full pl-12 pr-4 py-2.5 rounded-xl text-sm transition-all duration-500 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-offset-1 hover:scale-[1.02]
          ${
            theme === "light"
              ? "bg-white/90 backdrop-blur-sm border border-blue-200 text-gray-800 placeholder:text-blue-400 focus:border-blue-400 focus:ring-blue-300/40 shadow-md shadow-blue-500/10"
              : "bg-slate-800/70 backdrop-blur-sm border border-slate-700 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/30 shadow-lg shadow-blue-500/5"
          }
        `}
      />

      {/* Subtle Glow Effect */}
      <div
        className={`
          absolute inset-0 rounded-xl transition-all duration-700 pointer-events-none
          ${
            theme === "light"
              ? "group-hover:shadow-[0_0_15px_rgba(59,130,246,0.25)]"
              : "group-hover:shadow-[0_0_20px_rgba(59,130,246,0.35)]"
          }
        `}
      />
    </form>
  );
}

export default Search;
