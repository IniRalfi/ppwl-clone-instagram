import { db } from "@/db/client";
import { uploadMedia } from "@/config/s3";
import { MAX_FILE_SIZE_BYTES, ALLOWED_MIME_TYPES } from "@/config/cloudinary";

export class StoryService {
  // 1. Ambil cerita aktif (belum kadaluwarsa) dari diri sendiri & teman yang diikuti
  static async getActiveStories(currentUserId: string) {
    const now = new Date();

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
          hasUnread: true,
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

    // Cerita sendiri ditaruh di depan
    const currentUserGroupIdx = groups.findIndex(g => g.userId === currentUserId);
    if (currentUserGroupIdx > 0) {
      const [currentUserGroup] = groups.splice(currentUserGroupIdx, 1);
      groups.unshift(currentUserGroup);
    }

    return groups;
  }

  // 2. Buat cerita baru (upload gambar + simpan)
  static async createStory(userId: string, imageFile: File) {
    if (!imageFile || imageFile.size === 0) {
      throw new Error("File gambar wajib diunggah");
    }

    if (!ALLOWED_MIME_TYPES.includes(imageFile.type)) {
      throw new Error(`Format gambar tidak didukung. Gunakan: ${ALLOWED_MIME_TYPES.join(", ")}`);
    }

    if (imageFile.size > MAX_FILE_SIZE_BYTES) {
      throw new Error("Ukuran gambar maksimal 5 MB");
    }

    const buffer = Buffer.from(await imageFile.arrayBuffer());
    const imageUrl = await uploadMedia(buffer, imageFile.type);

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Kadaluwarsa 24 jam

    return await db.story.create({
      data: {
        imageUrl,
        userId,
        expiresAt,
      },
    });
  }
}
