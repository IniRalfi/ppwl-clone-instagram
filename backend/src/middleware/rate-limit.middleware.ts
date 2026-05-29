import { Elysia } from "elysia";

/**
 * 🛡️ Rate Limiting Middleware
 *
 * Mencegah abuse dengan membatasi jumlah request per IP address dalam window waktu tertentu.
 *
 * Analogi: Seperti satpam yang ngatur antrian - maksimal X orang per menit.
 */

// In-memory store untuk tracking requests
// Key: IP address, Value: { count, resetAt }
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

// Cleanup old entries setiap 5 menit
setInterval(
  () => {
    const now = Date.now();
    for (const [ip, data] of rateLimitStore.entries()) {
      if (now > data.resetAt) {
        rateLimitStore.delete(ip);
      }
    }
  },
  5 * 60 * 1000
);

/**
 * Rate Limiter Factory - FIXED VERSION
 */
export const rateLimit = (maxRequests: number, windowMs: number, message?: string) => {
  return (app: Elysia) =>
    app.onBeforeHandle(({ request, set }) => {
      // Get IP address
      const ip =
        request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
        request.headers.get("x-real-ip") ||
        "127.0.0.1";

      const now = Date.now();
      const record = rateLimitStore.get(ip);

      // Debug log
      console.log(`[Rate Limit] IP: ${ip}, Current count: ${record?.count || 0}/${maxRequests}`);

      // Jika tidak ada record atau sudah expired, buat baru
      if (!record || now > record.resetAt) {
        rateLimitStore.set(ip, {
          count: 1,
          resetAt: now + windowMs,
        });

        // Set headers
        set.headers["X-RateLimit-Limit"] = maxRequests.toString();
        set.headers["X-RateLimit-Remaining"] = (maxRequests - 1).toString();
        set.headers["X-RateLimit-Reset"] = (now + windowMs).toString();

        return; // Allow request
      }

      // Jika sudah melebihi limit
      if (record.count >= maxRequests) {
        const remainingMs = record.resetAt - now;
        const remainingSeconds = Math.ceil(remainingMs / 1000);

        console.warn(`⚠️ Rate limit exceeded for IP ${ip}`);

        set.status = 429;
        set.headers["Retry-After"] = remainingSeconds.toString();
        set.headers["X-RateLimit-Limit"] = maxRequests.toString();
        set.headers["X-RateLimit-Remaining"] = "0";
        set.headers["X-RateLimit-Reset"] = record.resetAt.toString();

        // Return error response
        return {
          message: message || `Terlalu banyak request. Coba lagi dalam ${remainingSeconds} detik.`,
        };
      }

      // Increment counter
      record.count++;

      // Set headers
      set.headers["X-RateLimit-Limit"] = maxRequests.toString();
      set.headers["X-RateLimit-Remaining"] = (maxRequests - record.count).toString();
      set.headers["X-RateLimit-Reset"] = record.resetAt.toString();

      return; // Allow request
    });
};

/**
 * Preset Rate Limiters
 */

// 🔐 Auth endpoints (strict)
export const authRateLimit = rateLimit(
  5, // 5 requests
  60 * 1000, // per menit
  "Terlalu banyak percobaan login. Coba lagi dalam 1 menit."
);

// 📝 Post creation (moderate)
export const postRateLimit = rateLimit(
  10, // 10 posts
  60 * 60 * 1000, // per jam
  "Terlalu banyak post. Maksimal 10 post per jam."
);

// 💬 Comment creation (moderate)
export const commentRateLimit = rateLimit(
  20, // 20 comments
  60 * 60 * 1000, // per jam
  "Terlalu banyak komentar. Maksimal 20 komentar per jam."
);

// ❤️ Like/Unlike (lenient)
export const likeRateLimit = rateLimit(
  100, // 100 likes
  60 * 60 * 1000, // per jam
  "Terlalu banyak like. Maksimal 100 like per jam."
);

// 🔍 Search/Read endpoints (lenient)
export const readRateLimit = rateLimit(
  100, // 100 requests
  60 * 1000, // per menit
  "Terlalu banyak request. Coba lagi sebentar."
);

// 📤 Upload endpoints (strict)
export const uploadRateLimit = rateLimit(
  5, // 5 uploads
  60 * 60 * 1000, // per jam
  "Terlalu banyak upload. Maksimal 5 upload per jam."
);

/**
 * Get rate limit statistics
 */
export const getRateLimitStats = () => {
  const now = Date.now();
  const activeIPs = Array.from(rateLimitStore.entries())
    .filter(([_, data]) => now <= data.resetAt)
    .map(([ip, data]) => ({
      ip,
      count: data.count,
      resetAt: new Date(data.resetAt).toISOString(),
    }));

  return {
    totalTrackedIPs: rateLimitStore.size,
    activeIPs: activeIPs.length,
    topOffenders: activeIPs.sort((a, b) => b.count - a.count).slice(0, 10),
  };
};
