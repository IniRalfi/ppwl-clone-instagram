import { Elysia } from "elysia";
import { db } from "@/db/client";

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
  });
