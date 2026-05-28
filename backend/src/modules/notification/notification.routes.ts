import { Elysia } from "elysia";
import { NotificationService } from "./notification.service";
import { requireAuth } from "@/plugins/require-auth.plugin";
import { isPusherEnabled, pusher } from "@/config/pusher";

export const notificationRoutes = new Elysia({ prefix: "/notifications" })
  .use(requireAuth)
  .get("/", async ({ requireUser, set }) => {
    try {
      const user = await requireUser();
      if (!user) return;
      const notifications = await NotificationService.getNotificationsForUser(user.id);
      return { data: notifications };
    } catch (error) {
      console.error("❌ Gagal mengambil notifications:", error);
      set.status = 500;
      return { message: "Terjadi kesalahan server" };
    }
  })
  .get("/unread-count", async ({ requireUser, set }) => {
    try {
      const user = await requireUser();
      if (!user) return;

      const count = await NotificationService.getUnreadCount(user.id);
      return { count };
    } catch (error) {
      console.error("❌ Gagal mengambil jumlah notification:", error);
      set.status = 500;
      return { message: "Terjadi kesalahan server" };
    }
  })
  .post("/subscribe", async ({ body, headers, requireUser, set }) => {
    try {
      const user = await requireUser();
      if (!user) return;

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
  .delete("/subscribe", async ({ body, requireUser, set }) => {
    try {
      const user = await requireUser();
      if (!user) return;

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
  .post("/pusher/auth", async ({ body, requireUser, set }) => {
    const user = await requireUser();
    if (!user) return;

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
