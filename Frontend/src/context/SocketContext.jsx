import { createContext, useEffect, useState, useContext } from "react";
import { useAuth } from "./AuthProvider";
import { expireSession } from "../lib/session";
import io from "socket.io-client";
import BASE_URL from "../config";

const socketContext = createContext();

export const useSocketContext = () => useContext(socketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUser, setOnlineUser] = useState([]);
  const [authUser] = useAuth();

  useEffect(() => {
    if (!authUser) {
      setOnlineUser([]);
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    // ✅ Prevent double connection — disconnect any existing socket first
    setSocket((prevSocket) => {
      if (prevSocket) {
        prevSocket.disconnect();
      }
      return null;
    });

    const newSocket = io(BASE_URL, {
      auth: { token: authUser.token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    setSocket(newSocket);

    newSocket.on("getOnlineUsers", (users) => {
      setOnlineUser(users.map(String));
    });

    newSocket.on("connect", () => {});

    // Server rejected the token (expired or invalid) → sign in again.
    newSocket.on("connect_error", (err) => {
      if (err?.message === "Unauthorized") {
        newSocket.disconnect();
        expireSession();
      }
    });

    newSocket.on("disconnect", () => {});

    // ✅ Cleanup — this runs on unmount AND before remount in Strict Mode
    return () => {
      newSocket.off("getOnlineUsers");
      newSocket.off("connect");
      newSocket.off("connect_error");
      newSocket.off("disconnect");
      newSocket.disconnect(); // ✅ ensures Redis cleans up on remount too
    };
  }, [authUser]);

  return (
    <socketContext.Provider value={{ socket, onlineUser }}>
      {children}
    </socketContext.Provider>
  );
};
