import type { User } from "./user";

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  author: Pick<User, "id" | "username" | "name" | "avatarUrl">;
  postId: string;
  parentId: string | null;
  replies?: Comment[];
  createdAt: string;
}

export interface CreateCommentDto {
  content: string;
  postId: string;
  parentId?: string;
}
