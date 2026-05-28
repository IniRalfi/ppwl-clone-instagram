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
    const newComment = await db.comment.create({
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
    });

    // Invalidate feed cache agar postingan terupdate
    localCache.deletePattern("posts:feed:");

    // Update commentCount di tabel User
    await db.user.update({
      where: { id: data.authorId },
      data: { commentCount: { increment: 1 } },
    });

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
          message: `${newComment.author?.username || "Seseorang"} mengomentari postinganmu: "${
            data.content.length > 20 ? data.content.substring(0, 20) + "..." : data.content
          }"`,
          receiverId: post.authorId,
          refId: data.postId,
        },
      });
    }

    return newComment;
  }
}
