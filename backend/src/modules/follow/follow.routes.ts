import { Elysia, t } from "elysia";
import { prisma } from "@/config/prisma";

export const followRoutes = new Elysia({ prefix: "/follow" })

  /** GET /follow/suggestions?userId=xxx — Ambil 5 user yang belum di-follow */
  .get(
    "/suggestions",
    async ({ query, error }) => {
      const { userId } = query;
      if (!userId) return error(400, { message: "userId wajib diisi" });

      // Ambil daftar ID yang sudah di-follow oleh user ini
      const alreadyFollowing = await prisma.follow.findMany({
        where: { followerId: userId },
        select: { followingId: true },
      });
      const followingIds = alreadyFollowing.map((f) => f.followingId);

      // Ambil 5 user selain diri sendiri & yang sudah di-follow
      const suggestions = await prisma.user.findMany({
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
    },
    { query: t.Object({ userId: t.Optional(t.String()) }) }
  )

  /** POST /follow — Follow user */
  .post(
    "/",
    async ({ body, error }) => {
      const { followerId, followingId } = body;
      if (followerId === followingId)
        return error(400, { message: "Tidak bisa follow diri sendiri" });

      const existing = await prisma.follow.findUnique({
        where: { followerId_followingId: { followerId, followingId } },
      });
      if (existing) return error(409, { message: "Sudah di-follow" });

      await prisma.follow.create({ data: { followerId, followingId } });
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
    async ({ body, error }) => {
      const { followerId, followingId } = body;
      const existing = await prisma.follow.findUnique({
        where: { followerId_followingId: { followerId, followingId } },
      });
      if (!existing) return error(404, { message: "Belum di-follow" });

      await prisma.follow.delete({
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
