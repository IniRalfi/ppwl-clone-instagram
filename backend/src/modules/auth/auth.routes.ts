import { Elysia } from "elysia";
import { db } from "@/db/client";

export const authRoutes = new Elysia({ prefix: "/auth" })
  .post("/register", async ({ body, set }) => {
    try {
      const { name, username, email, password } = body as any;
      
      const user = await db.user.create({
        data: {
          name,
          username,
          email,
          passwordHash: password, // Di versi real harus di-hash (bcrypt/argon2)
          provider: "email",
        }
      });
      
      return { 
        message: "Registrasi Berhasil", 
        data: { id: user.id, name: user.name, email: user.email } 
      };
    } catch (error) {
      set.status = 400;
      return { message: "Gagal register, mungkin email/username sudah dipakai", error };
    }
  })
  .post("/login", async ({ body, set }) => {
    try {
      const { email, password } = body as any;
      
      const user = await db.user.findUnique({
        where: { email }
      });
      
      if (!user || user.passwordHash !== password) {
        set.status = 401;
        return { message: "Email atau password salah" };
      }
      
      return {
        message: "Login Berhasil",
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            avatarUrl: user.avatarUrl,
          },
          accessToken: "dummy_jwt_token_nanti_diganti_dengan_elysia_jwt",
        }
      };
    } catch (error) {
      set.status = 500;
      return { message: "Terjadi kesalahan server" };
    }
  });
