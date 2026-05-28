import { db } from "@/db/client";
import { localCache } from "@/utils/cache";
import { NotificationService } from "@/modules/notification/notification.service";
import { triggerPublicRealtime } from "@/config/pusher";

function truncateNotificationText(text: string) {
  const cleanText = text.trim().replace(/\s+/g, " ");
  return cleanText.length > 80 ? `${cleanText.slice(0, 77)}...` : cleanText;
}

function getMentionedUsernames(text: string) {
  const matches = text.match(/@([a-z0-9._]+)/gi) ?? [];
  return [...new Set(matches.map((match) => match.slice(1).toLowerCase()))];
}

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

    const parentComment = data.parentId
      ? await db.comment.findUnique({
          where: { id: data.parentId },
          select: { authorId: true },
        })
      : null;

    const notifiedUserIds = new Set<string>();
    const quotedComment = truncateNotificationText(data.content);

    if (parentComment && parentComment.authorId !== data.authorId) {
      await NotificationService.createNotification({
        type: "reply",
        message: `membalas komentarmu: "${quotedComment}"`,
        receiverId: parentComment.authorId,
        senderId: data.authorId,
        refId: data.postId,
      });
      notifiedUserIds.add(parentComment.authorId);
    }

    // Buat notifikasi jika yang berkomentar bukan pemilik postingan asli
    if (post && post.authorId !== data.authorId && !notifiedUserIds.has(post.authorId)) {
      await NotificationService.createNotification({
        type: "comment",
        message: `mengomentari postinganmu: "${quotedComment}"`,
        receiverId: post.authorId,
        senderId: data.authorId,
        refId: data.postId,
      });
      notifiedUserIds.add(post.authorId);
    }

    const mentionedUsernames = getMentionedUsernames(data.content);
    if (mentionedUsernames.length > 0) {
      const mentionedUsers = await db.user.findMany({
        where: { username: { in: mentionedUsernames } },
        select: { id: true },
      });

      for (const mentionedUser of mentionedUsers) {
        if (mentionedUser.id === data.authorId || notifiedUserIds.has(mentionedUser.id)) continue;

        await NotificationService.createNotification({
          type: "mention",
          message: `menyebut kamu dalam komentar: "${quotedComment}"`,
          receiverId: mentionedUser.id,
          senderId: data.authorId,
          refId: data.postId,
        });
        notifiedUserIds.add(mentionedUser.id);
      }
    }

    const commentCount = await db.comment.count({ where: { postId: data.postId } });
    await triggerPublicRealtime("comment-created", { postId: data.postId, comment: newComment, commentCount });
    await triggerPublicRealtime("post-engagement-updated", { postId: data.postId, commentCount });

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
        await NotificationService.createNotification({
          type: "comment_like",
          message: `menyukai komentarmu: "${truncateNotificationText(comment.content)}"`,
          receiverId: comment.authorId,
          senderId: userId,
          refId: comment.postId,
        });
      }
    }

    // Invalidate caches
    localCache.deletePattern("posts:single:");

    return liked;
  }
}
