import { Elysia } from "elysia";
import { db } from "@/db/client";

export const notificationRoutes = new Elysia({ prefix: "/notifications" })
  .get("/", async () => {
    // Saat ini ambil semua notifikasi dummy untuk testing
    const notifications = await db.notification.findMany({
      orderBy: {
        createdAt: "desc"
      }
    });
    
    return { data: notifications };
  });
