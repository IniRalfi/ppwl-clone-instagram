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
  token: string | null,
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
  }, [userId, token]);
}
