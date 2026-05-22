import { apiClient } from "./api.client";

export interface LikeStatusResponse {
  liked: boolean;
  likeCount: number;
}

export interface LikeToggleResponse {
  message: string;
  liked: boolean;
  likeCount: number;
}

/** Toggle like/unlike sebuah postingan */
export async function toggleLike(
  postId: string,
  userId: string
): Promise<LikeToggleResponse> {
  return apiClient.post<LikeToggleResponse>(`/likes/${postId}`, { userId });
}

/** Cek apakah user sudah like sebuah postingan */
export async function getLikeStatus(
  postId: string,
  userId: string
): Promise<LikeStatusResponse> {
  return apiClient.get<LikeStatusResponse>(`/likes/${postId}/status?userId=${userId}`);
}
