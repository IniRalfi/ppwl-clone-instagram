import { Elysia } from "elysia";
import { db } from "@/db/client";

export const postRoutes = new Elysia({ prefix: "/posts" })
  .get("/", async () => {
    const posts = await db.post.findMany({
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatarUrl: true,
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });
    
    return { data: posts };
  });
