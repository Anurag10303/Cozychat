"use client";

import User from "./User";
import useGetAllUsers from "../../context/useGetAllUsers";
import { useTheme } from "../../context/ThemeContext";

function Users() {
  const [allUsers, loading] = useGetAllUsers();
  const { theme } = useTheme();
  const isLight = theme === "light";

  if (loading) {
    return (
      <div className="p-3 space-y-2">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-3 rounded-2xl"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div
              className="w-11 h-11 rounded-full flex-shrink-0"
              style={{
                background: isLight
                  ? "rgba(127,119,221,0.1)"
                  : "rgba(175,169,236,0.08)",
                animation: "shimmer 1.5s infinite",
                backgroundSize: "200% 100%",
              }}
            />
            <div className="flex-1 space-y-2">
              <div
                className="h-3 rounded-full w-3/4"
                style={{
                  background: isLight
                    ? "rgba(127,119,221,0.1)"
                    : "rgba(175,169,236,0.08)",
                  animation: "shimmer 1.5s infinite",
                  backgroundSize: "200% 100%",
                }}
              />
              <div
                className="h-2.5 rounded-full w-1/2"
                style={{
                  background: isLight
                    ? "rgba(127,119,221,0.07)"
                    : "rgba(175,169,236,0.05)",
                  animation: "shimmer 1.5s infinite",
                  animationDelay: "0.2s",
                  backgroundSize: "200% 100%",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto scrollbar-hide p-3">
        {allUsers.length === 0 ? (
          <div className="text-center py-12">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{
                background: isLight
                  ? "rgba(127,119,221,0.1)"
                  : "rgba(175,169,236,0.08)",
              }}
            >
              <svg
                className="w-6 h-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke={isLight ? "#7F77DD" : "#AFA9EC"}
                strokeWidth="2"
              >
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
              </svg>
            </div>
            <p
              className="text-sm font-medium"
              style={{ color: isLight ? "#9E88B8" : "#7A6A90" }}
            >
              No users found
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {allUsers.map((user, index) => (
              <div
                key={user._id || index}
                style={{
                  animation: `fadeSlideIn 0.3s ease-out ${index * 0.05}s both`,
                }}
              >
                <User user={user} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Users;
