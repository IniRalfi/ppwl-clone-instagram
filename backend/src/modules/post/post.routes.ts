import { Elysia } from "elysia";
import { db } from "@/db/client";
import {
  uploadImageToCloudinary,
  deleteImageFromCloudinary,
  MAX_FILE_SIZE_BYTES,
  ALLOWED_MIME_TYPES,
} from "@/config/cloudinary";

// Pilih field author yang aman untuk di-return ke frontend
const AUTHOR_SELECT = {
  id: true,
  name: true,
  username: true,
  avatarUrl: true,
} as const;

export const postRoutes = new Elysia({ prefix: "/posts" })

  // ─────────────────────────────────────────────
  // GET /posts — Ambil semua postingan (feed)
  // ─────────────────────────────────────────────
  .get("/", async () => {
    const posts = await db.post.findMany({
      include: {
        author: { select: AUTHOR_SELECT },
        _count: { select: { likes: true, comments: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return { data: posts };
  })

  // ─────────────────────────────────────────────
  // GET /posts/:id — Ambil 1 postingan + komentar
  // ─────────────────────────────────────────────
  .get("/:id", async ({ params: { id }, set }) => {
    const post = await db.post.findUnique({
      where: { id },
      include: {
        author: { select: AUTHOR_SELECT },
        comments: {
          include: { author: { select: { id: true, username: true, name: true, avatarUrl: true } } },
          orderBy: { createdAt: "asc" },
        },
        _count: { select: { likes: true, comments: true } },
      },
    });

    if (!post) {
      set.status = 404;
      return { message: "Post tidak ditemukan" };
    }

    return { data: post };
  })

  // ─────────────────────────────────────────────
  // POST /posts — Buat postingan baru
  // Body: multipart/form-data
  //   - userId: string (wajib)
  //   - content: string (wajib)
  //   - image?: File (opsional, maks 5 MB)
  // ─────────────────────────────────────────────
  .post("/", async ({ body, set }) => {
    try {
      const formData = body as Record<string, any>;
      const userId = formData.userId as string;
      const content = formData.content as string;
      const imageFile = formData.image as File | undefined;

      // Validasi field wajib
      if (!userId || !content?.trim()) {
        set.status = 400;
        return { message: "userId dan content wajib diisi" };
      }

      // Pastikan user ada
      const user = await db.user.findUnique({ where: { id: userId } });
      if (!user) {
        set.status = 404;
        return { message: "User tidak ditemukan" };
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

        // Upload ke Cloudinary
        const arrayBuffer = await imageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        imageUrl = await uploadImageToCloudinary(buffer, imageFile.type);
      }

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
  // Body JSON: { userId: string }
  // ─────────────────────────────────────────────
  .delete("/:id", async ({ params: { id }, body, set }) => {
    try {
      const { userId } = body as { userId: string };

      if (!userId) {
        set.status = 400;
        return { message: "userId wajib diisi" };
      }

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

      // Hapus gambar dari Cloudinary terlebih dahulu (jika ada)
      if (post.imageUrl) {
        await deleteImageFromCloudinary(post.imageUrl);
      }

      // Hapus dari database (cascade akan hapus likes & comments terkait)
      await db.post.delete({ where: { id } });

      return { message: "Postingan berhasil dihapus" };
    } catch (error) {
      console.error("❌ Gagal menghapus post:", error);
      set.status = 500;
      return { message: "Terjadi kesalahan server saat menghapus postingan" };
    }
  });
