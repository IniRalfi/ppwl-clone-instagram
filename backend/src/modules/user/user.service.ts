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
        website: true,
        gender: true,
        showThreads: true,
        suggestions: true,
        createdAt: true,
      }
    });
  }

  // 3. Perbarui informasi profil pengguna aktif
  static async updateProfile(userId: string, data: { username?: string; name?: string; bio?: string; avatarUrl?: string; website?: string; gender?: string; showThreads?: boolean; suggestions?: boolean }) {
    const { username, name, bio, avatarUrl, website, gender, showThreads, suggestions } = data;

    return await db.user.update({
      where: { id: userId },
      data: {
        username: username ?? undefined,
        name: name ?? undefined,
        bio: bio ?? undefined,
        avatarUrl: avatarUrl ?? undefined,
        website: website ?? undefined,
        gender: gender ?? undefined,
        showThreads: showThreads ?? undefined,
        suggestions: suggestions ?? undefined,
      },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        avatarUrl: true,
        bio: true,
        website: true,
        gender: true,
        showThreads: true,
        suggestions: true,
      }
    });
  }
}
