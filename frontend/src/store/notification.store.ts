import { create } from "zustand";
import type { Notification } from "../../../shared/src/types/notification";
import { apiClient } from "../services/api.client";

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  setNotifications: (notifications: Notification[]) => void;
  prependNotification: (notification: Notification) => void;
  markAllRead: () => void;
  fetchNotifications: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  setNotifications: (notifications) => set({ notifications }),
  prependNotification: (notification) => {
    const exists = get().notifications.some((item) => item.id === notification.id);
    if (exists) return;

    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },
  markAllRead: () =>
    set((state) => ({
      unreadCount: 0,
      notifications: state.notifications.map((notification) => ({ ...notification, isRead: true })),
    })),
  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const res = await apiClient.get<{ data: Notification[] }>("/notifications");
      set({ notifications: res.data || [], unreadCount: 0 });
    } finally {
      set({ isLoading: false });
    }
  },
  fetchUnreadCount: async () => {
    const res = await apiClient.get<{ count: number }>("/notifications/unread-count");
    set({ unreadCount: res.count || 0 });
  },
}));
