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
      // 🔥 Create socket (use auth, NOT query)
      const newSocket = io(BASE_URL, {
        auth: {
          token: authUser.token, // 🔥 must match backend
        },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      setSocket(newSocket);

      // 🔥 Online users listener
      newSocket.on("getOnlineUsers", (users) => {
        setOnlineUser(users);
      });

      // 🔥 Debug (optional but useful)
      newSocket.on("connect", () => {
        console.log("Socket connected:", newSocket.id);
      });

      newSocket.on("disconnect", () => {
        console.log("Socket disconnected");
      });

      // 🔥 Cleanup
      return () => {
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
