import { db } from "@/db/client";
import { runDatabaseBackup } from "@/scripts/backup";
import { localCache } from "@/utils/cache";

export class DataService {
  // 1. Jalankan backup manual
  static async backupDatabase() {
    return await runDatabaseBackup();
  }

  // 2. Ambil semua data pengguna (inspeksi)
  // ⚠️ SECURITY: Exclude sensitive fields
  static async getUsers() {
    return await db.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        bio: true,
        avatarUrl: true,
        website: true,
        gender: true,
        role: true,
        provider: true,
        postCount: true,
        commentCount: true,
        createdAt: true,
        updatedAt: true,
        // ❌ EXCLUDE: passwordHash, providerId (sensitive!)
      },
    });
  }

  // 3. Ambil semua data postingan (inspeksi)
  static async getPosts() {
    return await db.post.findMany();
  }

  // 4. Ambil semua data komentar (inspeksi)
  static async getComments() {
    return await db.comment.findMany();
  }

  // 5. Ambil semua data notifikasi (inspeksi)
  static async getNotifications() {
    return await db.notification.findMany();
  }

  // 6. Ambil semua data like (inspeksi)
  static async getLikes() {
    return await db.like.findMany();
  }

  // 7. Ambil metrik cache
  static getCacheMetrics() {
    return localCache.getMetrics();
  }

  // 8. Reset metrik cache
  static resetCacheMetrics() {
    localCache.resetMetrics();
  }

  // 9. Bersihkan semua cache
  static clearCache() {
    localCache.clear();
  }
}
