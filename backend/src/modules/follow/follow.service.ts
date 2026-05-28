import { db } from "@/db/client";
import { Prisma } from "@prisma/client";

export class FollowService {
  // 1. Ambil statistik follower & following + status follow
  static async getFollowStats(userId: string, currentUserId?: string) {
    const dbUser = await db.user.findUnique({
      where: { id: userId },
      select: {
        _count: {
          select: {
            followers: true,
            following: true,
          },
        },
      },
    });

    if (!dbUser) {
      throw new Error("User tidak ditemukan");
    }

    let isFollowing = false;
    if (currentUserId && currentUserId !== userId) {
      const followRecord = await db.follow.findUnique({
        where: { followerId_followingId: { followerId: currentUserId, followingId: userId } },
      });
      isFollowing = !!followRecord;
    }

    return {
      followers: dbUser._count.followers,
      following: dbUser._count.following,
      isFollowing,
    };
  }

  // 2. Ambil followers
  static async getFollowers(userId: string) {
    const followersList = await db.follow.findMany({
      where: { followingId: userId },
      include: {
        follower: {
          select: {
            id: true,
            username: true,
            name: true,
            avatarUrl: true,
            bio: true,
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return followersList.map(f => f.follower);
  }

  // 3. Ambil following
  static async getFollowing(userId: string) {
    const followingList = await db.follow.findMany({
      where: { followerId: userId },
      include: {
        following: {
          select: {
            id: true,
            username: true,
            name: true,
            avatarUrl: true,
            bio: true,
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return followingList.map(f => f.following);
  }

  // 4. Ambil saran user (suggestions) — 1 query dengan nested relation filter
  static async getSuggestions(userId: string) {
    return await db.user.findMany({
      where: {
        id: { not: userId },
        suggestions: true,
        // Filter: belum di-follow oleh userId (tidak ada follow record dari userId ke user ini)
        followers: {
          none: { followerId: userId },
        },
      },
      select: {
        id: true,
        username: true,
        name: true,
        avatarUrl: true,
        _count: { select: { followers: true } },
      },
      take: 30,
      orderBy: { createdAt: "desc" },
    });
  }

  // 5. Follow user
  static async followUser(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new Error("Tidak bisa follow diri sendiri");
    }

    try {
      await db.follow.create({ data: { followerId, followingId } });

      // Buat notifikasi follow
      await db.notification.create({
        data: {
          type: "follow",
          message: "Seseorang mulai mengikuti Anda.",
          receiverId: followingId,
          senderId: followerId,
          refId: followerId,
        },
      });
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new Error("Sudah di-follow");
      }
      throw error;
    }
  }

  // 6. Unfollow user
  static async unfollowUser(followerId: string, followingId: string) {
    try {
      await db.follow.delete({
        where: { followerId_followingId: { followerId, followingId } },
      });
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
        throw new Error("Belum di-follow");
      }
      throw error;
    }
  }
}
