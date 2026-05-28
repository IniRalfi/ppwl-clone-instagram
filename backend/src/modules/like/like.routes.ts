import { Elysia } from "elysia";
import { LikeService } from "./like.service";
import { authPlugin } from "@/plugins/auth.plugin";
import { toggleLikeSchema, getLikeStatusSchema } from "./like.schema";

export const likeRoutes = new Elysia({ prefix: "/likes" })
  .use(authPlugin)

  // 1. POST /likes/:postId — Toggle like/unlike
  .post("/:postId", async ({ params: { postId }, getCurrentUser, set }) => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        set.status = 401;
        return { message: "Unauthorized" };
      }

      const { liked, likeCount } = await LikeService.toggleLike(user.id, postId);
      return {
        message: liked ? "Like berhasil" : "Unlike berhasil",
        liked,
        likeCount,
      };
    } catch (error: any) {
      console.error("❌ Gagal toggle like:", error);
      if (error.message === "Postingan tidak ditemukan") {
        set.status = 404;
      } else {
        set.status = 500;
      }
      return { message: error.message || "Terjadi kesalahan server" };
    }
  }, toggleLikeSchema)

  // 2. GET /likes/:postId/status — Cek status & jumlah like
  .get("/:postId/status", async ({ params: { postId }, getCurrentUser, set }) => {
    try {
      const user = await getCurrentUser();
      const userId = user?.id;

      const status = await LikeService.getLikeStatus(postId, userId);
      return status;
    } catch (error) {
      console.error("❌ Gagal get like status:", error);
      set.status = 500;
      return { message: "Terjadi kesalahan server" };
    }
  }, getLikeStatusSchema);
