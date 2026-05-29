import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { env } from "@/config/env";
import { db } from "@/db/client";
import { localCache } from "@/utils/cache";

const USER_CACHE_TTL_MS = 30_000; // 30 detik

export const authPlugin = new Elysia()
  .use(
    jwt({
      name: "jwt",
      secret: env.JWT_SECRET,
      exp: "7d",
    })
  )
  .derive({ as: "global" }, ({ headers: { authorization }, query, jwt, set, cookie }) => {
    // 🛡️ Custom Bearer Token Extractor yang aman dari undefined query
    let derivedBearer: string | undefined;

    if (authorization?.startsWith("Bearer ")) {
      derivedBearer = authorization.slice(7);
    } else if (query && typeof query === "object" && "access_token" in query) {
      const q = (query as Record<string, any>).access_token;
      derivedBearer = Array.isArray(q) ? q[0] : q;
    }

    return {
      bearer: derivedBearer,
      getCurrentUser: async () => {
        // 🔒 Prioritas: Cookie dulu, baru Bearer token (backward compatibility)
        const token = cookie.auth?.value || derivedBearer;

        if (!token) {
          set.status = 401;
          return null;
        }

        const payload = await jwt.verify(token as string);
        if (!payload) {
          set.status = 401;
          return null;
        }

        const userId = payload.id as string;
        const cacheKey = `user:${userId}`;

        // Cek cache terlebih dahulu sebelum query ke database
        const cached = localCache.get<any>(cacheKey);
        if (cached) return cached;

        const user = await db.user.findUnique({
          where: { id: userId },
        });
        if (!user) {
          set.status = 401;
          return null;
        }

        // Simpan ke cache 30 detik
        localCache.set(cacheKey, user, USER_CACHE_TTL_MS);
        return user;
      },
    };
  });

