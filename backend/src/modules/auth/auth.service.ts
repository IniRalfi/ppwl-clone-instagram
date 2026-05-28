import { db } from "@/db/client";

export class AuthService {
  // 1. Mendaftarkan user baru ke database
  static async register(data: { name: string; username: string; email: string; passwordHash: string }) {
    return await db.user.create({
      data: {
        name: data.name,
        username: data.username,
        email: data.email,
        passwordHash: data.passwordHash,
        provider: "email",
      },
    });
  }

  // 2. Mencari user berdasarkan Email atau Username (untuk keperluan login)
  static async findUserByEmailOrUsername(emailOrUsername: string) {
    return await db.user.findFirst({
      where: {
        OR: [
          { email: emailOrUsername },
          { username: emailOrUsername }
        ]
      }
    });
  }

  // 3. Memverifikasi token OAuth dari Google API
  static async verifyGoogleToken(token: string) {
    const googleRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!googleRes.ok) {
      throw new Error("Token Google tidak valid");
    }
    return await googleRes.json();
  }

  // 4. Mencari atau membuat user baru dari data Google OAuth
  static async findOrCreateGoogleUser(data: { email: string; name: string; avatarUrl: string }) {
    let user = await db.user.findUnique({ where: { email: data.email } });
    
    if (!user) {
      user = await db.user.create({
        data: {
          email: data.email,
          name: data.name,
          username: data.email.split("@")[0] + Math.floor(Math.random() * 1000),
          avatarUrl: data.avatarUrl,
          passwordHash: "", // Google Auth tidak memakai password
          provider: "google",
        },
      });
    }
    return user;
  }
}
