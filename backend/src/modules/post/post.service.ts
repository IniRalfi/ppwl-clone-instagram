import { db } from "@/db/client";
import { localCache } from "@/utils/cache";
import { uploadMedia, deleteMedia } from "@/config/s3";
import { MAX_FILE_SIZE_BYTES, ALLOWED_MIME_TYPES } from "@/config/cloudinary";

export const AUTHOR_SELECT = {
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
    },
  },
} as const;

export class PostService {
  // 1. Ambil list postingan (feed)
  static async getPosts(currentUserId?: string, authorId?: string, take = 10) {
    const posts = await db.post.findMany({
      where: authorId ? { authorId } : undefined,
      take,
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

    return posts.map((post) => {
      const { likes, bookmarks, ...rest } = post as any;
      return {
        ...rest,
        isLikedByMe: likes && likes.length > 0,
        isBookmarkedByMe: bookmarks && bookmarks.length > 0,
      };
    });
  }

  // 2. Ambil postingan tersimpan (bookmark) milik user aktif
  static async getSavedPosts(userId: string) {
    const savedBookmarked = await db.bookmark.findMany({
      where: { userId },
      include: {
        post: {
          include: {
            author: { select: AUTHOR_SELECT },
            _count: { select: { likes: true, comments: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return savedBookmarked.map((b) => {
      return {
        ...b.post,
        isBookmarkedByMe: true,
      };
    });
  }

  // 3. Ambil detail postingan tunggal
  static async getPostById(postId: string, currentUserId?: string) {
    const post = await db.post.findUnique({
      where: { id: postId },
      include: {
        author: { select: AUTHOR_SELECT },
        comments: {
          take: 16,
          include: {
            author: { select: { id: true, username: true, name: true, avatarUrl: true } },
            likes: currentUserId
              ? {
                  where: { userId: currentUserId },
                  select: { userId: true },
                }
              : false,
            _count: { select: { likes: true } },
          },
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

    if (!post) return null;

    const { likes, bookmarks, comments, ...rest } = post as any;
    let commentsNextCursor: string | null = null;
    let mappedComments = (comments || []).map((c: any) => {
      const { likes: commentLikes, _count, ...cRest } = c;
      return {
        ...cRest,
        likesCount: _count?.likes ?? 0,
        isLikedByMe: commentLikes && commentLikes.length > 0,
      };
    });

    if (mappedComments.length > 15) {
      const nextItem = mappedComments.pop();
      commentsNextCursor = nextItem.id;
    }

    return {
      ...rest,
      comments: mappedComments,
      commentsNextCursor,
      isLikedByMe: likes && likes.length > 0,
      isBookmarkedByMe: bookmarks && bookmarks.length > 0,
    };
  }

  // Ambal komentar bertahap berbasis kursor
  static async getPostComments(postId: string, currentUserId?: string, cursor?: string, limit = 15) {
    const queryOptions: any = {
      where: { postId },
      take: limit + 1,
      orderBy: { createdAt: "asc" },
      include: {
        author: { select: { id: true, username: true, name: true, avatarUrl: true } },
        likes: currentUserId
          ? {
              where: { userId: currentUserId },
              select: { userId: true },
            }
          : false,
        _count: { select: { likes: true } },
      },
    };

    if (cursor) {
      queryOptions.cursor = { id: cursor };
      queryOptions.skip = 1;
    }

    const comments = await db.comment.findMany(queryOptions);

    let nextCursor: string | null = null;
    if (comments.length > limit) {
      const nextItem = comments.pop();
      nextCursor = nextItem?.id ?? null;
    }

    const mappedComments = comments.map((c: any) => {
      const { likes: commentLikes, _count, ...cRest } = c;
      return {
        ...cRest,
        likesCount: _count?.likes ?? 0,
        isLikedByMe: commentLikes && commentLikes.length > 0,
      };
    });

    return {
      comments: mappedComments,
      nextCursor,
    };
  }

  // 4. Buat postingan baru
  static async createPost(userId: string, content: string, imageFile?: File) {
    let imageUrl: string | null = null;

    // Proses upload gambar jika ada
    if (imageFile && imageFile.size > 0) {
      if (!ALLOWED_MIME_TYPES.includes(imageFile.type)) {
        throw new Error(`Format gambar tidak didukung. Gunakan: ${ALLOWED_MIME_TYPES.join(", ")}`);
      }

      if (imageFile.size > MAX_FILE_SIZE_BYTES) {
        throw new Error(`Ukuran gambar maksimal 5 MB. Ukuran saat ini: ${(imageFile.size / 1024 / 1024).toFixed(2)} MB`);
      }

      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      imageUrl = await uploadMedia(buffer, imageFile.type);
    }

    // Inkrementasi jumlah postingan user
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

    // Invalidate feed cache
    localCache.deletePattern("posts:feed:");

    return post;
  }

  // 5. Hapus postingan
  static async deletePost(userId: string, postId: string) {
    const post = await db.post.findUnique({ where: { id: postId } });

    if (!post) {
      throw new Error("Postingan tidak ditemukan");
    }

    if (post.authorId !== userId) {
      throw new Error("Kamu tidak memiliki akses untuk menghapus postingan ini");
    }

    if (post.imageUrl) {
      await deleteMedia(post.imageUrl);
    }

    await db.post.delete({ where: { id: postId } });

    // Dekrementasi jumlah postingan user
    await db.user.update({
      where: { id: userId },
      data: { postCount: { decrement: 1 } },
    });

    // Invalidate feed cache
    localCache.deletePattern("posts:feed:");
  }

  // 6. Toggle bookmark postingan
  static async toggleBookmark(userId: string, postId: string) {
    const post = await db.post.findUnique({ where: { id: postId } });
    if (!post) {
      throw new Error("Postingan tidak ditemukan");
    }

    const existingBookmark = await db.bookmark.findUnique({
      where: {
        userId_postId: { userId, postId },
      },
    });

    let bookmarked = false;
    if (existingBookmark) {
      await db.bookmark.delete({
        where: {
          userId_postId: { userId, postId },
        },
      });
    } else {
      await db.bookmark.create({
        data: { userId, postId },
      });
      bookmarked = true;
    }

    // Invalidate feed cache
    localCache.deletePattern("posts:feed:");

    return bookmarked;
  }

  // 7. Update postingan (Edit Caption)
  static async updatePost(userId: string, postId: string, content: string) {
    const post = await db.post.findUnique({ where: { id: postId } });
    if (!post) {
      throw new Error("Postingan tidak ditemukan");
    }
    if (post.authorId !== userId) {
      throw new Error("Kamu tidak memiliki akses untuk mengedit postingan ini");
    }
    const updated = await db.post.update({
      where: { id: postId },
      data: { content: content.trim() },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            avatarUrl: true,
          }
        },
        _count: { select: { likes: true, comments: true } },
      },
    });

    // Invalidate feed cache
    localCache.deletePattern("posts:feed:");
    localCache.deletePattern("posts:single:");

    return updated;
  }
}
