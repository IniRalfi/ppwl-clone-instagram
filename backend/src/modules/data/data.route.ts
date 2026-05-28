import { Elysia } from "elysia";
import { db } from "@/db/client";
import { runDatabaseBackup } from "@/scripts/backup";
import { localCache } from "@/utils/cache";

export const dataRoutes = new Elysia({ prefix: "/data" })
  // Middleware khusus untuk grup /data
  .onBeforeHandle(({ request, set }) => {
    const url = new URL(request.url);
    console.log(`[DEBUG] [${request.method}] ${url.pathname}`);
    console.log("[DEBUG] AWS_LAMBDA_FUNCTION_NAME ", process.env.AWS_LAMBDA_FUNCTION_NAME);

    // Hanya terapkan proteksi ini di Production (Lambda)
    if (!process.env.AWS_LAMBDA_FUNCTION_NAME) return;

    // Lewati preflight OPTIONS
    if (request.method === "OPTIONS") return;

    // Sisa pengecekan origin dan API Key
    const origin = request.headers.get("origin");
    const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:5173";

    // Jika request datang dari Frontend kita, biarkan lewat
    if (origin === frontendUrl) return;

    // Jika diakses manual (contoh via browser), cek parameter "key"
    const key = url.searchParams.get("key");
    const apiKey = process.env.API_SECRET_KEY || "ok";
    if (key !== apiKey) {
      set.status = 401;
      return { message: "Unauthorized: Access denied without valid API Key" };
    }
  })

  // Trigger backup manual ke S3
  .post("/backup", async ({ set }) => {
    const res = await runDatabaseBackup();
    if (!res.success) {
      set.status = 500;
      return { success: false, message: "Gagal membuat backup", error: res.error };
    }
    return {
      success: true,
      message: "Backup database berhasil dibuat dan diunggah ke S3",
      data: res,
    };
  })

  // Rute-rute /data (mengembalikan semua data untuk keperluan inspeksi DB)
  .get("/users", async () => {
    const data = await db.user.findMany();
    return { data, message: "Users retrieved successfully" };
  })
  .get("/posts", async () => {
    const data = await db.post.findMany();
    return { data, message: "Posts retrieved successfully" };
  })
  .get("/comments", async () => {
    const data = await db.comment.findMany();
    return { data, message: "Comments retrieved successfully" };
  })
  .get("/notifications", async () => {
    const data = await db.notification.findMany();
    return { data, message: "Notifications retrieved successfully" };
  })
  .get("/likes", async () => {
    const data = await db.like.findMany();
    return { data, message: "Likes retrieved successfully" };
  })

  // ─────────────────────────────────────────────
  // GET /data/cache/metrics — Lihat cache performance
  // ─────────────────────────────────────────────
  .get("/cache/metrics", async () => {
    const metrics = localCache.getMetrics();
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

  // ─────────────────────────────────────────────
  // POST /data/cache/reset — Reset cache metrics
  // ─────────────────────────────────────────────
  .post("/cache/reset", async () => {
    localCache.resetMetrics();
    return { message: "Cache metrics berhasil direset" };
  })

  // ─────────────────────────────────────────────
  // POST /data/cache/clear — Hapus semua cache
  // ─────────────────────────────────────────────
  .post("/cache/clear", async () => {
    localCache.clear();
    return { message: "Semua cache berhasil dihapus" };
  });
