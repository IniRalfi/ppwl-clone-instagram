import { Elysia } from "elysia";
import { db } from "@/db/client";
import {
  MAX_FILE_SIZE_BYTES,
  ALLOWED_MIME_TYPES,
} from "@/config/cloudinary";
import { uploadMedia, deleteMedia } from "@/config/s3";
import { authPlugin } from "@/plugins/auth.plugin";

// Pilih field author yang aman untuk di-return ke frontend
const AUTHOR_SELECT = {
  id: true,
  name: true,
  username: true,
  avatarUrl: true,
  bio: true,
  postCount: true,
  _count: {
    select: {
      followers: true,
      following: true,
    }
  }
} as const;

export const postRoutes = new Elysia({ prefix: "/posts" })
  .use(authPlugin)

  // ─────────────────────────────────────────────
  // GET /posts — Ambil semua postingan (feed)
  // ─────────────────────────────────────────────
  .get("/", async ({ query, getCurrentUser }) => {
    const user = await getCurrentUser();
    const currentUserId = user?.id;
    const { authorId } = query as { authorId?: string };

    const posts = await db.post.findMany({
      where: authorId ? { authorId } : undefined,
      include: {
        author: { select: AUTHOR_SELECT },
        likes: currentUserId
          ? {
              where: { userId: currentUserId },
              select: { userId: true },
            }
          : false,
        bookmarks: currentUserId
          ? {
              where: { userId: currentUserId },
              select: { userId: true },
            }
          : false,
        _count: { select: { likes: true, comments: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const mappedPosts = posts.map((post) => {
      const { likes, bookmarks, ...rest } = post as any;
      return {
        ...rest,
        isLikedByMe: likes && likes.length > 0,
        isBookmarkedByMe: bookmarks && bookmarks.length > 0,
      };
    });

    return { data: mappedPosts };
  })

  // ─────────────────────────────────────────────
  // GET /posts/saved — Mengambil postingan yang di-bookmark oleh user aktif
  // ─────────────────────────────────────────────
  .get("/saved", async ({ getCurrentUser, set }) => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        set.status = 401;
        return { message: "Unauthorized" };
      }
      const userId = user.id;

      const savedBookmarked = await db.bookmark.findMany({
        where: { userId },
        include: {
          post: {
            include: {
              author: { select: AUTHOR_SELECT },
              _count: { select: { likes: true, comments: true } }
            }
          }
        },
        orderBy: { createdAt: "desc" }
      });

      const mappedPosts = savedBookmarked.map((b) => {
        return {
          ...b.post,
          isBookmarkedByMe: true,
        };
      });

      return { data: mappedPosts };
    } catch (error) {
      console.error("❌ Gagal mengambil saved posts:", error);
      set.status = 500;
      return { message: "Terjadi kesalahan server" };
    }
  })

  // ─────────────────────────────────────────────
  // GET /posts/:id — Ambil 1 postingan + komentar
  // ─────────────────────────────────────────────
  .get("/:id", async ({ params: { id }, getCurrentUser, set }) => {
    const user = await getCurrentUser();
    const currentUserId = user?.id;

    const post = await db.post.findUnique({
      where: { id },
      include: {
        author: { select: AUTHOR_SELECT },
        comments: {
          include: { author: { select: { id: true, username: true, name: true, avatarUrl: true } } },
          orderBy: { createdAt: "asc" },
        },
        likes: currentUserId
          ? {
              where: { userId: currentUserId },
              select: { userId: true },
            }
          : false,
        bookmarks: currentUserId
          ? {
              where: { userId: currentUserId },
              select: { userId: true },
            }
          : false,
        _count: { select: { likes: true, comments: true } },
      },
    });

    if (!post) {
      set.status = 404;
      return { message: "Post tidak ditemukan" };
    }

    const { likes, bookmarks, ...rest } = post as any;
    const mappedPost = {
      ...rest,
      isLikedByMe: likes && likes.length > 0,
      isBookmarkedByMe: bookmarks && bookmarks.length > 0,
    };

    return { data: mappedPost };
  })

  // ─────────────────────────────────────────────
  // POST /posts — Buat postingan baru
  // Body: multipart/form-data
  //   - content: string (wajib)
  //   - image?: File (opsional, maks 5 MB)
  // ─────────────────────────────────────────────
  .post("/", async ({ body, getCurrentUser, set }) => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        set.status = 401;
        return { message: "Unauthorized" };
      }
      const userId = user.id;

      const formData = body as Record<string, any>;
      const content = formData.content as string;
      const imageFile = formData.image as File | undefined;

      // Validasi field wajib
      if (!content?.trim()) {
        set.status = 400;
        return { message: "content wajib diisi" };
      }

      let imageUrl: string | null = null;

      // Proses upload gambar jika ada
      if (imageFile && imageFile.size > 0) {
        // Validasi tipe file
        if (!ALLOWED_MIME_TYPES.includes(imageFile.type)) {
          set.status = 400;
          return {
            message: `Format gambar tidak didukung. Gunakan: ${ALLOWED_MIME_TYPES.join(", ")}`,
          };
        }

        // Validasi ukuran file (maks 5 MB)
        if (imageFile.size > MAX_FILE_SIZE_BYTES) {
          set.status = 400;
          return {
            message: `Ukuran gambar maksimal 5 MB. Ukuran saat ini: ${(imageFile.size / 1024 / 1024).toFixed(2)} MB`,
          };
        }

        // Upload menggunakan S3 Media Service (S3 + Cloudinary Fallback)
        const arrayBuffer = await imageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        imageUrl = await uploadMedia(buffer, imageFile.type);
      }

      // Update postCount di User terlebih dahulu agar data ter-update ter-return di query post.create
      await db.user.update({
        where: { id: userId },
        data: { postCount: { increment: 1 } },
      });

      // Simpan ke database
      const post = await db.post.create({
        data: {
          content: content.trim(),
          imageUrl,
          authorId: userId,
        },
        include: {
          author: { select: AUTHOR_SELECT },
          _count: { select: { likes: true, comments: true } },
        },
      });

      return { message: "Postingan berhasil dibuat", data: post };
    } catch (error) {
      console.error("❌ Gagal membuat post:", error);
      set.status = 500;
      return { message: "Terjadi kesalahan server saat membuat postingan" };
    }
  })

  // ─────────────────────────────────────────────
  // DELETE /posts/:id — Hapus postingan
  // ─────────────────────────────────────────────
  .delete("/:id", async ({ params: { id }, getCurrentUser, set }) => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        set.status = 401;
        return { message: "Unauthorized" };
      }
      const userId = user.id;

      // Cek postingan ada dan milik user ini
      const post = await db.post.findUnique({ where: { id } });

      if (!post) {
        set.status = 404;
        return { message: "Postingan tidak ditemukan" };
      }

      if (post.authorId !== userId) {
        set.status = 403;
        return { message: "Kamu tidak memiliki akses untuk menghapus postingan ini" };
      }

      // Hapus gambar menggunakan S3 Media Service
      if (post.imageUrl) {
        await deleteMedia(post.imageUrl);
      }

      // Hapus dari database (cascade akan hapus likes & comments terkait)
      await db.post.delete({ where: { id } });

      // Update postCount di User
      await db.user.update({
        where: { id: userId },
        data: { postCount: { decrement: 1 } },
      });

      return { message: "Postingan berhasil dihapus" };
    } catch (error) {
      console.error("❌ Gagal menghapus post:", error);
      set.status = 500;
      return { message: "Terjadi kesalahan server saat menghapus postingan" };
    }
  })

  // ─────────────────────────────────────────────
  // POST /posts/:id/bookmark — Toggle simpan postingan
  // ─────────────────────────────────────────────
  .post("/:id/bookmark", async ({ params: { id }, getCurrentUser, set }) => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        set.status = 401;
        return { message: "Unauthorized" };
      }
      const userId = user.id;

      const post = await db.post.findUnique({ where: { id } });
      if (!post) {
        set.status = 404;
        return { message: "Postingan tidak ditemukan" };
      }

      const existingBookmark = await db.bookmark.findUnique({
        where: {
          userId_postId: { userId, postId: id }
        }
      });

      if (existingBookmark) {
        await db.bookmark.delete({
          where: {
            userId_postId: { userId, postId: id }
          }
        });
        return { message: "Batal menyimpan postingan", bookmarked: false };
      } else {
        await db.bookmark.create({
          data: { userId, postId: id }
        });
        return { message: "Postingan berhasil disimpan", bookmarked: true };
      }
    } catch (error) {
      console.error("❌ Gagal toggle bookmark:", error);
      set.status = 500;
      return { message: "Terjadi kesalahan server" };
    }
  });
