"use client";

import useConversation from "../../zutstand/userConveration.js";
import { useSocketContext } from "../../context/SocketContext.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";
import BASE_URL from "../../config.js";

function User({ user }) {
  const { socket, onlineUser } = useSocketContext();
  const isOnline = onlineUser.includes(user._id);
  const { selectedConversation, setSelectedConversation } = useConversation();
  const isSelected = selectedConversation?._id === user._id;
  const { theme } = useTheme();

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div
      className={`
        flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-300 transform hover:scale-[1.02]
        ${
          isSelected
            ? theme === "light"
              ? "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg shadow-blue-500/25"
              : "bg-blue-600 hover:bg-blue-700"
            : theme === "light"
            ? "hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:shadow-md"
            : "hover:bg-slate-800"
        }
      `}
      onClick={() => {
        setSelectedConversation(user);
      }}
    >
      <div className="relative">
        <div
  className={`
    w-12 h-12 rounded-full overflow-hidden flex items-center justify-center transition-all duration-300
    ${theme === "light" ? "bg-gradient-to-br from-blue-100 to-purple-100" : "bg-slate-700"}
  `}
>
  {user.avatar?.trim() ? (
    <img
      alt={user.fullName}
      src={`${BASE_URL}/uploads/${user.avatar}`}
      className="w-full h-full object-cover"
      onError={(e) => {
        e.target.style.display = "none";
        e.target.nextSibling.style.display = "flex";
      }}
    />
  ) : null}

  {!user.avatar?.trim() && (
    <div
      className={`
        w-full h-full text-sm font-medium flex items-center justify-center
        ${theme === "light" ? "bg-gradient-to-br from-blue-400 to-purple-500 text-white" : "bg-slate-700 text-white"}
      `}
    >
      {getInitials(user.fullName || "")}
    </div>
  )}
</div>


        {isOnline && (
          <div
            className={`
            absolute -bottom-0.5 -right-0.5 w-4 h-4 border-2 rounded-full animate-pulse
            ${
              theme === "light"
                ? "bg-green-400 border-white shadow-lg shadow-green-400/50"
                : "bg-green-500 border-slate-900"
            }
          `}
          />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3
            className={`
            font-medium truncate transition-colors duration-300
            ${
              isSelected
                ? "text-white"
                : theme === "light"
                ? "text-gray-800"
                : "text-slate-200"
            }
          `}
          >
            {user.fullName}
          </h3>
          {isOnline && (
            <span
              className={`
              text-xs px-2 py-1 rounded-full transition-all duration-300
              ${
                theme === "light"
                  ? "bg-green-100 text-green-700 shadow-sm"
                  : "bg-green-500/20 text-green-400"
              }
            `}
            >
              Online
            </span>
          )}
        </div>
        <p
          className={`
          text-sm truncate transition-colors duration-300
          ${
            isSelected
              ? theme === "light"
                ? "text-blue-100"
                : "text-blue-100"
              : theme === "light"
              ? "text-gray-500"
              : "text-slate-400"
          }
        `}
        >
          {user.email}
        </p>
      </div>
    </div>
  );
}

export default User;
