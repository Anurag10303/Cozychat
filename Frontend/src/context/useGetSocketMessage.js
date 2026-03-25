import { useEffect } from "react";
import { useSocketContext } from "./SocketContext";
import useConversation from "../zustand/userConveration";
import sound from "../assets/Order-up-bell-sound-effect.mp3";

const useGetSocketMessage = () => {
  const { socket } = useSocketContext();
  // FIX: renamed setMessage → setMessages (plural, matches store)
  const { messages, setMessages } = useConversation();

  useEffect(() => {
    // FIX: guard — if socket not ready, do nothing
    if (!socket) return;

    const handleNewMessage = (newMessage) => {
      // Play notification sound
      try {
        const notification = new Audio(sound);
        notification.play();
      } catch (err) {
        console.warn("Audio play failed:", err);
      }

      // FIX: append incoming socket message to existing messages
      setMessages([...messages, newMessage]);
    };

    socket.on("newMessage", handleNewMessage);

    // Cleanup — remove only this specific handler
    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [socket, messages, setMessages]);
};

export default useGetSocketMessage;
