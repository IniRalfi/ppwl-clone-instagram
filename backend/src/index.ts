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
import { messageRoutes } from "@/modules/message/message.routes";
import { monitoringRoutes } from "@/modules/monitoring/monitoring.routes";
import { swagger } from "@elysiajs/swagger";
import { runDatabaseBackup } from "@/scripts/backup";
import { errorPlugin } from "@/plugins/error.plugin";

const isProd = process.env.NODE_ENV === "production" || !!process.env.AWS_LAMBDA_FUNCTION_NAME;

// Buat app tanpa .listen() agar bisa dipakai oleh Lambda
export const app = new Elysia()
  .use(errorPlugin)
  .use(
    cors({
      origin: (request) => {
        const origin = request.headers.get("origin");
        const url = new URL(request.url);

        // ✅ ALLOW: Public endpoints tanpa origin (untuk monitoring, health checks, API testing)
        const publicEndpoints = ["/health", "/swagger"];
        if (publicEndpoints.some((endpoint) => url.pathname.startsWith(endpoint))) {
          return true;
        }

        // ❌ REJECT: Requests without origin header untuk protected endpoints
        if (!origin) {
          console.warn(`⚠️ CORS blocked: No origin header for ${url.pathname}`);
          return false;
        }

        // ✅ WHITELIST: Only allow specific origins
        const allowed = [
          env.FRONTEND_URL, // Production frontend
          "http://localhost:5173", // Vite dev server
          "http://127.0.0.1:5173", // Vite dev server (alternative)
        ];

        const isAllowed = allowed.includes(origin);

        if (!isAllowed) {
          console.warn(`⚠️ CORS blocked: ${origin} trying to access ${url.pathname}`);
        }

        return isAllowed;
      },
      credentials: true,
      // ✅ Explicitly set allowed methods
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      // ✅ Explicitly set allowed headers
      allowedHeaders: ["Content-Type", "Authorization"],
      // ✅ Set max age for preflight cache (24 hours)
      maxAge: 86400,
    })
  )
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
  .use(storyRoutes)
  .use(messageRoutes)
  .use(monitoringRoutes);

export type App = typeof app;
export default app;

// Jalankan server lokal HANYA jika bukan di Lambda environment
if (!process.env.AWS_LAMBDA_FUNCTION_NAME) {
  app.listen(env.PORT);
  console.log(`🚀 Backend berjalan di http://localhost:${env.PORT}`);

  // Mulai scheduler backup otomatis (Setiap tengah malam jam 00:00)
  console.log("⏰ Scheduler backup otomatis database terdaftar (Setiap tengah malam).");

  // Catat hari terakhir agar tidak ter-backup berkali-kali jika server menyala lama
  let lastBackupDate = "";

  setInterval(
    () => {
      const now = new Date();
      const todayStr = now.toDateString();

      // Tepat tengah malam (jam 00) dan belum di-backup hari ini
      if (now.getHours() === 0 && lastBackupDate !== todayStr) {
        console.log(
          `⏰ Waktu menunjukkan tengah malam. Memulai backup database otomatis untuk tanggal ${todayStr}...`
        );
        lastBackupDate = todayStr;
        runDatabaseBackup().catch((err) => console.error("❌ Cron backup otomatis error:", err));
      }
    },
    10 * 60 * 1000
  ); // Jalankan pengecekan setiap 10 menit sekali agar presisi dan ringan
}
