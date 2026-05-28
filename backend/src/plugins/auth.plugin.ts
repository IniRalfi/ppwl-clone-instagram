import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { bearer } from "@elysiajs/bearer";
import { env } from "@/config/env";
import { db } from "@/db/client";
import { localCache } from "@/utils/cache";

const USER_CACHE_TTL_MS = 30_000; // 30 detik

export const authPlugin = new Elysia()
  .use(bearer())
  .use(
    jwt({
      name: "jwt",
      secret: env.JWT_SECRET,
      exp: "7d",
    })
  )
  .derive({ as: "global" }, ({ bearer, jwt, set }) => {
    return {
      getCurrentUser: async () => {
        if (!bearer) {
          set.status = 401;
          return null;
        }
        const payload = await jwt.verify(bearer);
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
