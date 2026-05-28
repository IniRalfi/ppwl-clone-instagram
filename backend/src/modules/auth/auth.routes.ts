import { Elysia } from "elysia";
import { authPlugin } from "@/plugins/auth.plugin";
import { AuthService } from "./auth.service";
import { registerSchema, loginSchema, googleSchema } from "./auth.schema";

export const authRoutes = new Elysia({ prefix: "/auth" })
  .use(authPlugin)
  
  // 1. Registrasi Akun
  .post("/register", async ({ body, set }) => {
    try {
      const { name, username, email, password } = body;
      const passwordHash = await Bun.password.hash(password);

      const user = await AuthService.register({
        name,
        username,
        email,
        passwordHash,
      });

      return {
        message: "Registrasi Berhasil",
        data: { id: user.id, name: user.name, email: user.email },
      };
    } catch (error) {
      set.status = 400;
      return { message: "Gagal register, mungkin email/username sudah dipakai", error };
    }
  }, registerSchema)

  // 2. Login Akun (Email/Username)
  .post("/login", async ({ body, set, jwt }) => {
    try {
      const { email, password } = body;

      const user = await AuthService.findUserByEmailOrUsername(email);

      if (
        !user ||
        !user.passwordHash ||
        !(await Bun.password.verify(password, user.passwordHash))
      ) {
        set.status = 401;
        return { message: "Email/Username atau password salah" };
      }

      const accessToken = await jwt.sign({ id: user.id });
      return {
        message: "Login Berhasil",
        data: {
          user: {
            id: user.id,
            name: user.name,
            username: user.username,
            email: user.email,
            avatarUrl: user.avatarUrl,
          },
          accessToken,
        },
      };
    } catch (error) {
      set.status = 500;
      return { message: "Terjadi kesalahan server" };
    }
  }, loginSchema)

  // 3. Login Google OAuth
  .post("/google", async ({ body, set, jwt }) => {
    try {
      const { token } = body;

      // Verifikasi token via Google API Service
      const googleUser = await AuthService.verifyGoogleToken(token);
      const { email, name, picture } = googleUser;

      // Cari atau buat user baru
      const user = await AuthService.findOrCreateGoogleUser({
        email,
        name,
        avatarUrl: picture,
      });

      const accessToken = await jwt.sign({ id: user.id });
      return {
        message: "Login Google Berhasil",
        data: {
          user: {
            id: user.id,
            name: user.name,
            username: user.username,
            email: user.email,
            avatarUrl: user.avatarUrl,
          },
          accessToken,
        },
      };
    } catch (error: any) {
      set.status = 401;
      return { message: error.message || "Kesalahan server saat Login Google" };
    }
  }, googleSchema);
