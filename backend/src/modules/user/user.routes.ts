import { Elysia } from "elysia";
import { UserService } from "./user.service";
import { authPlugin } from "@/plugins/auth.plugin";
import { uploadMedia } from "@/config/s3";
import {
  searchUsersSchema,
  getUserByUsernameSchema,
  updateProfileSchema,
} from "./user.schema";

export const userRoutes = new Elysia({ prefix: "/users" })
  .use(authPlugin)
  // 1. GET /users — Cari pengguna (wajib auth + minimal 2 karakter)
  .get("/", async ({ query, set }) => {
    const { search } = query;
    if (!search || search.trim().length < 2) {
      set.status = 400;
      return { message: "Parameter 'search' wajib diisi minimal 2 karakter." };
    }
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

  // 3. PUT /users/profile — Update profil user aktif
  .put("/profile", async ({ body, getCurrentUser, set }) => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        set.status = 401;
        return { message: "Unauthorized" };
      }

      const { username, name, bio, avatarUrl, image, website, gender, showThreads, suggestions } = body;

      if (username) {
        const sanitizedUsername = username.trim().toLowerCase();
        if (sanitizedUsername !== user.username) {
          if (!/^[a-z0-9._]+$/.test(sanitizedUsername)) {
            set.status = 400;
            return { message: "Username hanya boleh mengandung huruf kecil, angka, titik, dan garis bawah." };
          }
          const existing = await UserService.getUserByUsername(sanitizedUsername);
          if (existing) {
            set.status = 400;
            return { message: "Username sudah digunakan oleh akun lain." };
          }
        }
      }

      let finalAvatarUrl = avatarUrl;

      if (image && image.size > 0) {
        const buffer = Buffer.from(await image.arrayBuffer());
        finalAvatarUrl = await uploadMedia(buffer, image.type);
      }

      const parsedShowThreads = showThreads === "true" || showThreads === true;
      const parsedSuggestions = suggestions === "true" || suggestions === true;

      const updatedUser = await UserService.updateProfile(user.id, {
        username: username ? username.trim().toLowerCase() : undefined,
        name,
        bio,
        avatarUrl: finalAvatarUrl,
        website,
        gender,
        showThreads: parsedShowThreads,
        suggestions: parsedSuggestions,
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
  }, updateProfileSchema);
