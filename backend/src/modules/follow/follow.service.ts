import { db } from "@/db/client";

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

  // 4. Ambil saran user (suggestions)
  static async getSuggestions(userId: string) {
    // Ambil daftar ID yang sudah di-follow oleh user ini
    const alreadyFollowing = await db.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });
    const followingIds = alreadyFollowing.map((f: { followingId: string }) => f.followingId);

    // Ambil 5 user selain diri sendiri & yang sudah di-follow
    const suggestions = await db.user.findMany({
      where: {
        id: { notIn: [userId, ...followingIds] },
      },
      select: {
        id: true,
        username: true,
        name: true,
        avatarUrl: true,
        _count: { select: { followers: true } },
      },
      take: 5,
      orderBy: { createdAt: "desc" },
    });

    return suggestions;
  }

  // 5. Follow user
  static async followUser(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new Error("Tidak bisa follow diri sendiri");
    }

    const existing = await db.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
    });

    if (existing) {
      throw new Error("Sudah di-follow");
    }

    await db.follow.create({ data: { followerId, followingId } });
  }

  // 6. Unfollow user
  static async unfollowUser(followerId: string, followingId: string) {
    const existing = await db.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
    });

    if (!existing) {
      throw new Error("Belum di-follow");
    }

    await db.follow.delete({
      where: { followerId_followingId: { followerId, followingId } },
    });
  }
}
