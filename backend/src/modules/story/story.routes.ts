import { Elysia } from "elysia";
import { db } from "@/db/client";
import {
  uploadImageToCloudinary,
  MAX_FILE_SIZE_BYTES,
  ALLOWED_MIME_TYPES,
} from "@/config/cloudinary";
import { authPlugin } from "@/plugins/auth.plugin";

export const storyRoutes = new Elysia({ prefix: "/stories" })
  .use(authPlugin)

  // ─────────────────────────────────────────────
  // GET /stories — Mengambil cerita aktif dari diri sendiri & teman yang diikuti
  // ─────────────────────────────────────────────
  .get("/", async ({ getCurrentUser, set }) => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        set.status = 401;
        return { message: "Unauthorized" };
      }
      const currentUserId = user.id;
      const now = new Date();

      // Ambil cerita yang belum kadaluwarsa dari diri sendiri OR user yang di-follow
      const activeStories = await db.story.findMany({
        where: {
          expiresAt: { gt: now },
          OR: [
            { userId: currentUserId },
            {
              user: {
                followers: {
                  some: { followerId: currentUserId }
                }
              }
            }
          ]
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              name: true,
              avatarUrl: true,
            }
          }
        },
        orderBy: { createdAt: "asc" }
      });

      // Kelompokkan cerita berdasarkan User (UserStoryGroup)
      const userGroupsMap = new Map<string, {
        userId: string;
        username: string;
        avatarUrl: string;
        hasUnread: boolean;
        stories: {
          id: string;
          imageUrl: string;
          createdAt: string;
        }[];
      }>();

      for (const story of activeStories) {
        const author = story.user;
        if (!userGroupsMap.has(author.id)) {
          userGroupsMap.set(author.id, {
            userId: author.id,
            username: author.username,
            avatarUrl: author.avatarUrl || `https://ui-avatars.com/api/?name=${author.name}`,
            hasUnread: true, // Default true untuk menyederhanakan indikator unread
            stories: []
          });
        }
        userGroupsMap.get(author.id)!.stories.push({
          id: story.id,
          imageUrl: story.imageUrl,
          createdAt: story.createdAt.toISOString()
        });
      }

      const groups = Array.from(userGroupsMap.values());
      
      // Pastikan cerita milik sendiri selalu muncul paling depan (indeks 0) jika ada
      const currentUserGroupIdx = groups.findIndex(g => g.userId === currentUserId);
      if (currentUserGroupIdx > 0) {
        const [currentUserGroup] = groups.splice(currentUserGroupIdx, 1);
        groups.unshift(currentUserGroup);
      }

      return { data: groups };
    } catch (error) {
      console.error("❌ Gagal mengambil stories:", error);
      set.status = 500;
      return { message: "Terjadi kesalahan server" };
    }
  })

  // ─────────────────────────────────────────────
  // POST /stories — Mengunggah cerita baru
  // Body: multipart/form-data
  //   - image: File (wajib, max 5 MB)
  // ─────────────────────────────────────────────
  .post("/", async ({ body, getCurrentUser, set }) => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        set.status = 401;
        return { message: "Unauthorized" };
      }

      const formData = body as Record<string, any>;
      const imageFile = formData.image as File | undefined;

      if (!imageFile || imageFile.size === 0) {
        set.status = 400;
        return { message: "File gambar wajib diunggah" };
      }

      if (!ALLOWED_MIME_TYPES.includes(imageFile.type)) {
        set.status = 400;
        return {
          message: `Format gambar tidak didukung. Gunakan: ${ALLOWED_MIME_TYPES.join(", ")}`,
        };
      }

      if (imageFile.size > MAX_FILE_SIZE_BYTES) {
        set.status = 400;
        return { message: "Ukuran gambar maksimal 5 MB" };
      }

      // Convert File ke Buffer untuk upload ke Cloudinary
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const imageUrl = await uploadImageToCloudinary(buffer, imageFile.type);

      const now = new Date();
      const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Kadaluwarsa dalam 24 jam

      const newStory = await db.story.create({
        data: {
          imageUrl,
          userId: user.id,
          expiresAt,
        },
      });

      return {
        message: "Story berhasil diunggah! 🎉",
        data: newStory,
      };
    } catch (error) {
      console.error("❌ Gagal membuat story:", error);
      set.status = 500;
      return { message: "Terjadi kesalahan server" };
    }
  });
