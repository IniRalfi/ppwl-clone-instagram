import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { env } from "@/config/env";

// Import routes (akan kita isi satu per satu)
// import { authRoutes } from "@/modules/auth/auth.routes";
// import { postRoutes } from "@/modules/post/post.routes";

const app = new Elysia()
  .use(
    cors({
      origin: env.FRONTEND_URL,
      credentials: true,
    }),
  )
  .get("/health", () => ({ status: "ok", timestamp: new Date().toISOString() }))
  // .use(authRoutes)
  // .use(postRoutes)
  .listen(env.PORT);

console.log(`🚀 Backend berjalan di http://localhost:${env.PORT}`);

export type App = typeof app;
