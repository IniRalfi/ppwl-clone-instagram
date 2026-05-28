import { db } from "@/db/client";
import { localCache } from "@/utils/cache";

export class LikeService {
  // 1. Toggle Like/Unlike
  static async toggleLike(userId: string, postId: string) {
    const post = await db.post.findUnique({ where: { id: postId } });
    if (!post) {
      throw new Error("Postingan tidak ditemukan");
    }

    const existingLike = await db.like.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    let liked = false;
    if (existingLike) {
      await db.like.delete({
        where: { userId_postId: { userId, postId } },
      });
    } else {
      await db.like.create({
        data: { userId, postId },
      });
      liked = true;
    }

    // Invalidate feed cache
    localCache.deletePattern("posts:feed:");

    const likeCount = await db.like.count({ where: { postId } });
    return { liked, likeCount };
  }

  // 2. Cek status Like & Hitung jumlah Like
  static async getLikeStatus(postId: string, userId?: string) {
    const existingLike = userId
      ? await db.like.findUnique({
          where: { userId_postId: { userId, postId } },
        })
      : null;

    const likeCount = await db.like.count({ where: { postId } });

    return {
      liked: !!existingLike,
      likeCount,
    };
  }
}
