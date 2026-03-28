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
        if (!res.ok)
          throw new Error(json.message || "Failed to fetch messages");

        // setMessages runs dedup internally via the Zustand store
        setMessages(Array.isArray(json.data) ? json.data : []);
        setHasMore(json.hasNextPage ?? false);
        setPage(1);
      } catch (error) {
        toast.error(error.message || "Could not load messages");
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [selectedConversation?._id]);

  // ✅ Pagination — prepend older messages with dedup
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

      const fetched = Array.isArray(json.data) ? json.data : [];

      // ✅ Dedup against existing messages before prepending
      setMessages((prev) => {
        const existingIds = new Set(
          prev.map((msg) => msg._id || msg.clientMessageId).filter(Boolean),
        );

        const fresh = fetched.filter(
          (msg) =>
            !existingIds.has(msg._id) && !existingIds.has(msg.clientMessageId),
        );

        return [...fresh, ...prev];
      });

      setHasMore(json.hasNextPage ?? false);
      setPage(nextPage);
    } catch (error) {
      toast.error(error.message || "Could not load older messages");
    } finally {
      setIsFetchingMore(false);
    }
  }, [hasMore, isFetchingMore, page, selectedConversation?._id]);

  return {
    loading,
    isFetchingMore,
    hasMore,
    messages: Array.isArray(messages) ? messages : [],
    fetchOlderMessages,
  };
};

export default useGetMessage;
