import { useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";
import { NotificationDrawer } from "../notification/NotificationDrawer";
import { PushPermissionModal } from "../notification/PushPermissionModal";
import { useRealtimeNotifications } from "../../hooks/useRealtimeNotifications";
import { useAuthStore } from "../../store/auth.store";
import { useNotificationStore } from "../../store/notification.store";
import { useMessageStore } from "../../store/message.store";
import { toast } from "sonner";
import type { Notification } from "../../../../shared/src/types/notification";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen bg-ig-background text-ig-text relative">
      {/* Sidebar: Tampil di desktop (md ke atas), tersembunyi di mobile */}
      <div className="hidden md:flex flex-shrink-0 sticky top-0 h-screen w-[72px] z-50">
        <Sidebar />
      </div>

      {/* Laci Notifikasi (Slide out drawer) */}
      <NotificationDrawer />
      <NotificationRealtimeBridge />

      {/* Konten Utama Aplikasi */}
      <main className="flex-1 min-w-0 pb-16 md:pb-0 overflow-y-auto">
        {children}
      </main>

      {/* BottomNav: Tampil di mobile (di bawah md), tersembunyi di desktop */}
      <BottomNav />
    </div>
  );
}

function NotificationRealtimeBridge() {
  const { user, token } = useAuthStore();
  const prependNotification = useNotificationStore((state) => state.prependNotification);
  const fetchUnreadCount = useNotificationStore((state) => state.fetchUnreadCount);
  const setNotifications = useNotificationStore((state) => state.setNotifications);
  const markAllRead = useNotificationStore((state) => state.markAllRead);
  const activeRoomId = useMessageStore((state) => state.activeRoomId);
  const fetchUnreadMessageCount = useMessageStore((state) => state.fetchUnreadCount);

  useEffect(() => {
    if (user) {
      fetchUnreadCount().catch(() => null);
      fetchUnreadMessageCount().catch(() => null);
    } else {
      setNotifications([]);
      markAllRead();
    }
  }, [user, fetchUnreadCount, fetchUnreadMessageCount, setNotifications, markAllRead]);

  useRealtimeNotifications(user?.id, token, (notification) => {
    prependNotification(notification);

    // Suppress toast notification for messages if user is inside that chat room
    const isMessageInActiveChat =
      notification.type === "message" &&
      notification.refId &&
      notification.refId === activeRoomId;

    if (!isMessageInActiveChat) {
      toast(formatRealtimeNotification(notification), {
        description: notification.sender?.username ? `Dari @${notification.sender.username}` : "Notifikasi baru",
      });
    }

    // Also refresh unread message count on any new notification (might be a message)
    fetchUnreadMessageCount().catch(() => null);
  });

  return <PushPermissionModal />;
}

function formatRealtimeNotification(notification: Notification) {
  const username = notification.sender?.username;
  return username ? `@${username} ${notification.message}` : notification.message;
}
