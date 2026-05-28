import { Elysia } from "elysia";
import { FollowService } from "./follow.service";
import { authPlugin } from "@/plugins/auth.plugin";
import {
  getFollowStatsSchema,
  getFollowersSchema,
  getFollowingSchema,
  getSuggestionsSchema,
  followActionSchema,
  unfollowActionSchema,
} from "./follow.schema";

export const followRoutes = new Elysia({ prefix: "/follow" })
  .use(authPlugin)

  /** GET /follow/stats/:userId?currentUserId=xxx — Jumlah followers & following + status follow */
  .get("/stats/:userId", async ({ params: { userId }, query, getCurrentUser, set }) => {
    try {
      const user = await getCurrentUser();
      const currentUserId = user?.id || query.currentUserId;

      const stats = await FollowService.getFollowStats(userId, currentUserId);
      return stats;
    } catch (error: any) {
      console.error("❌ Gagal mengambil stats follow:", error);
      if (error.message === "User tidak ditemukan") {
        set.status = 404;
      } else {
        set.status = 500;
      }
      return { message: error.message || "Terjadi kesalahan server" };
    }
  }, getFollowStatsSchema)

  /** GET /follow/followers/:userId — Ambil daftar followers dari userId */
  .get("/followers/:userId", async ({ params: { userId }, set }) => {
    try {
      const followers = await FollowService.getFollowers(userId);
      return { data: followers };
    } catch (error) {
      console.error("❌ Gagal mengambil followers:", error);
      set.status = 500;
      return { message: "Terjadi kesalahan server" };
    }
  }, getFollowersSchema)

  /** GET /follow/following/:userId — Ambil daftar following dari userId */
  .get("/following/:userId", async ({ params: { userId }, set }) => {
    try {
      const following = await FollowService.getFollowing(userId);
      return { data: following };
    } catch (error) {
      console.error("❌ Gagal mengambil following:", error);
      set.status = 500;
      return { message: "Terjadi kesalahan server" };
    }
  }, getFollowingSchema)

  /** GET /follow/suggestions?userId=xxx — Ambil 5 user yang belum di-follow */
  .get("/suggestions", async ({ query, getCurrentUser, set }) => {
    try {
      const user = await getCurrentUser();
      const userId = user?.id || query.userId;

      if (!userId) {
        set.status = 400;
        return { message: "userId wajib diisi" };
      }

      const suggestions = await FollowService.getSuggestions(userId);
      return { data: suggestions };
    } catch (error) {
      console.error("❌ Gagal mengambil suggestions:", error);
      set.status = 500;
      return { message: "Terjadi kesalahan server" };
    }
  }, getSuggestionsSchema)

  /** POST /follow — Follow user */
  .post("/", async ({ body, getCurrentUser, set }) => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        set.status = 401;
        return { message: "Unauthorized" };
      }
      const { followerId, followingId } = body;

      if (followerId !== user.id) {
        set.status = 403;
        return { message: "Forbidden: You cannot follow on behalf of another user" };
      }

      await FollowService.followUser(followerId, followingId);
      return { message: "Berhasil follow" };
    } catch (error: any) {
      console.error("❌ Gagal follow:", error);
      if (error.message === "Tidak bisa follow diri sendiri") {
        set.status = 400;
      } else if (error.message === "Sudah di-follow") {
        set.status = 409;
      } else {
        set.status = 500;
      }
      return { message: error.message || "Terjadi kesalahan server" };
    }
  }, followActionSchema)

  /** DELETE /follow — Unfollow user */
  .delete("/", async ({ body, getCurrentUser, set }) => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        set.status = 401;
        return { message: "Unauthorized" };
      }
      const { followerId, followingId } = body;

      if (followerId !== user.id) {
        set.status = 403;
        return { message: "Forbidden: You cannot unfollow on behalf of another user" };
      }

      await FollowService.unfollowUser(followerId, followingId);
      return { message: "Berhasil unfollow" };
    } catch (error: any) {
      console.error("❌ Gagal unfollow:", error);
      if (error.message === "Belum di-follow") {
        set.status = 404;
      } else {
        set.status = 500;
      }
      return { message: error.message || "Terjadi kesalahan server" };
    }
  }, unfollowActionSchema);
