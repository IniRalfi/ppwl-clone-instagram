import { Elysia } from "elysia";
import { DataService } from "./data.service";
import { jwt } from "@elysiajs/jwt";
import { env } from "@/config/env";
import { db } from "@/db/client";

export const dataRoutes = new Elysia({ prefix: "/data" })
  .use(
    jwt({
      name: "jwt",
      secret: env.JWT_SECRET,
      exp: "7d",
    })
  )
  .derive({ as: "global" }, ({ headers: { authorization }, query }) => {
    let derivedBearer: string | undefined;
    if (authorization?.startsWith("Bearer ")) {
      derivedBearer = authorization.slice(7);
    } else if (query && typeof query === "object" && "access_token" in query) {
      const q = (query as Record<string, any>).access_token;
      derivedBearer = Array.isArray(q) ? q[0] : q;
    }
    return { bearer: derivedBearer };
  })
  // Middleware khusus untuk grup /data - Custom auth (API key OR admin JWT)
  .onBeforeHandle(async ({ request, set, jwt, bearer, cookie }) => {
    // Lewati preflight OPTIONS
    if (request.method === "OPTIONS") return;

    const url = new URL(request.url);
    const key = url.searchParams.get("key") || request.headers.get("x-api-key");
    const apiKey = env.API_SECRET_KEY;

    // ⚠️ SECURITY: Validasi API key configuration
    if (process.env.NODE_ENV === "production") {
      if (!apiKey || apiKey === "rahasia" || apiKey.length < 32) {
        set.status = 500;
        return {
          message: "Server configuration error: API_SECRET_KEY not properly configured",
          hint: "Generate strong key with: openssl rand -base64 32",
        };
      }
    }

    // 1️⃣ PRIORITAS PERTAMA: Cek API key (untuk dosen/grading)
    if (apiKey && key === apiKey) {
      // Log successful access
      console.log(
        `✅ Admin endpoint accessed via API key: ${request.method} ${url.pathname} from ${request.headers.get("x-forwarded-for") || "unknown"}`
      );
      return; // ✅ Izinkan akses
    }

    // 2️⃣ PRIORITAS KEDUA: Cek JWT token (untuk admin yang login via web)
    const token = cookie.auth?.value || bearer;

    if (!token) {
      // Log failed attempt
      console.warn(
        `⚠️ Unauthorized admin endpoint access attempt from ${request.headers.get("x-forwarded-for") || "unknown"}`
      );

      set.status = 401;
      return {
        message: "Unauthorized: Valid API key or admin JWT token required",
        hint: "Provide API key via ?key=YOUR_KEY or X-API-Key header, or login as admin",
      };
    }

    // Verify JWT token
    const payload = await jwt.verify(token as string);
    if (!payload) {
      set.status = 401;
      return { message: "Unauthorized: Invalid JWT token" };
    }

    // Cek apakah user adalah admin
    const user = await db.user.findUnique({
      where: { id: payload.id as string },
      select: { id: true, role: true, username: true },
    });

    if (!user || user.role !== "ADMIN") {
      set.status = 403;
      return { message: "Forbidden: Admin access required" };
    }

    // Log successful access
    console.log(
      `✅ Admin endpoint accessed via JWT: ${request.method} ${url.pathname} by ${user.username}`
    );
  })

  // Trigger backup manual ke S3
  // ⚠️ SECURITY: Rate limited to prevent spam
  .post("/backup", async ({ set, request }) => {
    // Simple in-memory rate limiting (1 backup per 10 minutes)
    const lastBackupKey = "last-backup-timestamp";
    const lastBackup = (global as any)[lastBackupKey] || 0;
    const now = Date.now();
    const tenMinutes = 10 * 60 * 1000;

    if (now - lastBackup < tenMinutes) {
      const remainingMs = tenMinutes - (now - lastBackup);
      const remainingMin = Math.ceil(remainingMs / 60000);

      set.status = 429;
      return {
        success: false,
        message: `Rate limit: Backup dapat dilakukan setiap 10 menit. Coba lagi dalam ${remainingMin} menit.`,
      };
    }

    // Log backup attempt
    console.log(
      `🔄 Database backup initiated by ${request.headers.get("x-forwarded-for") || "unknown"}`
    );

    const res = await DataService.backupDatabase();

    if (!res.success) {
      set.status = 500;
      return { success: false, message: "Gagal membuat backup", error: res.error };
    }

    // Update last backup timestamp
    (global as any)[lastBackupKey] = now;

    return {
      success: true,
      message: "Backup database berhasil dibuat dan diunggah ke S3",
      data: res,
    };
  })

  // Rute-rute /data (mengembalikan semua data untuk keperluan inspeksi DB)
  .get("/users", async () => {
    const data = await DataService.getUsers();
    return { data, message: "Users retrieved successfully" };
  })
  .get("/posts", async () => {
    const data = await DataService.getPosts();
    return { data, message: "Posts retrieved successfully" };
  })
  .get("/comments", async () => {
    const data = await DataService.getComments();
    return { data, message: "Comments retrieved successfully" };
  })
  .get("/notifications", async () => {
    const data = await DataService.getNotifications();
    return { data, message: "Notifications retrieved successfully" };
  })
  .get("/likes", async () => {
    const data = await DataService.getLikes();
    return { data, message: "Likes retrieved successfully" };
  })

  // GET /data/cache/metrics — Lihat cache performance
  .get("/cache/metrics", async () => {
    const metrics = DataService.getCacheMetrics();
    return {
      message: "Cache metrics retrieved successfully",
      data: metrics,
      description: {
        hits: "Jumlah cache hit (data ditemukan di cache)",
        misses: "Jumlah cache miss (data tidak ditemukan di cache)",
        sets: "Jumlah kali data disimpan ke cache",
        deletes: "Jumlah kali cache dihapus/diinvalidasi",
        hitRate: "Persentase cache hit rate",
        size: "Jumlah entry yang saat ini tersimpan di cache",
      },
    };
  })

  // POST /data/cache/reset — Reset cache metrics
  .post("/cache/reset", async () => {
    DataService.resetCacheMetrics();
    return { message: "Cache metrics berhasil direset" };
  })

  // POST /data/cache/clear — Hapus semua cache
  .post("/cache/clear", async () => {
    DataService.clearCache();
    return { message: "Semua cache berhasil dihapus" };
  });
