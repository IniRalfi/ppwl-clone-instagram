import { useEffect, useRef } from "react";
import Pusher from "pusher-js";

const PUSHER_KEY = import.meta.env.VITE_PUSHER_KEY;
const PUSHER_CLUSTER = import.meta.env.VITE_PUSHER_CLUSTER;

type PublicRealtimeHandlers = {
  onPostCreated?: (post: any) => void;
  onPostEngagementUpdated?: (payload: { postId: string; likeCount?: number; commentCount?: number }) => void;
  onCommentCreated?: (payload: { postId: string; comment: any; commentCount: number }) => void;
  onStoryCreated?: (payload: { userId: string }) => void;
};

export function usePublicRealtime(handlers: PublicRealtimeHandlers) {
  const handlersRef = useRef(handlers);

  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  useEffect(() => {
    if (!PUSHER_KEY || !PUSHER_CLUSTER) return;

    const pusher = new Pusher(PUSHER_KEY, { cluster: PUSHER_CLUSTER });
    const channel = pusher.subscribe("public-feed");

    channel.bind("post-created", (post: any) => {
      handlersRef.current.onPostCreated?.(post);
    });
    channel.bind("post-engagement-updated", (payload: { postId: string; likeCount?: number; commentCount?: number }) => {
      handlersRef.current.onPostEngagementUpdated?.(payload);
    });
    channel.bind("comment-created", (payload: { postId: string; comment: any; commentCount: number }) => {
      handlersRef.current.onCommentCreated?.(payload);
    });
    channel.bind("story-created", (payload: { userId: string }) => {
      handlersRef.current.onStoryCreated?.(payload);
    });

    return () => {
      channel.unbind("post-created");
      channel.unbind("post-engagement-updated");
      channel.unbind("comment-created");
      channel.unbind("story-created");
      pusher.unsubscribe("public-feed");
      pusher.disconnect();
    };
  }, []);
}
