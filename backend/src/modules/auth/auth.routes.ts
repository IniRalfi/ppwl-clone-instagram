import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { env } from "@/config/env";
import bcrypt from "bcryptjs";
import { AuthService } from "./auth.service";
import { registerSchema, loginSchema, googleSchema } from "./auth.schema";
import { authRateLimit } from "@/middleware/rate-limit.middleware";
import { PasswordValidator } from "@/utils/password-validator"; // ✅ ADDED

export const authRoutes = new Elysia({ prefix: "/auth" })
  // Auth routes adalah PUBLIC endpoint (login/register tidak butuh token)
  // Hanya perlu jwt plugin untuk jwt.sign() saat login berhasil
  .use(jwt({ name: "jwt", secret: env.JWT_SECRET, exp: "7d" }))

  // 1. Registrasi Akun (Tanpa Rate Limit)
  .post(
    "/register",
    async ({ body, set }) => {
      try {
        const { name, username, email, password } = body;

        // ✅ Validate password strength
        const passwordValidation = PasswordValidator.validate(password);
        if (!passwordValidation.isValid) {
          set.status = 400;
          return {
            message: "Password terlalu lemah",
            errors: passwordValidation.errors,
          };
        }

        // ✅ Check common patterns
        if (PasswordValidator.hasCommonPatterns(password)) {
          set.status = 400;
          return {
            message: "Password terlalu umum. Gunakan kombinasi yang lebih unik.",
          };
        }

        const passwordHash = await bcrypt.hash(password, 12);

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

        // ✅ Handle specific Prisma errors
        if (error instanceof Error && error.message.includes("Unique constraint")) {
          if (error.message.includes("email")) {
            return { message: "Email sudah terdaftar. Gunakan email lain atau login." };
          } else if (error.message.includes("username")) {
            return { message: "Username sudah digunakan. Coba username lain." };
          }
        }

        return { message: "Gagal register, mungkin email atau username sudah dipakai." };
      }
    },
    registerSchema
  )

  // 2. Group khusus login & OAuth yang dilindungi Rate Limit
  .group("", (app) =>
    app
      .use(authRateLimit)

      // 2a. Login Akun (Email/Username)
      .post(
        "/login",
        async ({ body, set, jwt, cookie: { auth } }) => {
          try {
            const { email, password } = body;

            const user = await AuthService.findUserByEmailOrUsername(email);

            if (!user || !user.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
              set.status = 401;
              return { message: "Email/Username atau password salah" };
            }

            const accessToken = await jwt.sign({ id: user.id });

            const isProd = env.NODE_ENV === "production" || !!process.env.AWS_LAMBDA_FUNCTION_NAME;

            // 🔒 Set HttpOnly cookie (tidak bisa diakses JavaScript)
            auth.set({
              value: accessToken,
              httpOnly: true,
              secure: isProd, // Harus true jika sameSite adalah "none"
              sameSite: isProd ? "none" : "lax",
              path: "/",
              maxAge: 7 * 24 * 60 * 60, // 7 hari (sama dengan JWT exp)
            });

            return {
              message: "Login Berhasil",
              data: {
                user: {
                  id: user.id,
                  name: user.name,
                  username: user.username,
                  email: user.email,
                  role: user.role,
                  avatarUrl: user.avatarUrl,
                },
              },
            };
          } catch (error) {
            set.status = 500;
            return { message: "Terjadi kesalahan server" };
          }
        },
        loginSchema
      )

      // 2b. Login Google OAuth
      .post(
        "/google",
        async ({ body, set, jwt, cookie: { auth } }) => {
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

            const isProd = env.NODE_ENV === "production" || !!process.env.AWS_LAMBDA_FUNCTION_NAME;

            // 🔒 Set HttpOnly cookie (tidak bisa diakses JavaScript)
            auth.set({
              value: accessToken,
              httpOnly: true,
              secure: isProd, // Harus true jika sameSite adalah "none"
              sameSite: isProd ? "none" : "lax",
              path: "/",
              maxAge: 7 * 24 * 60 * 60, // 7 hari (sama dengan JWT exp)
            });

            return {
              message: "Login Google Berhasil",
              data: {
                user: {
                  id: user.id,
                  name: user.name,
                  username: user.username,
                  email: user.email,
                  role: user.role,
                  avatarUrl: user.avatarUrl,
                },
              },
            };
          } catch (error: any) {
            set.status = 401;
            return { message: error.message || "Kesalahan server saat Login Google" };
          }
        },
        googleSchema
      )
  )

  // 3. Logout (Clear Cookie)
  .post("/logout", async ({ cookie: { auth }, set }) => {
    auth.remove();
    return { message: "Logout berhasil" };
  });

