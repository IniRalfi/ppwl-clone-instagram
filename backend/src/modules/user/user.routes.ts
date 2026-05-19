import { Elysia } from "elysia";
import { db } from "@/db/client";

export const userRoutes = new Elysia({ prefix: "/users" })
  .get("/", async ({ query, set }) => {
    // Membaca key rahasia dari file .env (API_SECRET_KEY)
    if (query.key !== process.env.API_SECRET_KEY) {
      set.status = 401;
      return { message: "Unauthorized: Invalid secret key" };
    }
    
    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        avatarUrl: true,
        bio: true,
        createdAt: true,
      }
    });
    
    return { data: users };
  });
