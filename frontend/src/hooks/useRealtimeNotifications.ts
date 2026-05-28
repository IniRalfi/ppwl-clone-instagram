import { useEffect, useRef } from "react";
import Pusher from "pusher-js";
import type { Notification } from "../../../shared/src/types/notification";
import { API_BASE_URL } from "../services/api.client";

const PUSHER_KEY = import.meta.env.VITE_PUSHER_KEY;
const PUSHER_CLUSTER = import.meta.env.VITE_PUSHER_CLUSTER;

export function useRealtimeNotifications(
  userId: string | undefined,
  token: string | null,
  onNotification: (notification: Notification) => void
) {
  const onNotificationRef = useRef(onNotification);

  useEffect(() => {
    onNotificationRef.current = onNotification;
  }, [onNotification]);

  useEffect(() => {
    if (!userId || !token || !PUSHER_KEY || !PUSHER_CLUSTER) return;

    const pusher = new Pusher(PUSHER_KEY, {
      cluster: PUSHER_CLUSTER,
      channelAuthorization: {
        endpoint: `${API_BASE_URL}/notifications/pusher/auth`,
        transport: "ajax",
        headers: {
          Authorization: `Bearer ${token}`,
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
  }, [userId, token]);
}
