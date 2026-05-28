import { db } from "@/db/client";

export class NotificationService {
  // 1. Ambil notifikasi milik user tertentu
  static async getNotificationsForUser(userId: string) {
    return await db.notification.findMany({
      where: {
        receiverId: userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }
}
