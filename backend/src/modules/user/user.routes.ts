import { Elysia } from "elysia";
import { db } from "@/db/client";

export const userRoutes = new Elysia({ prefix: "/users" })
  .get("/", async () => {
    
    const users = await db.user.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        avatarUrl: true,
        bio: true,
        createdAt: true,
      }
    });
    
    return { data: users };
  });
