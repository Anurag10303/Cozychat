import { create } from "zustand";

// ✅ Central dedup — runs on every state write, O(n) with Set
const dedup = (msgs) => {
  const seen = new Set();
  return msgs.filter((msg) => {
    const key = msg._id || msg.clientMessageId;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const useConversation = create((set) => ({
  selectedConversation: null,
  setSelectedConversation: (selectedConversation) =>
    set({ selectedConversation }),
  messages: [],

  // ✅ Supports both direct array and updater function, always deduplicates
  setMessages: (messagesOrUpdater) =>
    set((state) => {
      const next =
        typeof messagesOrUpdater === "function"
          ? messagesOrUpdater(state.messages)
          : messagesOrUpdater;
      return { messages: dedup(Array.isArray(next) ? next : state.messages) };
    }),

  // ✅ Smart append — used by socket newMessage handler
  // 1. If _id or clientMessageId already exists → merge (handles optimistic update case)
  // 2. Otherwise → append
  appendMessage: (newMessage) =>
    set((state) => {
      const existingIndex = state.messages.findIndex(
        (msg) =>
          (newMessage._id && msg._id === newMessage._id) ||
          (newMessage.clientMessageId &&
            msg.clientMessageId === newMessage.clientMessageId),
      );

      if (existingIndex !== -1) {
        // Merge — e.g. optimistic message now has real _id from backend
        const updated = [...state.messages];
        updated[existingIndex] = { ...updated[existingIndex], ...newMessage };
        return { messages: updated };
      }

      // New message — append
      return { messages: [...state.messages, newMessage] };
    }),

  // ✅ Patch a single message's status in place
  updateMessageStatus: (messageId, status) =>
    set((state) => ({
      messages: Array.isArray(state.messages)
        ? state.messages.map((msg) =>
            msg._id?.toString() === messageId?.toString()
              ? { ...msg, status }
              : msg,
          )
        : [],
    })),
}));

export default useConversation;
