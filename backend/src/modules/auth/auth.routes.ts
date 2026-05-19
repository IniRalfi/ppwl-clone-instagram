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
            username: user.username,  // ← wajib ada untuk auth store
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
  })
  .post("/google", async ({ body, set }) => {
    try {
      const { token } = body as { token: string };
      if (!token) {
        set.status = 400;
        return { message: "Google token tidak ditemukan" };
      }

      // Memverifikasi token via Google endpoint
      const googleRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!googleRes.ok) {
        const errText = await googleRes.text();
        console.error("Google Info Error:", errText);
        set.status = 401;
        return { message: `Google Error: ${errText}` };
      }

      const googleUser = await googleRes.json();
      const { email, name, picture } = googleUser;

      // Cari user di database
      let user = await db.user.findUnique({ where: { email } });

      if (!user) {
        // Auto-register jika belum ada
        user = await db.user.create({
          data: {
            email,
            name,
            username: email.split("@")[0] + Math.floor(Math.random() * 1000),
            avatarUrl: picture,
            passwordHash: "", // Akun OAuth
            provider: "google",
          },
        });
      }

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
          accessToken: "dummy_jwt_token_nanti_diganti_dengan_elysia_jwt",
        }
      };
    } catch (error) {
      set.status = 500;
      return { message: "Kesalahan server saat Login Google" };
    }
  });
