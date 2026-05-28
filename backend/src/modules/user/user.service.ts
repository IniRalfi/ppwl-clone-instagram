import { db } from "@/db/client";

export class UserService {
  // 1. Cari pengguna berdasarkan username atau nama
  static async searchUsers(search?: string) {
    return await db.user.findMany({
      where: search
        ? {
            OR: [
              { username: { contains: search, mode: "insensitive" } },
              { name: { contains: search, mode: "insensitive" } },
            ],
          }
        : undefined,
      select: {
        id: true,
        username: true,
        name: true,
        avatarUrl: true,
        bio: true,
        createdAt: true,
      }
    });
  }

  // 2. Ambil detail profil berdasarkan username
  static async getUserByUsername(username: string) {
    return await db.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        name: true,
        avatarUrl: true,
        bio: true,
        createdAt: true,
      }
    });
  }

  // 3. Perbarui informasi profil pengguna aktif
  static async updateProfile(userId: string, data: { name?: string; bio?: string; avatarUrl?: string }) {
    const { name, bio, avatarUrl } = data;

    return await db.user.update({
      where: { id: userId },
      data: {
        name: name ?? undefined,
        bio: bio ?? undefined,
        avatarUrl: avatarUrl ?? undefined,
      },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        avatarUrl: true,
        bio: true,
      }
    });
  }
}
