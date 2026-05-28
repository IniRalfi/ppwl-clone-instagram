import { Elysia } from "elysia";
import { DataService } from "./data.service";
import { authPlugin } from "@/plugins/auth.plugin";

export const dataRoutes = new Elysia({ prefix: "/data" })
  .use(authPlugin)
  // Middleware khusus untuk grup /data
  .onBeforeHandle(async ({ request, set, getCurrentUser }) => {
    // Lewati preflight OPTIONS
    if (request.method === "OPTIONS") return;

    const url = new URL(request.url);

    // 1. Cek API Key
    const key = url.searchParams.get("key") || request.headers.get("x-api-key");
    const apiKey = process.env.API_SECRET_KEY;

    // Jika API_SECRET_KEY diset dan key cocok, izinkan lewat
    if (apiKey && key === apiKey) {
      return;
    }

    // 2. Jika tidak ada/tidak cocok, cek session user (JWT token)
    const user = await getCurrentUser();
    const isAdmin = user && user.role === "ADMIN";

    if (!isAdmin) {
      set.status = 401;
      return { message: "Unauthorized: Access denied. Valid API Key or Admin session required." };
    }
  })

  // Trigger backup manual ke S3
  .post("/backup", async ({ set }) => {
    const res = await DataService.backupDatabase();
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
