// Search.jsx
"use client";

import { CiSearch } from "react-icons/ci";
import useGetAllUsers from "../../context/useGetAllUsers";
import useConversation from "../../zustand/userConveration";
import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";

function Search() {
  const [search, setSearch] = useState("");
  const [allUsers] = useGetAllUsers();
  const { setSelectedConversation } = useConversation();
  const { theme } = useTheme();
  const isLight = theme === "light";

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!search) return;
    const conversation = allUsers.find((user) =>
      user.fullName.toLowerCase().includes(search.toLowerCase()),
    );
    if (conversation) {
      setSelectedConversation(conversation);
      setSearch("");
    } else {
      alert("User Not Found");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <CiSearch
        className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
        style={{ color: isLight ? "#9E88B8" : "#7A6A90" }}
      />
      <input
        type="text"
        placeholder="Search conversations..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-200"
        style={{
          background: isLight ? "rgba(248,242,255,0.8)" : "rgba(30,18,50,0.8)",
          border: isLight
            ? "1px solid rgba(127,119,221,0.18)"
            : "1px solid rgba(140,100,200,0.15)",
          color: isLight ? "#1A1228" : "#F0EAF8",
        }}
      />
    </form>
  );
}

export default Search;
