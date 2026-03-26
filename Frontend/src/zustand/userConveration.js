import { create } from "zustand";

const useConversation = create((set) => ({
  selectedConversation: null,
  setSelectedConversation: (selectedConversation) =>
    set({ selectedConversation }),
  messages: [],
  setMessages: (messages) => set({ messages }),

  // ✅ Patch a single message's status in place without replacing the whole array
  updateMessageStatus: (messageId, status) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg._id?.toString() === messageId?.toString()
          ? { ...msg, status }
          : msg
      ),
    })),
}));

export default useConversation;