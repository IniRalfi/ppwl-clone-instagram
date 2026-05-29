import { db } from "@/db/client";
import { pusher } from "@/config/pusher";
import { sendWebPushToUser } from "@/config/web-push";

const POST_NOTIFICATION_TYPES = ["like", "comment", "reply", "mention", "comment_like"];

type CreateNotificationInput = {
  type: string;
  message: string;
  receiverId: string;
  senderId?: string | null;
  refId?: string | null;
};

type PushSubscriptionInput = {
  endpoint?: string;
  keys?: {
    p256dh?: string;
    auth?: string;
  };
};

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

    return this.enrichNotifications(userId, notifications);
  }

  static async getUnreadCount(userId: string) {
    return db.notification.count({ where: { receiverId: userId, isRead: false } });
  }

  static async createNotification(data: CreateNotificationInput) {
    const notification = await db.notification.create({
      data,
      include: {
        sender: {
          select: { id: true, username: true, avatarUrl: true },
        },
      },
    });

    const [enrichedNotification] = await this.enrichNotifications(data.receiverId, [notification]);

    await Promise.all([
      this.triggerRealtimeNotification(data.receiverId, enrichedNotification),
      sendWebPushToUser(data.receiverId, {
        title: "Instafy",
        body: enrichedNotification.message,
        url: this.getNotificationUrl(enrichedNotification),
        notification: enrichedNotification,
      }),
    ]).catch((error) => {
      console.error("❌ Gagal mengirim realtime notification:", error);
    });

    return enrichedNotification;
  }

  static async savePushSubscription(userId: string, subscription: PushSubscriptionInput, userAgent?: string) {
    const endpoint = subscription.endpoint;
    const p256dh = subscription.keys?.p256dh;
    const auth = subscription.keys?.auth;

    if (!endpoint || !p256dh || !auth) {
      throw new Error("Push subscription tidak valid");
    }

    return db.pushSubscription.upsert({
      where: { endpoint },
      update: { userId, p256dh, auth, userAgent },
      create: { userId, endpoint, p256dh, auth, userAgent },
    });
  }

  static async deletePushSubscription(userId: string, endpoint: string) {
    await db.pushSubscription.deleteMany({ where: { userId, endpoint } });
  }

  private static async enrichNotifications(userId: string, notifications: any[]) {
    // Kumpulkan semua postId yang unik untuk di-fetch sekali (hindari N+1)
    const postIds = notifications
      .filter((n) => POST_NOTIFICATION_TYPES.includes(n.type) && n.refId)
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
      post: notif.refId && POST_NOTIFICATION_TYPES.includes(notif.type)
        ? postMap.get(notif.refId) ?? null
        : null,
      isFollowingSender: notif.type === "follow" && notif.refId
        ? followingSet.has(notif.refId)
        : false,
    }));
  }

  private static async triggerRealtimeNotification(receiverId: string, notification: any) {
    console.log(`[Pusher] Mencoba mengirim notifikasi ke channel: private-user-${receiverId}`);
    if (!pusher) {
      console.log("[Pusher] Gagal: Instansi pusher bernilai null atau belum aktif.");
      return;
    }

    try {
      const res = await pusher.trigger(`private-user-${receiverId}`, "new-notification", notification);
      console.log("[Pusher] Notifikasi berhasil dikirim via pusher.trigger, response:", res);
    } catch (error) {
      console.error("[Pusher] ERROR saat memanggil pusher.trigger:", error);
    }
  }

  private static getNotificationUrl(notification: any) {
    if (notification.type === "follow" && notification.sender?.username) {
      return `/profile/${notification.sender.username}`;
    }

    if (notification.type === "message") {
      return notification.refId ? `/messages?roomId=${notification.refId}` : "/messages";
    }

    if (notification.post?.id) {
      return `/posts/${notification.post.id}`;
    }

    return "/notifications";
  }
}
