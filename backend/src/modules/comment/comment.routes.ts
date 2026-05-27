import { Elysia } from "elysia";
import { db } from "@/db/client";
import { authPlugin } from "@/plugins/auth.plugin";

export const commentRoutes = new Elysia({ prefix: "/comments" })
  .use(authPlugin)
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
  .post("/", async ({ body, getCurrentUser, set }) => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        set.status = 401;
        return { message: "Unauthorized" };
      }
      const { postId, content, parentId } = body as any;
      const authorId = user.id;

      if (!postId?.trim()) {
        set.status = 400;
        return { message: "postId wajib diisi" };
      }

      if (!content?.trim()) {
        set.status = 400;
        return { message: "Komentar tidak boleh kosong" };
      }
      
      const newComment = await db.comment.create({
        data: {
          content,
          postId,
          parentId: parentId || null,
          authorId: authorId,
        },
        include: {
          author: {
            select: { id: true, username: true, name: true, avatarUrl: true }
          }
        }
      });

      // Update commentCount di User
      await db.user.update({
        where: { id: authorId },
        data: { commentCount: { increment: 1 } },
      });
      
      // Ambil data post untuk mengetahui siapa pemiliknya
      const post = await db.post.findUnique({
        where: { id: postId },
        select: { authorId: true }
      });

      // Buat notifikasi jika yang komen bukan yang punya post
      if (post && post.authorId !== authorId) {
        await db.notification.create({
          data: {
            type: "comment",
            message: `${newComment.author?.username || 'Seseorang'} mengomentari postinganmu: "${content.length > 20 ? content.substring(0, 20) + '...' : content}"`,
            receiverId: post.authorId,
            refId: postId,
          }
        });
      }
      
      return newComment;
    } catch (error: any) {
      console.error("Error creating comment:", error);
      set.status = 500;
      return { message: "Gagal menyimpan komentar", error: error?.message || String(error) };
    }
  });
