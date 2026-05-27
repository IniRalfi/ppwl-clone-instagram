import { Elysia } from "elysia";
import { db } from "@/db/client";
import { authPlugin } from "@/plugins/auth.plugin";

export const userRoutes = new Elysia({ prefix: "/users" })
  .get("/", async ({ query }) => {
    const { search } = query as { search?: string };

    const users = await db.user.findMany({
      where: search
        ? {
            OR: [
              { username: { contains: search, mode: "insensitive" } },
              { name: { contains: search, mode: "insensitive" } },
            ],
          }
        : undefined,
      select: {
        id: true,
        username: true,
        name: true,
        avatarUrl: true,
        bio: true,
        createdAt: true,
      }
    });

    return { data: users };
  })

  .get("/username/:username", async ({ params: { username }, set }) => {
    const user = await db.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        name: true,
        avatarUrl: true,
        bio: true,
        createdAt: true,
      }
    });

    if (!user) {
      set.status = 404;
      return { message: "User tidak ditemukan" };
    }

    return { data: user };
  })

  .use(authPlugin)
  .put("/profile", async ({ body, getCurrentUser, set }) => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        set.status = 401;
        return { message: "Unauthorized" };
      }

      const { name, bio, avatarUrl } = body as { name?: string; bio?: string; avatarUrl?: string };

      const updatedUser = await db.user.update({
        where: { id: user.id },
        data: {
          name: name ?? undefined,
          bio: bio ?? undefined,
          avatarUrl: avatarUrl ?? undefined,
        },
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
          avatarUrl: true,
          bio: true,
        }
      });

      return {
        message: "Profil berhasil diperbarui",
        data: updatedUser,
      };
    } catch (error) {
      console.error("❌ Gagal mengupdate profil:", error);
      set.status = 500;
      return { message: "Terjadi kesalahan server saat memperbarui profil" };
    }
  });
