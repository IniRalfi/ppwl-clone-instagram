import { Elysia } from "elysia";
import { authPlugin } from "@/plugins/auth.plugin";
import { CommentService } from "./comment.service";
import { createCommentSchema } from "./comment.schema";

export const commentRoutes = new Elysia({ prefix: "/comments" })
  .use(authPlugin)
  
  // 1. Ambil semua komentar
  .get("/", async () => {
    const comments = await CommentService.getAllComments();
    return { data: comments };
  })
  
  // 2. Kirim komentar baru
  .post("/", async ({ body, getCurrentUser, set }) => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        set.status = 401;
        return { message: "Unauthorized" };
      }
      
      const { postId, content, parentId } = body;
      const authorId = user.id;

      const newComment = await CommentService.createComment({
        content,
        postId,
        parentId: parentId || null,
        authorId,
      });

      return newComment;
    } catch (error: any) {
      console.error("Error creating comment:", error);
      set.status = 500;
      return { message: "Gagal menyimpan komentar", error: error?.message || String(error) };
    }
  }, createCommentSchema)

  // 3. Toggle like komentar
  .post("/:id/like", async ({ params: { id }, getCurrentUser, set }) => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        set.status = 401;
        return { message: "Unauthorized" };
      }

      const liked = await CommentService.toggleLikeComment(user.id, id);
      return { message: liked ? "Komentar disukai" : "Batal menyukai komentar", liked };
    } catch (error: any) {
      console.error("Error toggling comment like:", error);
      set.status = error.message === "Komentar tidak ditemukan" ? 404 : 500;
      return { message: error?.message || "Terjadi kesalahan server saat menyukai komentar" };
    }
  });
