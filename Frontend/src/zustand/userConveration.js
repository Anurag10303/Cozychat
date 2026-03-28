import { create } from "zustand";

const useConversation = create((set) => ({
  selectedConversation: null,
  setSelectedConversation: (selectedConversation) =>
    set({ selectedConversation }),
  messages: [],

  // ✅ Supports both direct value and updater function: setMessages([]) or setMessages(prev => [...prev, msg])
  setMessages: (messagesOrUpdater) =>
    set((state) => ({
      messages: Array.isArray(messagesOrUpdater)
        ? messagesOrUpdater
        : typeof messagesOrUpdater === "function"
          ? (() => {
              const result = messagesOrUpdater(state.messages);
              return Array.isArray(result) ? result : state.messages;
            })()
          : state.messages,
    })),

  // ✅ Patch a single message status in place
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
