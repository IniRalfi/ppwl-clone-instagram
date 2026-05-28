import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { bearer } from "@elysiajs/bearer";
import { env } from "@/config/env";
import { db } from "@/db/client";

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
        const user = await db.user.findUnique({
          where: { id: payload.id as string },
        });
        if (!user) {
          set.status = 401;
          return null;
        }
        return user;
      },
    };
  });
