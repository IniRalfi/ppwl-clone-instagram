import { db } from "@/db/client";
import { localCache } from "@/utils/cache";

export class CommentService {
  // 1. Ambil semua komentar
  static async getAllComments() {
    return await db.comment.findMany({
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  // 2. Buat komentar baru + update stats + kirim notifikasi
  static async createComment(data: { content: string; postId: string; parentId: string | null; authorId: string }) {
    // Buat komentar dan update commentCount secara atomik
    const [newComment] = await db.$transaction([
      db.comment.create({
        data: {
          content: data.content,
          postId: data.postId,
          parentId: data.parentId,
          authorId: data.authorId,
        },
        include: {
          author: {
            select: { id: true, username: true, name: true, avatarUrl: true },
          },
        },
      }),
      db.user.update({
        where: { id: data.authorId },
        data: { commentCount: { increment: 1 } },
      }),
    ]);

    // Invalidate feed cache agar postingan terupdate
    localCache.deletePattern("posts:feed:");

    // Ambil data post untuk mengetahui siapa pemiliknya
    const post = await db.post.findUnique({
      where: { id: data.postId },
      select: { authorId: true },
    });

    // Buat notifikasi jika yang berkomentar bukan pemilik postingan asli
    if (post && post.authorId !== data.authorId) {
      await db.notification.create({
        data: {
          type: "comment",
          message: "Seseorang mengomentari postinganmu.",
          receiverId: post.authorId,
          senderId: data.authorId,
          refId: data.postId,
        },
      });
    }

    return newComment;
  }

  // 3. Toggle like komentar + kirim notifikasi
  static async toggleLikeComment(userId: string, commentId: string) {
    const comment = await db.comment.findUnique({
      where: { id: commentId },
      select: { authorId: true, content: true, postId: true, author: { select: { username: true } } },
    });

    if (!comment) {
      throw new Error("Komentar tidak ditemukan");
    }

    const existingLike = await db.commentLike.findUnique({
      where: {
        userId_commentId: {
          userId,
          commentId,
        },
      },
    });

    let liked = false;
    if (existingLike) {
      await db.commentLike.delete({
        where: {
          userId_commentId: {
            userId,
            commentId,
          },
        },
      });
    } else {
      await db.commentLike.create({
        data: {
          userId,
          commentId,
        },
      });
      liked = true;

      // Buat notifikasi jika yang menyukai bukan pembuat komentar itu sendiri
      if (comment.authorId !== userId) {
        await db.notification.create({
          data: {
            type: "comment_like",
            message: "Seseorang menyukai komentar Anda.",
            receiverId: comment.authorId,
            senderId: userId,
            refId: comment.postId,
          },
        });
      }
    }

    // Invalidate caches
    localCache.deletePattern("posts:single:");

    return liked;
  }
}

