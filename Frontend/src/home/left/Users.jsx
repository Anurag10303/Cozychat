"use client";

import User from "./User";
import useGetAllUsers from "../../context/useGetAllUsers";
import { useTheme } from "../../context/ThemeContext";

function Users() {
  const [allUsers, loading] = useGetAllUsers();
  const { theme } = useTheme();

  if (loading) {
    return (
      <div className="p-2">
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 rounded-lg animate-pulse"
            >
              <div
                className={`
                w-12 h-12 rounded-full
                ${theme === "light" ? "bg-blue-200" : "bg-slate-700"}
              `}
              />
              <div className="flex-1">
                <div
                  className={`
                  h-4 rounded mb-2
                  ${theme === "light" ? "bg-blue-200" : "bg-slate-700"}
                `}
                />
                <div
                  className={`
                  h-3 rounded w-2/3
                  ${theme === "light" ? "bg-blue-100" : "bg-slate-700"}
                `}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto p-2 scrollbar-hide">
        <div className="space-y-1">
          {allUsers.map((user, index) => (
            <User key={user._id || index} user={user} />
          ))}
        </div>
        {allUsers.length === 0 && (
          <div className="text-center py-8">
            <p
              className={`
              transition-colors duration-300
              ${theme === "light" ? "text-gray-500" : "text-slate-400"}
            `}
            >
              No users found
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Users;
