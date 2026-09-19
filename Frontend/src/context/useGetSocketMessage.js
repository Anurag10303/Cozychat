import { useEffect } from "react";
import { useSocketContext } from "./SocketContext";
import useConversation from "../zustand/userConveration";
import sound from "../assets/Order-up-bell-sound-effect.mp3";

const useGetSocketMessage = () => {
  const { socket } = useSocketContext();
  const { appendMessage, updateMessageStatus, selectedConversation } =
    useConversation();

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage) => {
      new Audio(sound).play().catch(() => {}); // autoplay may be blocked; that's fine

      // Only show it if it belongs to the open conversation. Messages from other
      // chats are counted as unread by useGetAllUsers and load when opened.
      const openId = selectedConversation?._id?.toString();
      if (
        openId &&
        (newMessage.senderId?.toString() === openId ||
          newMessage.receiverId?.toString() === openId)
      ) {
        appendMessage(newMessage);
      }
    };

    socket.on("newMessage", handleNewMessage);
    return () => socket.off("newMessage", handleNewMessage);
  }, [socket, appendMessage, selectedConversation]);

  // status updates (unchanged)
  useEffect(() => {
    if (!socket) return;

    const handleStatusUpdate = ({ messageId, status }) => {
      updateMessageStatus(messageId, status);
    };

    socket.on("messageStatusUpdate", handleStatusUpdate);
    return () => socket.off("messageStatusUpdate", handleStatusUpdate);
  }, [socket, updateMessageStatus]);
};

export default useGetSocketMessage;
