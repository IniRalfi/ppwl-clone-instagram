import { db } from "@/db/client";
import { localCache } from "@/utils/cache";
import { Prisma } from "@prisma/client";
import { NotificationService } from "@/modules/notification/notification.service";
import { triggerPublicRealtime } from "@/config/pusher";

export class LikeService {
  // 1. Toggle Like/Unlike
  static async toggleLike(userId: string, postId: string) {
    const post = await db.post.findUnique({ where: { id: postId } });
    if (!post) {
      throw new Error("Postingan tidak ditemukan");
    }

    let liked = false;
    try {
      await db.like.create({
        data: { userId, postId },
      });
      liked = true;

      // Buat notifikasi jika bukan menyukai postingan sendiri
      if (post.authorId !== userId) {
        await NotificationService.createNotification({
          type: "like",
          message: "menyukai postinganmu.",
          receiverId: post.authorId,
          senderId: userId,
          refId: postId,
        });
      }
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        try {
          await db.like.delete({
            where: { userId_postId: { userId, postId } },
          });
          liked = false;
        } catch (deleteError) {
          // Jika sudah dihapus oleh request paralel lain, abaikan
        }
      } else {
        throw error;
      }
    }

    // Invalidate feed cache
    localCache.deletePattern("posts:feed:");

    const likeCount = await db.like.count({ where: { postId } });
    await triggerPublicRealtime("post-engagement-updated", { postId, likeCount });
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
