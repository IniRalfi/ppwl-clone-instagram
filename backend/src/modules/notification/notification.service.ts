import { db } from "@/db/client";

export class NotificationService {
  // 1. Ambil notifikasi milik user tertentu
  static async getNotificationsForUser(userId: string) {
    // Tandai semua notifikasi belum terbaca sebagai terbaca
    await db.notification.updateMany({
      where: { receiverId: userId, isRead: false },
      data: { isRead: true }
    });

    const notifications = await db.notification.findMany({
      where: {
        receiverId: userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const enriched = [];

    for (const notif of notifications) {
      let sender: { id: string; username: string; avatarUrl: string | null } | null = null;
      let post: { id: string; imageUrl: string | null; content: string } | null = null;
      let isFollowingSender = false;

      // Ekstrak username pengirim dari awal pesan (ex: "user123 menyukai...")
      const firstWord = notif.message.split(" ")[0];
      if (firstWord && firstWord !== "Seseorang") {
        sender = await db.user.findUnique({
          where: { username: firstWord },
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        });
      }

      // Jika type adalah follow, refId adalah followerId
      if (notif.type === "follow" && notif.refId) {
        const followRecord = await db.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: userId,
              followingId: notif.refId,
            },
          },
        });
        isFollowingSender = !!followRecord;
      }

      // Jika type adalah like atau comment, refId adalah postId
      if ((notif.type === "like" || notif.type === "comment" || notif.type === "reply") && notif.refId) {
        post = await db.post.findUnique({
          where: { id: notif.refId },
          select: {
            id: true,
            imageUrl: true,
            content: true,
          },
        });
      }

      enriched.push({
        ...notif,
        sender,
        post,
        isFollowingSender,
      });
    }

    return enriched;
  }
}
