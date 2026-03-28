import { useEffect } from "react";
import { useSocketContext } from "./SocketContext";
import useConversation from "../zustand/userConveration";
import sound from "../assets/Order-up-bell-sound-effect.mp3";

const useGetSocketMessage = () => {
  const { socket } = useSocketContext();
  const { appendMessage, updateMessageStatus } = useConversation();

  // ✅ New incoming messages — uses appendMessage which handles:
  // - dedup by _id
  // - dedup by clientMessageId
  // - merge if optimistic message already exists
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage) => {
      try {
        const notification = new Audio(sound);
        notification.play();
      } catch (err) {
        console.warn("Audio play failed:", err);
      }

      // ✅ appendMessage instead of setMessages([...messages, newMessage])
      // This avoids the stale closure bug AND handles dedup/merge
      appendMessage(newMessage);
    };

    socket.on("newMessage", handleNewMessage);
    return () => socket.off("newMessage", handleNewMessage);
  }, [socket, appendMessage]);

  // ✅ Status updates
  useEffect(() => {
    if (!socket) return;

    const handleStatusUpdate = ({ messageId, status }) => {
      console.log("📨 Status update:", messageId, status);
      updateMessageStatus(messageId, status);
    };

    socket.on("messageStatusUpdate", handleStatusUpdate);
    return () => socket.off("messageStatusUpdate", handleStatusUpdate);
  }, [socket, updateMessageStatus]);
};

export default useGetSocketMessage;
