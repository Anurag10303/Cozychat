"use client";
import "./Message.css";
import { useAuth } from "../../context/AuthProvider";
import { useTheme } from "../../context/ThemeContext";

function Message({ message }) {
  const [authUser] = useAuth();
  const { theme } = useTheme();
  const itsMe = message.senderId === authUser?.user?._id;
  const createdAt = new Date(message.createdAt);
  const formattedTime = createdAt.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={`flex mb-3 animate-fade-in ${
        itsMe ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`flex flex-col max-w-[75%] ${
          itsMe ? "items-end" : "items-start"
        }`}
      >
        <div
          className={`px-4 py-2 rounded-2xl shadow-lg transition-all duration-300 transform hover:scale-[1.03] ${
            itsMe
              ? theme === "light"
                ? "bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-blue-500/25"
                : "bg-gradient-to-br from-blue-600/80 to-indigo-700/80 text-white backdrop-blur-md border border-blue-500/30 shadow-blue-700/40"
              : theme === "light"
              ? "bg-white text-gray-800 border border-gray-100 shadow-md"
              : "bg-gradient-to-br from-slate-800/60 to-slate-900/70 text-gray-100 backdrop-blur-lg border border-slate-700/40 shadow-black/40"
          }`}
        >
          <p className="text-sm leading-relaxed break-words">
            {message.message}
          </p>
        </div>
        <span
          className={`text-[11px] mt-1 ${itsMe ? "pr-1" : "pl-1"} ${
            theme === "light" ? "text-gray-500" : "text-gray-400"
          }`}
        >
          {formattedTime}
        </span>
      </div>
    </div>
  );
}

export default Message;
