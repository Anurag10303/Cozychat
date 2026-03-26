import { useEffect } from "react";
import { useSocketContext } from "./SocketContext";
import useConversation from "../zustand/userConveration";
import sound from "../assets/Order-up-bell-sound-effect.mp3";

const useGetSocketMessage = () => {
  const { socket } = useSocketContext();
  const { messages, setMessages, updateMessageStatus } = useConversation();

  // ✅ New incoming messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage) => {
      try {
        const notification = new Audio(sound);
        notification.play();
      } catch (err) {
        console.warn("Audio play failed:", err);
      }
      setMessages([...messages, newMessage]);
    };

    socket.on("newMessage", handleNewMessage);
    return () => socket.off("newMessage", handleNewMessage);
  }, [socket, messages, setMessages]);

  // ✅ Status updates — backend always emits "messageStatusUpdate" with { messageId, status }
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
