import { Elysia } from "elysia";
import { db } from "@/db/client";
import { authPlugin } from "@/plugins/auth.plugin";
import { localCache } from "@/utils/cache";

export const likeRoutes = new Elysia({ prefix: "/likes" })
  .use(authPlugin)

  // ─────────────────────────────────────────────
  // POST /likes/:postId — Toggle like/unlike
  // ─────────────────────────────────────────────
  .post("/:postId", async ({ params: { postId }, getCurrentUser, set }) => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        set.status = 401;
        return { message: "Unauthorized" };
      }
      const userId = user.id;

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

        // Invalidate hanya feed cache
        localCache.deletePattern("posts:feed:");
        const likeCount = await db.like.count({ where: { postId } });
        return { message: "Unlike berhasil", liked: false, likeCount };
      } else {
        // Belum like → like (tambah)
        await db.like.create({
          data: { userId, postId },
        });

        // Invalidate hanya feed cache
        localCache.deletePattern("posts:feed:");
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
  // GET /likes/:postId/status
  // Cek apakah user sudah like postingan ini
  // ─────────────────────────────────────────────
  .get("/:postId/status", async ({ params: { postId }, getCurrentUser, set }) => {
    try {
      const user = await getCurrentUser();
      const userId = user?.id;

      const existingLike = userId
        ? await db.like.findUnique({
            where: { userId_postId: { userId, postId } },
          })
        : null;

      const likeCount = await db.like.count({ where: { postId } });

      return {
        liked: !!existingLike,
        likeCount,
      };
    } catch (error) {
      console.error("❌ Gagal get like status:", error);
      set.status = 500;
      return { message: "Terjadi kesalahan server" };
    }
  });
