import { Elysia } from "elysia";
import { UserService } from "./user.service";
import { authPlugin } from "@/plugins/auth.plugin";
import {
  searchUsersSchema,
  getUserByUsernameSchema,
  updateProfileSchema,
} from "./user.schema";

export const userRoutes = new Elysia({ prefix: "/users" })
  // 1. GET /users — Cari pengguna
  .get("/", async ({ query }) => {
    const { search } = query;
    const users = await UserService.searchUsers(search);
    return { data: users };
  }, searchUsersSchema)

  // 2. GET /users/username/:username — Dapatkan profil user berdasarkan username
  .get("/username/:username", async ({ params: { username }, set }) => {
    const user = await UserService.getUserByUsername(username);
    if (!user) {
      set.status = 404;
      return { message: "User tidak ditemukan" };
    }
    return { data: user };
  }, getUserByUsernameSchema)

  .use(authPlugin)
  // 3. PUT /users/profile — Update profil user aktif
  .put("/profile", async ({ body, getCurrentUser, set }) => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        set.status = 401;
        return { message: "Unauthorized" };
      }

      const { name, bio, avatarUrl } = body;

      const updatedUser = await UserService.updateProfile(user.id, { name, bio, avatarUrl });
      return {
        message: "Profil berhasil diperbarui",
        data: updatedUser,
      };
    } catch (error) {
      console.error("❌ Gagal mengupdate profil:", error);
      set.status = 500;
      return { message: "Terjadi kesalahan server saat memperbarui profil" };
    }
  }, updateProfileSchema);
