import { Elysia } from "elysia";
import { NotificationService } from "./notification.service";
import { authPlugin } from "@/plugins/auth.plugin";
import { isPusherEnabled, pusher } from "@/config/pusher";

export const notificationRoutes = new Elysia({ prefix: "/notifications" })
  .use(authPlugin)
  .get("/", async ({ getCurrentUser, set }) => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        set.status = 401;
        return { message: "Unauthorized" };
      }
      const notifications = await NotificationService.getNotificationsForUser(user.id);
      return { data: notifications };
    } catch (error) {
      console.error("❌ Gagal mengambil notifications:", error);
      set.status = 500;
      return { message: "Terjadi kesalahan server" };
    }
  })
  .get("/unread-count", async ({ getCurrentUser, set }) => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        set.status = 401;
        return { message: "Unauthorized" };
      }

      const count = await NotificationService.getUnreadCount(user.id);
      return { count };
    } catch (error) {
      console.error("❌ Gagal mengambil jumlah notification:", error);
      set.status = 500;
      return { message: "Terjadi kesalahan server" };
    }
  })
  .post("/subscribe", async ({ body, headers, getCurrentUser, set }) => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        set.status = 401;
        return { message: "Unauthorized" };
      }

      await NotificationService.savePushSubscription(
        user.id,
        body as any,
        headers["user-agent"]
      );

      return { message: "Push subscription berhasil disimpan" };
    } catch (error: any) {
      console.error("❌ Gagal menyimpan push subscription:", error);
      set.status = error.message === "Push subscription tidak valid" ? 400 : 500;
      return { message: error.message || "Terjadi kesalahan server" };
    }
  })
  .delete("/subscribe", async ({ body, getCurrentUser, set }) => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        set.status = 401;
        return { message: "Unauthorized" };
      }

      const endpoint = (body as { endpoint?: string } | undefined)?.endpoint;
      if (!endpoint) {
        set.status = 400;
        return { message: "Endpoint wajib diisi" };
      }

      await NotificationService.deletePushSubscription(user.id, endpoint);
      return { message: "Push subscription berhasil dihapus" };
    } catch (error) {
      console.error("❌ Gagal menghapus push subscription:", error);
      set.status = 500;
      return { message: "Terjadi kesalahan server" };
    }
  })
  .post("/pusher/auth", async ({ body, getCurrentUser, set }) => {
    const user = await getCurrentUser();
    if (!user) {
      set.status = 401;
      return { message: "Unauthorized" };
    }

    if (!isPusherEnabled || !pusher) {
      set.status = 503;
      return { message: "Pusher belum dikonfigurasi" };
    }

    const { socket_id, channel_name } = body as { socket_id?: string; channel_name?: string };
    if (!socket_id || channel_name !== `private-user-${user.id}`) {
      set.status = 403;
      return { message: "Channel tidak valid" };
    }

    return pusher.authorizeChannel(socket_id, channel_name);
  });
