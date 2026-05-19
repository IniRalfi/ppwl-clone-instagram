import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { env } from "@/config/env";

import { authRoutes } from "@/modules/auth/auth.routes";
import { postRoutes } from "@/modules/post/post.routes";
import { userRoutes } from "@/modules/user/user.routes";
import { commentRoutes } from "@/modules/comment/comment.routes";
import { notificationRoutes } from "@/modules/notification/notification.routes";

const app = new Elysia()
  .use(
    cors({
      origin: env.FRONTEND_URL,
      credentials: true,
    }),
  )
  .get("/health", () => ({ status: "ok", timestamp: new Date().toISOString() }))
  .use(authRoutes)
  .use(postRoutes)
  .use(userRoutes)
  .use(commentRoutes)
  .use(notificationRoutes)
  .listen(env.PORT);

console.log(`🚀 Backend berjalan di http://localhost:${env.PORT}`);

export type App = typeof app;
