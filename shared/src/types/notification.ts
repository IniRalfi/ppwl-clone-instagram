export type NotificationType = "like" | "comment" | "reply";

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  isRead: boolean;
  refId: string | null;
  receiverId: string;
  createdAt: string;
}
