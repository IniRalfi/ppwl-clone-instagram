export type NotificationType = "like" | "comment" | "reply" | "mention" | "comment_like" | "follow" | "message";

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  isRead: boolean;
  refId: string | null;
  receiverId: string;
  createdAt: string;
  
  // Enriched fields
  sender?: {
    id: string;
    username: string;
    avatarUrl: string | null;
  } | null;
  post?: {
    id: string;
    imageUrl: string | null;
    content: string;
  } | null;
  isFollowingSender?: boolean;
}
