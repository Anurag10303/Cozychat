import { useState, useEffect } from "react";
import BASE_URL from "../config";
import { useSocketContext } from "./SocketContext";
import useConversation from "../zustand/userConveration";

function useGetAllUsers() {
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { socket, onlineUser } = useSocketContext(); // ✅ pull onlineUser here
  const { selectedConversation } = useConversation();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/user/users`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch users");
      }

      const data = await response.json();
      setAllUsers(Array.isArray(data.data) ? data.data : []);
    } catch (error) {
      console.error("Error fetching users:", error.message);
      setAllUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ✅ Re-sync allUsers whenever onlineUser changes
  // This forces Users.jsx to re-render and User children to re-evaluate isOnline
  useEffect(() => {
    if (allUsers.length === 0) return;
    setAllUsers((prev) =>
      prev.map((user) => ({
        ...user,
        isOnline: onlineUser.includes(String(user._id)), // ✅ stamp it on the user object
      })),
    );
  }, [onlineUser]); // ✅ runs every time online list changes

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage) => {
      const isCurrentConversation =
        selectedConversation?._id?.toString() ===
        newMessage.senderId?.toString();

      if (isCurrentConversation) return;

      setAllUsers((prev) =>
        prev.map((user) =>
          user._id?.toString() === newMessage.senderId?.toString()
            ? { ...user, unreadCount: (user.unreadCount || 0) + 1 }
            : user,
        ),
      );
    };

    socket.on("newMessage", handleNewMessage);
    return () => socket.off("newMessage", handleNewMessage);
  }, [socket, selectedConversation]);

  useEffect(() => {
    if (!selectedConversation?._id) return;

    setAllUsers((prev) =>
      prev.map((user) =>
        user._id?.toString() === selectedConversation._id?.toString()
          ? { ...user, unreadCount: 0 }
          : user,
      ),
    );
  }, [selectedConversation?._id]);

  return [allUsers, loading];
}

export default useGetAllUsers;
