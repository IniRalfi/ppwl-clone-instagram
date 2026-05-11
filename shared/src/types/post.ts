import type { User } from "./user";

export interface Post {
  id: string;
  content: string;
  imageUrl: string | null;
  authorId: string;
  author: Pick<User, "id" | "username" | "name" | "avatarUrl">;
  _count?: {
    likes: number;
    comments: number;
  };
  isLiked?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostDto {
  content: string;
  imageUrl?: string;
}

export interface UpdatePostDto {
  content?: string;
  imageUrl?: string;
}
