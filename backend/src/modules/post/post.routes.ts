import { Elysia } from "elysia";
import { PostService } from "./post.service";
import { authPlugin } from "@/plugins/auth.plugin";
import { localCache } from "@/utils/cache";
import {
  getPostsSchema,
  getPostByIdSchema,
  createPostSchema,
  deletePostSchema,
  bookmarkPostSchema,
} from "./post.schema";

export const postRoutes = new Elysia({ prefix: "/posts" })
  .use(authPlugin)

  // 1. GET /posts — Ambil semua postingan (feed)
  .get("/", async ({ query, getCurrentUser }) => {
    const user = await getCurrentUser();
    const currentUserId = user?.id;
    const { authorId, limit } = query;
    const take = limit ? parseInt(limit, 10) : 10;

    const cacheKey = `posts:feed:${authorId || "all"}:limit:${take}:user:${currentUserId || "guest"}`;
    const cached = localCache.get<any>(cacheKey);
    if (cached) {
      if (process.env.DEBUG_CACHE === "true") {
        console.log(`✅ Cache HIT: ${cacheKey}`);
      }
      return { data: cached, _cached: true };
    }

    if (process.env.DEBUG_CACHE === "true") {
      console.log(`❌ Cache MISS: ${cacheKey}`);
    }

    const mappedPosts = await PostService.getPosts(currentUserId, authorId, take);
    localCache.set(cacheKey, mappedPosts, 15000); // cache 15 detik

    return { data: mappedPosts };
  }, getPostsSchema)

  // 2. GET /posts/saved — Mengambil postingan yang di-bookmark oleh user aktif
  .get("/saved", async ({ getCurrentUser, set }) => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        set.status = 401;
        return { message: "Unauthorized" };
      }
      const mappedPosts = await PostService.getSavedPosts(user.id);
      return { data: mappedPosts };
    } catch (error) {
      console.error("❌ Gagal mengambil saved posts:", error);
      set.status = 500;
      return { message: "Terjadi kesalahan server" };
    }
  })

  // 3. GET /posts/:id — Ambil 1 postingan + komentar
  .get("/:id", async ({ params: { id }, getCurrentUser, set }) => {
    const user = await getCurrentUser();
    const currentUserId = user?.id;

    const cacheKey = `posts:single:${id}:user:${currentUserId || "guest"}`;
    const cached = localCache.get<any>(cacheKey);
    if (cached) {
      if (process.env.DEBUG_CACHE === "true") {
        console.log(`✅ Cache HIT: ${cacheKey}`);
      }
      return { data: cached, _cached: true };
    }

    if (process.env.DEBUG_CACHE === "true") {
      console.log(`❌ Cache MISS: ${cacheKey}`);
    }

    const mappedPost = await PostService.getPostById(id, currentUserId);
    if (!mappedPost) {
      set.status = 404;
      return { message: "Post tidak ditemukan" };
    }

    localCache.set(cacheKey, mappedPost, 10000); // cache 10 detik

    return { data: mappedPost };
  }, getPostByIdSchema)

  // 4. POST /posts — Buat postingan baru (multipart/form-data)
  .post("/", async ({ body, getCurrentUser, set }) => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        set.status = 401;
        return { message: "Unauthorized" };
      }

      const formData = body as Record<string, any>;
      const content = formData.content as string;
      const imageFile = formData.image as File | undefined;

      const post = await PostService.createPost(user.id, content, imageFile);
      return { message: "Postingan berhasil dibuat", data: post };
    } catch (error: any) {
      console.error("❌ Gagal membuat post:", error);
      set.status = error.message?.includes("Format") || error.message?.includes("Ukuran") ? 400 : 500;
      return { message: error.message || "Terjadi kesalahan server saat membuat postingan" };
    }
  }, createPostSchema)

  // 5. DELETE /posts/:id — Hapus postingan
  .delete("/:id", async ({ params: { id }, getCurrentUser, set }) => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        set.status = 401;
        return { message: "Unauthorized" };
      }

      await PostService.deletePost(user.id, id);
      return { message: "Postingan berhasil dihapus" };
    } catch (error: any) {
      console.error("❌ Gagal menghapus post:", error);
      if (error.message === "Postingan tidak ditemukan") {
        set.status = 404;
      } else if (error.message === "Kamu tidak memiliki akses untuk menghapus postingan ini") {
        set.status = 403;
      } else {
        set.status = 500;
      }
      return { message: error.message || "Terjadi kesalahan server saat menghapus postingan" };
    }
  }, deletePostSchema)

  // 6. POST /posts/:id/bookmark — Toggle simpan postingan
  .post("/:id/bookmark", async ({ params: { id }, getCurrentUser, set }) => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        set.status = 401;
        return { message: "Unauthorized" };
      }

      const bookmarked = await PostService.toggleBookmark(user.id, id);
      return {
        message: bookmarked ? "Postingan berhasil disimpan" : "Batal menyimpan postingan",
        bookmarked,
      };
    } catch (error: any) {
      console.error("❌ Gagal toggle bookmark:", error);
      set.status = error.message === "Postingan tidak ditemukan" ? 404 : 500;
      return { message: error.message || "Terjadi kesalahan server" };
    }
  }, bookmarkPostSchema)

  // 7. PUT /posts/:id — Edit caption postingan
  .put("/:id", async ({ params: { id }, body, getCurrentUser, set }) => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        set.status = 401;
        return { message: "Unauthorized" };
      }
      const { content } = body as { content: string };
      const updatedPost = await PostService.updatePost(user.id, id, content);
      return { message: "Postingan berhasil diperbarui", data: updatedPost };
    } catch (error: any) {
      console.error("❌ Gagal mengedit post:", error);
      if (error.message === "Postingan tidak ditemukan") {
        set.status = 404;
      } else if (error.message === "Kamu tidak memiliki akses untuk mengedit postingan ini") {
        set.status = 403;
      } else {
        set.status = 500;
      }
      return { message: error.message || "Terjadi kesalahan server saat mengedit postingan" };
    }
  });
