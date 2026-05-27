import { Elysia } from "elysia";
import { db } from "@/db/client";
import { authPlugin } from "@/plugins/auth.plugin";

export const notificationRoutes = new Elysia({ prefix: "/notifications" })
  .use(authPlugin)
  .get("/", async ({ getCurrentUser, set }) => {
    const user = await getCurrentUser();
    if (!user) {
      set.status = 401;
      return { message: "Unauthorized" };
    }
    const notifications = await db.notification.findMany({
      where: {
        receiverId: user.id
      },
      orderBy: {
        createdAt: "desc"
      }
    });
    
    return { data: notifications };
  });
