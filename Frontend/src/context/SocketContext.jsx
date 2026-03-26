import { createContext, useEffect, useState, useContext } from "react";
import { useAuth } from "./AuthProvider";
import io from "socket.io-client";
import BASE_URL from "../config";

const socketContext = createContext();

export const useSocketContext = () => {
  return useContext(socketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUser, setOnlineUser] = useState([]);
  const [authUser] = useAuth();

  useEffect(() => {
    if (authUser) {
      const newSocket = io(BASE_URL, {
        auth: {
          token: authUser.token,
        },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      setSocket(newSocket);

      newSocket.on("getOnlineUsers", (users) => {
        setOnlineUser(users);
      });

      newSocket.on("connect", () => {
        console.log("✅ Socket connected:", newSocket.id);

        // ✅ When user reconnects (comes back online), tell the backend
        // so it can mark pending messages as delivered and notify senders
        newSocket.emit("userReconnected", { userId: authUser.user?._id });
      });

      newSocket.on("disconnect", () => {
        console.log("❌ Socket disconnected");
      });

      // ✅ Debug — log all events during development, remove in production
      newSocket.onAny((event, ...args) => {
        console.log("📡 Socket event:", event, args);
      });

      return () => {
        newSocket.offAny();
        newSocket.off("getOnlineUsers");
        newSocket.disconnect();
      };
    } else {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    }
  }, [authUser]);

  return (
    <socketContext.Provider value={{ socket, onlineUser }}>
      {children}
    </socketContext.Provider>
  );
};