import { apiClient, ApiResponse } from "./api.client";

export interface Post {
  id: string;
  content: string;
  imageUrl: string | null;
  createdAt: string;
  author: {
    id: string;
    name: string;
    username: string;
    avatarUrl: string | null;
  };
  _count: {
    likes: number;
    comments: number;
  };
}

export interface CreatePostPayload {
  userId: string;
  content: string;
  image?: File;
}

/** Ambil semua postingan (feed) */
export async function fetchPosts(): Promise<Post[]> {
  const res = await apiClient.get<ApiResponse<Post[]>>("/posts");
  return res.data;
}

/** Ambil detail 1 postingan beserta komentar */
export async function fetchPostById(id: string): Promise<Post> {
  const res = await apiClient.get<ApiResponse<Post>>(`/posts/${id}`);
  return res.data;
}

/** Buat postingan baru (dengan opsional upload gambar) */
export async function createPost(payload: CreatePostPayload): Promise<Post> {
  const formData = new FormData();
  formData.append("userId", payload.userId);
  formData.append("content", payload.content);
  if (payload.image) {
    formData.append("image", payload.image);
  }

  const res = await apiClient.postForm<ApiResponse<Post>>("/posts", formData);
  return res.data;
}

/** Hapus postingan milik sendiri */
export async function deletePost(postId: string, userId: string): Promise<void> {
  await apiClient.delete(`/posts/${postId}`, { userId });
}
