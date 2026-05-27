import { Elysia, t } from "elysia";
import { db } from "@/db/client";
import { authPlugin } from "@/plugins/auth.plugin";

export const followRoutes = new Elysia({ prefix: "/follow" })
  .use(authPlugin)

  /** GET /follow/stats/:userId?currentUserId=xxx — Jumlah followers & following + status follow */
  .get("/stats/:userId", async ({ params: { userId }, query, getCurrentUser, set }) => {
    const user = await getCurrentUser();
    const currentUserId = user?.id || (query as { currentUserId?: string }).currentUserId;

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
      followers: dbUser._count.followers,
      following: dbUser._count.following,
      isFollowing,
    };
  })

  /** GET /follow/suggestions?userId=xxx — Ambil 5 user yang belum di-follow */
  .get(
    "/suggestions",
    async ({ query, getCurrentUser, set }) => {
      const user = await getCurrentUser();
      const userId = user?.id || (query as { userId?: string }).userId;

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
    async ({ body, getCurrentUser, set }) => {
      const user = await getCurrentUser();
      if (!user) {
        set.status = 401;
        return { message: "Unauthorized" };
      }
      const { followerId, followingId } = body as { followerId: string; followingId: string };

      if (followerId !== user.id) {
        set.status = 403;
        return { message: "Forbidden: You cannot follow on behalf of another user" };
      }

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
    async ({ body, getCurrentUser, set }) => {
      const user = await getCurrentUser();
      if (!user) {
        set.status = 401;
        return { message: "Unauthorized" };
      }
      const { followerId, followingId } = body as { followerId: string; followingId: string };

      if (followerId !== user.id) {
        set.status = 403;
        return { message: "Forbidden: You cannot unfollow on behalf of another user" };
      }

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
