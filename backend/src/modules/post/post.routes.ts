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
  })
  .get("/:id", async ({ params: { id }, set }) => {
    const post = await db.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatarUrl: true,
          }
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
                name: true,
                avatarUrl: true,
              }
            }
          },
          orderBy: {
            createdAt: "asc"
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          }
        }
      }
    });

    if (!post) {
      set.status = 404;
      return { message: "Post not found" };
    }

    return { data: post };
  });
