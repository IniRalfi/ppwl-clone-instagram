import { useEffect, useRef } from "react";
import Pusher from "pusher-js";
import type { Notification } from "../../../shared/src/types/notification";
import { API_BASE_URL } from "../services/api.client";

const PUSHER_KEY = import.meta.env.VITE_PUSHER_KEY;
const PUSHER_CLUSTER = import.meta.env.VITE_PUSHER_CLUSTER;

export function useRealtimeNotifications(
  userId: string | undefined,
  token: string | null, // ⚠️ Deprecated: token tidak dipakai lagi (sekarang pakai cookie)
  onNotification: (notification: Notification) => void
) {
  const onNotificationRef = useRef(onNotification);

  useEffect(() => {
    onNotificationRef.current = onNotification;
  }, [onNotification]);

  useEffect(() => {
    if (!userId || !PUSHER_KEY || !PUSHER_CLUSTER) return;

    const pusher = new Pusher(PUSHER_KEY, {
      cluster: PUSHER_CLUSTER,
      channelAuthorization: {
        endpoint: `${API_BASE_URL}/notifications/pusher/auth`,
        transport: "ajax",
        // ❌ REMOVED: Authorization header (token sudah di cookie)
        // ✅ ADDED: Send credentials (cookies)
        customHandler: async (params, callback) => {
          try {
            const response = await fetch(`${API_BASE_URL}/notifications/pusher/auth`, {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: new URLSearchParams(params as unknown as Record<string, string>).toString(),
              credentials: "include", // ✅ Kirim cookie
            });

            if (!response.ok) {
              callback(new Error("Unauthorized"), null);
              return;
            }

            const data = await response.json();
            callback(null, data);
          } catch (error) {
            callback(error as Error, null);
          }
        },
      },
    });

    const channel = pusher.subscribe(`private-user-${userId}`);
    channel.bind("new-notification", (notification: Notification) => {
      onNotificationRef.current(notification);
    });

    return () => {
      channel.unbind("new-notification");
      pusher.unsubscribe(`private-user-${userId}`);
      pusher.disconnect();
    };
  }, [userId]); // ❌ REMOVED: token dependency
}
