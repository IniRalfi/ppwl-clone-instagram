// src/index.ts
import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { env } from "@/config/env";

import { authRoutes } from "@/modules/auth/auth.routes";
import { postRoutes } from "@/modules/post/post.routes";
import { likeRoutes } from "@/modules/like/like.routes";
import { userRoutes } from "@/modules/user/user.routes";
import { commentRoutes } from "@/modules/comment/comment.routes";
import { notificationRoutes } from "@/modules/notification/notification.routes";
import { dataRoutes } from "@/modules/data/data.route";
import { followRoutes } from "@/modules/follow/follow.routes";
import { storyRoutes } from "@/modules/story/story.routes";
import { swagger } from "@elysiajs/swagger";

const isProd = process.env.NODE_ENV === "production" || !!process.env.AWS_LAMBDA_FUNCTION_NAME;

// Buat app tanpa .listen() agar bisa dipakai oleh Lambda
export const app = new Elysia()
  .use(cors({ origin: env.FRONTEND_URL, credentials: true }))
  .use(isProd ? (a) => a : swagger({ path: "/swagger" }))
  .get("/health", () => ({ status: "ok", timestamp: new Date().toISOString() }))
  .use(authRoutes)
  .use(postRoutes)
  .use(likeRoutes)
  .use(userRoutes)
  .use(commentRoutes)
  .use(notificationRoutes)
  .use(dataRoutes)
  .use(followRoutes)
  .use(storyRoutes);

export type App = typeof app;
export default app;

// Jalankan server lokal HANYA jika bukan di Lambda environment
if (!process.env.AWS_LAMBDA_FUNCTION_NAME) {
  app.listen(env.PORT);
  console.log(`🚀 Backend berjalan di http://localhost:${env.PORT}`);
}
