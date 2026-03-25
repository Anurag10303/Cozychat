import { useEffect, useState } from "react";
import useConversation from "../zustand/userConveration";
import toast from "react-hot-toast";
import BASE_URL from "../config";

const useGetMessage = () => {
  const [loading, setLoading] = useState(false);

  // FIX: read messages directly from zustand store
  // Now useSendMessage and useGetSocketMessage appending to the store
  // will automatically reflect here — single source of truth
  const { messages, setMessages, selectedConversation } = useConversation();

  useEffect(() => {
    if (!selectedConversation?._id) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          `${BASE_URL}/user/messages/${selectedConversation._id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            credentials: "include",
          },
        );

        const json = await res.json();

        if (!res.ok) {
          throw new Error(json.message || "Failed to fetch messages");
        }

        // Write into zustand store — Messages.jsx will reactively update
        setMessages(Array.isArray(json.data) ? json.data : []);
      } catch (error) {
        toast.error(error.message || "Could not load messages");
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [selectedConversation?._id]);

  // Return zustand messages — same array useSendMessage writes to
  return { loading, messages };
};

export default useGetMessage;
