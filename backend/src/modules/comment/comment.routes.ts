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
  })
  .post("/", async ({ body, set }: any) => {
    try {
      const { postId, content, parentId, authorId } = body;
      
      const newComment = await db.comment.create({
        data: {
          content,
          postId,
          parentId: parentId || null,
          authorId: authorId, // Dikirim dari frontend
        },
        include: {
          author: {
            select: { id: true, username: true, name: true, avatarUrl: true }
          }
        }
      });
      
      return newComment;
    } catch (error) {
      set.status = 500;
      return { message: "Gagal menyimpan komentar" };
    }
  });
