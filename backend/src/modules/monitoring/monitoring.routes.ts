import { Elysia } from "elysia";
import { MonitoringService } from "./monitoring.service";
import { jwt } from "@elysiajs/jwt";
import { env } from "@/config/env";
import { db } from "@/db/client";

export const monitoringRoutes = new Elysia({ prefix: "/monitoring" })
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
  .onBeforeHandle(async ({ request, set, jwt, bearer, cookie }) => {
    // Lewati preflight OPTIONS
    if (request.method === "OPTIONS") return;

    const url = new URL(request.url);
    const key = url.searchParams.get("key") || request.headers.get("x-api-key");
    const apiKey = env.API_SECRET_KEY;

    // 1️⃣ Validasi API_SECRET_KEY configuration
    if (!apiKey || apiKey === "rahasia" || apiKey.length < 32) {
      set.status = 500;
      return {
        message: "Server configuration error: API_SECRET_KEY not properly configured",
        hint: "Generate strong key with: openssl rand -base64 32",
      };
    }

    // 2️⃣ Cek API key dulu (prioritas tertinggi untuk grading)
    if (key && key === apiKey) {
      // ✅ API key valid, izinkan akses tanpa JWT
      console.log(
        `✅ Monitoring endpoint accessed via API key: ${request.method} ${url.pathname} from ${request.headers.get("x-forwarded-for") || "unknown"}`
      );
      return;
    }

    // 3️⃣ Jika tidak ada API key atau tidak valid, cek JWT token (admin only)
    const token = cookie.auth?.value || bearer;

    if (!token) {
      console.warn(
        `⚠️ Unauthorized monitoring access attempt: ${request.method} ${url.pathname} from ${request.headers.get("x-forwarded-for") || "unknown"}`
      );
      set.status = 401;
      return {
        message: "Unauthorized: Valid API key or admin JWT token required",
        hint: "Provide API key via ?key=YOUR_KEY or X-Api-Key header, or login as admin",
      };
    }

    const payload = await jwt.verify(token as string);
    if (!payload) {
      set.status = 401;
      return { message: "Unauthorized: Invalid token" };
    }

    const userId = payload.id as string;
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, username: true },
    });

    if (!user || user.role !== "ADMIN") {
      console.warn(
        `⚠️ Non-admin user attempted to access monitoring endpoint: ${user?.username || "unknown"}`
      );
      set.status = 403;
      return { message: "Forbidden: Admin access required" };
    }

    console.log(
      `✅ Monitoring endpoint accessed via JWT: ${user.username} → ${request.method} ${url.pathname}`
    );
  })
  .get("/", async ({ query }) => {
    const simulateDown = (query as any)?.simulate_down === "true";
    return await MonitoringService.checkHealth(simulateDown);
  });
