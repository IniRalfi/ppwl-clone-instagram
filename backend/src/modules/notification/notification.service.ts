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
      where: { receiverId: userId },
      orderBy: { createdAt: "desc" },
      include: {
        sender: {
          select: { id: true, username: true, avatarUrl: true },
        },
      },
    });

    // Kumpulkan semua postId yang unik untuk di-fetch sekali (hindari N+1)
    const postIds = notifications
      .filter((n) => ["like", "comment", "reply"].includes(n.type) && n.refId)
      .map((n) => n.refId as string);

    const uniquePostIds = [...new Set(postIds)];
    const posts = uniquePostIds.length > 0
      ? await db.post.findMany({
          where: { id: { in: uniquePostIds } },
          select: { id: true, imageUrl: true, content: true },
        })
      : [];
    const postMap = new Map(posts.map((p) => [p.id, p]));

    // Untuk notifikasi follow, cek status isFollowing sekali saja
    const followRefIds = notifications
      .filter((n) => n.type === "follow" && n.refId)
      .map((n) => n.refId as string);

    const followRecords = followRefIds.length > 0
      ? await db.follow.findMany({
          where: {
            followerId: userId,
            followingId: { in: followRefIds },
          },
          select: { followingId: true },
        })
      : [];
    const followingSet = new Set(followRecords.map((f) => f.followingId));

    return notifications.map((notif) => ({
      ...notif,
      post: notif.refId && ["like", "comment", "reply"].includes(notif.type)
        ? postMap.get(notif.refId) ?? null
        : null,
      isFollowingSender: notif.type === "follow" && notif.refId
        ? followingSet.has(notif.refId)
        : false,
    }));
  }
}
