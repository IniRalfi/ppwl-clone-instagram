import { useEffect, useRef } from "react";
import Pusher from "pusher-js";
import { API_BASE_URL } from "../services/api.client";
import { useMessageStore } from "../store/message.store";

const PUSHER_KEY = import.meta.env.VITE_PUSHER_KEY;
const PUSHER_CLUSTER = import.meta.env.VITE_PUSHER_CLUSTER;

export interface RealtimeMessagePayload {
  roomId: string;
  senderId: string;
  receiverId: string;
  message: {
    id: string;
    roomId: string;
    senderId: string;
    text: string;
    isRead: boolean;
    createdAt: string;
  };
}

export interface MessageReadPayload {
  roomId: string;
  readByUserId: string;
}

export function useDirectMessagesRealtime(
  userId: string | undefined,
  token: string | null, // ⚠️ Deprecated: token tidak dipakai lagi (sekarang pakai cookie)
  onMessage: (payload: RealtimeMessagePayload) => void,
  onRead?: (payload: MessageReadPayload) => void
) {
  const onMessageRef = useRef(onMessage);
  const onReadRef = useRef(onRead);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    onReadRef.current = onRead;
  }, [onRead]);

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
    channel.bind("new-message", (payload: RealtimeMessagePayload) => {
      onMessageRef.current(payload);
    });

    channel.bind("message-read", (payload: MessageReadPayload) => {
      const messageStore = useMessageStore.getState();
      messageStore.fetchUnreadCount();
      onReadRef.current?.(payload);
    });

    return () => {
      channel.unbind("new-message");
      channel.unbind("message-read");
      pusher.unsubscribe(`private-user-${userId}`);
      pusher.disconnect();
    };
  }, [userId]); // ❌ REMOVED: token dependency
}
