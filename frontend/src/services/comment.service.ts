import { apiClient } from "./api.client";
import type { Comment, CreateCommentDto } from "../../../shared/src/types/comment";

// ============================================================
// GET  /posts/:postId/comments
// Ambil semua komentar (termasuk replies bersarang) dari sebuah post
// ============================================================
export async function getCommentsByPost(postId: string): Promise<Comment[]> {
  return apiClient.get<Comment[]>(`/posts/${postId}/comments`);
}

// ============================================================
// POST /posts/:postId/comments
// Kirim komentar baru (bisa komentar utama atau reply)
// parentId diisi kalau ini adalah balasan dari komentar lain
// ============================================================
export async function createComment(dto: CreateCommentDto): Promise<Comment> {
  return apiClient.post<Comment>(`/posts/${dto.postId}/comments`, {
    content: dto.content,
    parentId: dto.parentId ?? null,
  });
}

// ============================================================
// DELETE /comments/:commentId
// Hapus komentar milik sendiri
// ============================================================
export async function deleteComment(commentId: string): Promise<void> {
  return apiClient.delete(`/comments/${commentId}`);
}

// ============================================================
// Helper: hitung berapa komentar user tertentu di satu post
// (untuk keperluan validasi batas 5 komentar)
// Catatan: ini dihitung dari data yang sudah di-fetch, bukan API tambahan
// ============================================================
export function countUserComments(
  comments: Comment[],
  userId: string,
): number {
  let count = 0;

  const traverse = (list: Comment[]) => {
    for (const c of list) {
      if (c.authorId === userId) count++;
      if (c.replies && c.replies.length > 0) traverse(c.replies);
    }
  };

  traverse(comments);
  return count;
}
