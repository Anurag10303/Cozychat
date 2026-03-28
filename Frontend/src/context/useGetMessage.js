import { useEffect, useState, useCallback } from "react";
import useConversation from "../zustand/userConveration";
import toast from "react-hot-toast";
import BASE_URL from "../config";

const useGetMessage = () => {
  const [loading, setLoading] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  const { messages, setMessages, selectedConversation } = useConversation();

  // Initial load — page 1 — runs when conversation changes
  useEffect(() => {
    if (!selectedConversation?._id) {
      setMessages([]);
      setHasMore(false);
      setPage(1);
      return;
    }

    const fetchMessages = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${BASE_URL}/user/messages/${selectedConversation._id}?page=1&limit=20`,
          {
            headers: { Authorization: `Bearer ${token}` },
            credentials: "include",
          },
        );

        const json = await res.json();
        console.log("API response:", json);
        if (!res.ok)
          throw new Error(json.message || "Failed to fetch messages");

        setMessages(json.data);
        setHasMore(json.hasNextPage);
        setPage(1); // reset on conversation switch
      } catch (error) {
        toast.error(error.message || "Could not load messages");
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [selectedConversation?._id]);

  // Called by Messages.jsx when user scrolls to top
  const fetchOlderMessages = useCallback(async () => {
    if (!hasMore || isFetchingMore || !selectedConversation?._id) return;

    const nextPage = page + 1;
    setIsFetchingMore(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${BASE_URL}/user/messages/${selectedConversation._id}?page=${nextPage}&limit=20`,
        {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        },
      );

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to fetch messages");

      setMessages((prev) => [...json.data, ...prev]); // prepend older messages
      setHasMore(json.hasNextPage);
      setPage(nextPage);
    } catch (error) {
      toast.error(error.message || "Could not load older messages");
    } finally {
      setIsFetchingMore(false);
    }
  }, [hasMore, isFetchingMore, page, selectedConversation?._id]);

  return { loading, isFetchingMore, hasMore, messages, fetchOlderMessages };
};

export default useGetMessage;
