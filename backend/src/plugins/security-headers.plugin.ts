import { Elysia } from "elysia";
import { env } from "@/config/env";

/**
 * Security Headers Plugin
 *
 * Menambahkan security headers untuk melindungi aplikasi dari berbagai serangan:
 * - Content-Security-Policy (CSP): Mencegah XSS attacks
 * - X-Frame-Options: Mencegah clickjacking
 * - X-Content-Type-Options: Mencegah MIME type sniffing
 * - Referrer-Policy: Mengontrol informasi referrer
 * - Permissions-Policy: Mengontrol fitur browser yang bisa diakses
 */

const isProd = process.env.NODE_ENV === "production" || !!process.env.AWS_LAMBDA_FUNCTION_NAME;

export const securityHeadersPlugin = new Elysia().onRequest(({ set }) => {
  // 1. Content-Security-Policy (CSP)
  // Mengatur sumber mana saja yang boleh di-load (script, style, image, dll)
  const cspDirectives = [
    "default-src 'self'", // Default: hanya dari origin yang sama
    `connect-src 'self' ${env.FRONTEND_URL} https://api.cloudinary.com https://res.cloudinary.com wss://*.pusher.com`, // API calls
    "img-src 'self' data: https: blob:", // Images dari mana saja (untuk user uploads)
    "media-src 'self' https: blob:", // Video/audio
    "font-src 'self' data:", // Fonts
    "style-src 'self' 'unsafe-inline'", // Styles (unsafe-inline untuk inline styles)
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Scripts (unsafe-eval untuk development)
    "frame-ancestors 'none'", // Tidak boleh di-embed di iframe
    "base-uri 'self'", // Base URL hanya dari origin yang sama
    "form-action 'self'", // Form hanya bisa submit ke origin yang sama
  ];

  // Di production, lebih strict
  if (isProd) {
    set.headers["Content-Security-Policy"] = cspDirectives.join("; ");
  } else {
    // Di development, lebih permissive untuk hot reload, dll
    set.headers["Content-Security-Policy-Report-Only"] = cspDirectives.join("; ");
  }

  // 2. X-Frame-Options
  // Mencegah website di-embed di iframe (clickjacking protection)
  set.headers["X-Frame-Options"] = "DENY";

  // 3. X-Content-Type-Options
  // Mencegah browser "menebak" MIME type (MIME sniffing)
  set.headers["X-Content-Type-Options"] = "nosniff";

  // 4. Referrer-Policy
  // Mengontrol informasi referrer yang dikirim
  set.headers["Referrer-Policy"] = "strict-origin-when-cross-origin";

  // 5. Permissions-Policy (formerly Feature-Policy)
  // Mengontrol fitur browser yang bisa diakses
  const permissionsPolicy = [
    "camera=()", // Disable camera
    "microphone=()", // Disable microphone
    "geolocation=()", // Disable geolocation
    "payment=()", // Disable payment API
    "usb=()", // Disable USB
  ];
  set.headers["Permissions-Policy"] = permissionsPolicy.join(", ");

  // 6. X-XSS-Protection (legacy, tapi tetap bagus untuk browser lama)
  set.headers["X-XSS-Protection"] = "1; mode=block";

  // 7. Strict-Transport-Security (HSTS) - hanya di production dengan HTTPS
  if (isProd) {
    set.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload";
  }
});
