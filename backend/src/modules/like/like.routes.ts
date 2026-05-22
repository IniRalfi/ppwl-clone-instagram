import { Elysia } from "elysia";
import { db } from "@/db/client";

export const likeRoutes = new Elysia({ prefix: "/likes" })

  // ─────────────────────────────────────────────
  // POST /likes/:postId — Toggle like/unlike
  // Body JSON: { userId: string }
  // ─────────────────────────────────────────────
  .post("/:postId", async ({ params: { postId }, body, set }) => {
    try {
      const { userId } = body as { userId: string };

      if (!userId) {
        set.status = 400;
        return { message: "userId wajib diisi" };
      }

      // Pastikan post ada
      const post = await db.post.findUnique({ where: { id: postId } });
      if (!post) {
        set.status = 404;
        return { message: "Postingan tidak ditemukan" };
      }

      // Cek apakah sudah di-like
      const existingLike = await db.like.findUnique({
        where: { userId_postId: { userId, postId } },
      });

      if (existingLike) {
        // Sudah like → unlike (hapus)
        await db.like.delete({
          where: { userId_postId: { userId, postId } },
        });

        const likeCount = await db.like.count({ where: { postId } });
        return { message: "Unlike berhasil", liked: false, likeCount };
      } else {
        // Belum like → like (tambah)
        await db.like.create({
          data: { userId, postId },
        });

        const likeCount = await db.like.count({ where: { postId } });
        return { message: "Like berhasil", liked: true, likeCount };
      }
    } catch (error) {
      console.error("❌ Gagal toggle like:", error);
      set.status = 500;
      return { message: "Terjadi kesalahan server" };
    }
  })

  // ─────────────────────────────────────────────
  // GET /likes/:postId/status?userId=xxx
  // Cek apakah user sudah like postingan ini
  // ─────────────────────────────────────────────
  .get("/:postId/status", async ({ params: { postId }, query, set }) => {
    const { userId } = query as { userId?: string };

    if (!userId) {
      set.status = 400;
      return { message: "userId wajib diisi sebagai query param" };
    }

    const existingLike = await db.like.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    const likeCount = await db.like.count({ where: { postId } });

    return {
      liked: !!existingLike,
      likeCount,
    };
  });
