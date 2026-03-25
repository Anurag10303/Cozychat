import { useState } from "react";
import { v4 as uuidv4 } from "uuid"; // npm i uuid
import toast from "react-hot-toast";
import useConversation from "../zustand/userConveration";
import { useAuth } from "./AuthProvider";
import BASE_URL from "../config";

const useSendMessage = () => {
  const [loading, setLoading] = useState(false);
  const [authUser] = useAuth();

  // FIX: setMessages (plural) matches the zustand store
  const { messages, setMessages, selectedConversation } = useConversation();

  const sendMessages = async (message) => {
    if (!selectedConversation?._id) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      // FIX: generate clientMessageId — controller requires it
      const clientMessageId = uuidv4();

      const res = await fetch(
        `${BASE_URL}/user/messages/send/${selectedConversation._id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ message, clientMessageId }),
        },
      );

      const json = await res.json();

      // FIX: check for API-level errors (4xx / 5xx)
      if (!res.ok) {
        throw new Error(json.message || "Failed to send message");
      }

      // FIX: extract json.data (the actual saved message object)
      const savedMessage = json.data;

      // Ensure senderId is always set (safety net)
      const newMessage = {
        ...savedMessage,
        senderId: savedMessage.senderId ?? authUser?.user?._id,
      };

      // FIX: setMessages (plural) — append to existing array
      setMessages([...messages, newMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error(error.message || "Could not send message");
    } finally {
      setLoading(false);
    }
  };

  return { loading, sendMessages };
};

export default useSendMessage;
