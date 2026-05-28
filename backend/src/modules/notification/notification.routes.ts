import { Elysia } from "elysia";
import { NotificationService } from "./notification.service";
import { authPlugin } from "@/plugins/auth.plugin";

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
  });
