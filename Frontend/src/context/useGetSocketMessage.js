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
      try {
        new Audio(sound).play();
      } catch (err) {}
      // ✅ Always append — never drop incoming messages
      appendMessage(newMessage);

      // 🔥 CRITICAL FIX: only append if message belongs to current chat
      if (
        newMessage.senderId === selectedConversation?._id ||
        newMessage.receiverId === selectedConversation?._id
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
