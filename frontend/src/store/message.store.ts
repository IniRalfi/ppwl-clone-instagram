import { create } from "zustand";
import { apiClient } from "../services/api.client";

interface MessageStore {
  unreadCount: number;
  activeRoomId: string | null;
  setActiveRoomId: (id: string | null) => void;
  fetchUnreadCount: () => Promise<void>;
  decrementUnread: (by: number) => void;
}

export const useMessageStore = create<MessageStore>((set) => ({
  unreadCount: 0,
  activeRoomId: null,
  setActiveRoomId: (id) => set({ activeRoomId: id }),
  fetchUnreadCount: async () => {
    try {
      const res = await apiClient.get<{ count: number }>("/messages/unread-count");
      set({ unreadCount: res.count || 0 });
    } catch {
      // silent
    }
  },
  decrementUnread: (by) =>
    set((state) => ({ unreadCount: Math.max(0, state.unreadCount - by) })),
}));
