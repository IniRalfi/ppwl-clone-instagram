import { Elysia } from "elysia";
import { db } from "@/db/client";

export const commentRoutes = new Elysia({ prefix: "/comments" })
  .get("/", async () => {
    const comments = await db.comment.findMany({
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatarUrl: true,
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });
    
    return { data: comments };
  });
