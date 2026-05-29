import { Elysia } from "elysia";
import { requireAuth } from "@/plugins/require-auth.plugin";
import { CommentService } from "./comment.service";
import { createCommentSchema } from "./comment.schema";
import { commentRateLimit } from "@/middleware/rate-limit.middleware";

export const commentRoutes = new Elysia({ prefix: "/comments" })
  .use(requireAuth)

  // 1. Ambil semua komentar
  .get("/", async () => {
    const comments = await CommentService.getAllComments();
    return { data: comments };
  })

  // 2. Kirim komentar baru
  // 🛡️ Rate limit: 20 comments per jam
  .use(commentRateLimit)
  .post(
    "/",
    async ({ body, requireUser, set }) => {
      try {
        const user = await requireUser();
        if (!user) return;

        const { postId, content, parentId } = body;
        const authorId = user.id;

        const newComment = await CommentService.createComment({
          content,
          postId,
          parentId: parentId || null,
          authorId,
        });

        return { data: newComment };
      } catch (error: any) {
        console.error("Error creating comment:", error);
        set.status = 500;
        return { message: "Gagal menyimpan komentar" };
      }
    },
    createCommentSchema
  )

  // 3. Toggle like komentar
  .post("/:id/like", async ({ params: { id }, requireUser, set }) => {
    try {
      const user = await requireUser();
      if (!user) return;

      const liked = await CommentService.toggleLikeComment(user.id, id);
      return { message: liked ? "Komentar disukai" : "Batal menyukai komentar", liked };
    } catch (error: any) {
      console.error("Error toggling comment like:", error);
      set.status = error.message === "Komentar tidak ditemukan" ? 404 : 500;
      return { message: error?.message || "Terjadi kesalahan server saat menyukai komentar" };
    }
  });
