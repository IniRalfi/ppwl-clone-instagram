import { Elysia, t } from "elysia";
import { db } from "@/db/client";

export const followRoutes = new Elysia({ prefix: "/follow" })

  /** GET /follow/stats/:userId?currentUserId=xxx — Jumlah followers & following + status follow */
  .get("/stats/:userId", async ({ params: { userId }, query, set }) => {
    const { currentUserId } = query as { currentUserId?: string };

    const user = await db.user.findUnique({
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

    if (!user) {
      set.status = 404;
      return { message: "User tidak ditemukan" };
    }

    // Cek apakah currentUser sudah follow userId ini
    let isFollowing = false;
    if (currentUserId && currentUserId !== userId) {
      const followRecord = await db.follow.findUnique({
        where: { followerId_followingId: { followerId: currentUserId, followingId: userId } },
      });
      isFollowing = !!followRecord;
    }

    return {
      followers: user._count.followers,
      following: user._count.following,
      isFollowing,
    };
  })

  /** GET /follow/suggestions?userId=xxx — Ambil 5 user yang belum di-follow */
  .get(
    "/suggestions",
    async ({ query, set }) => {
      const { userId } = query as { userId?: string };

      if (!userId) {
        set.status = 400;
        return { message: "userId wajib diisi" };
      }

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

      return { data: suggestions };
    }
  )

  /** POST /follow — Follow user */
  .post(
    "/",
    async ({ body, set }) => {
      const { followerId, followingId } = body as { followerId: string; followingId: string };

      if (followerId === followingId) {
        set.status = 400;
        return { message: "Tidak bisa follow diri sendiri" };
      }

      const existing = await db.follow.findUnique({
        where: { followerId_followingId: { followerId, followingId } },
      });

      if (existing) {
        set.status = 409;
        return { message: "Sudah di-follow" };
      }

      await db.follow.create({ data: { followerId, followingId } });
      return { message: "Berhasil follow" };
    },
    {
      body: t.Object({
        followerId: t.String(),
        followingId: t.String(),
      }),
    }
  )

  /** DELETE /follow — Unfollow user */
  .delete(
    "/",
    async ({ body, set }) => {
      const { followerId, followingId } = body as { followerId: string; followingId: string };

      const existing = await db.follow.findUnique({
        where: { followerId_followingId: { followerId, followingId } },
      });

      if (!existing) {
        set.status = 404;
        return { message: "Belum di-follow" };
      }

      await db.follow.delete({
        where: { followerId_followingId: { followerId, followingId } },
      });

      return { message: "Berhasil unfollow" };
    },
    {
      body: t.Object({
        followerId: t.String(),
        followingId: t.String(),
      }),
    }
  );
