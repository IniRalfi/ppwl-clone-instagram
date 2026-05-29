import DOMPurify from "isomorphic-dompurify";

/**
 * 🛡️ Input Sanitization Utilities
 *
 * Mencegah XSS (Cross-Site Scripting) attacks dengan membersihkan input user.
 *
 * Analogi: Seperti satpam yang cek barang sebelum masuk - kalau ada yang berbahaya, disita!
 */

/**
 * Sanitize text content (untuk comment, bio, dll)
 * Menghapus SEMUA HTML tags dan JavaScript
 */
export const sanitizeText = (input: string): string => {
  if (!input || typeof input !== "string") return "";

  // Strip ALL HTML tags - hanya allow plain text
  const sanitized = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // Tidak izinkan HTML tags sama sekali
    ALLOWED_ATTR: [], // Tidak izinkan attributes
    KEEP_CONTENT: true, // Keep text content
  });

  // Trim whitespace
  return sanitized.trim();
};

/**
 * Sanitize rich text (untuk post caption yang mungkin butuh formatting)
 * Allow basic formatting tags tapi tetap aman
 */
export const sanitizeRichText = (input: string): string => {
  if (!input || typeof input !== "string") return "";

  // Allow basic formatting tags (bold, italic, line breaks)
  const sanitized = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "br", "p"], // Basic formatting only
    ALLOWED_ATTR: [], // No attributes allowed
    KEEP_CONTENT: true,
  });

  return sanitized.trim();
};

/**
 * Sanitize URL (untuk website, avatar URL, dll)
 * Hanya allow http/https protocols
 */
export const sanitizeUrl = (input: string): string => {
  if (!input || typeof input !== "string") return "";

  // Remove whitespace
  const trimmed = input.trim();

  // Check if valid URL
  try {
    const url = new URL(trimmed);

    // Only allow http and https protocols
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      console.warn(`⚠️ Blocked non-HTTP URL: ${url.protocol}`);
      return "";
    }

    return url.toString();
  } catch (error) {
    // Invalid URL
    console.warn(`⚠️ Invalid URL: ${trimmed}`);
    return "";
  }
};

/**
 * Sanitize username/email (alphanumeric + allowed chars only)
 */
export const sanitizeUsername = (input: string): string => {
  if (!input || typeof input !== "string") return "";

  // Only allow alphanumeric, underscore, dash, dot
  const sanitized = input.replace(/[^a-zA-Z0-9_\-\.]/g, "");

  return sanitized.trim().toLowerCase();
};

/**
 * Sanitize object - recursively sanitize all string values
 */
export const sanitizeObject = <T extends Record<string, any>>(
  obj: T,
  sanitizer: (input: string) => string = sanitizeText
): T => {
  const sanitized: any = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      sanitized[key] = sanitizer(value);
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitizeObject(value, sanitizer);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized as T;
};

/**
 * Validate and sanitize comment content
 */
export const sanitizeComment = (content: string): string => {
  // Sanitize
  const sanitized = sanitizeText(content);

  // Validate length
  if (sanitized.length === 0) {
    throw new Error("Comment tidak boleh kosong");
  }

  if (sanitized.length > 2000) {
    throw new Error("Comment terlalu panjang (maksimal 2000 karakter)");
  }

  return sanitized;
};

/**
 * Validate and sanitize post caption
 */
export const sanitizePostCaption = (caption: string): string => {
  // Sanitize (allow basic formatting)
  const sanitized = sanitizeRichText(caption);

  // Validate length
  if (sanitized.length > 2200) {
    throw new Error("Caption terlalu panjang (maksimal 2200 karakter)");
  }

  return sanitized;
};

/**
 * Validate and sanitize user bio
 */
export const sanitizeBio = (bio: string): string => {
  // Sanitize
  const sanitized = sanitizeText(bio);

  // Validate length
  if (sanitized.length > 150) {
    throw new Error("Bio terlalu panjang (maksimal 150 karakter)");
  }

  return sanitized;
};

/**
 * Log sanitization events (untuk monitoring)
 */
export const logSanitization = (field: string, original: string, sanitized: string) => {
  if (original !== sanitized) {
    console.warn(`⚠️ [Sanitization] Potentially malicious content blocked in ${field}`);
    console.warn(`Original length: ${original.length}, Sanitized length: ${sanitized.length}`);

    // Log first 100 chars for debugging (don't log full content for security)
    if (process.env.DEBUG_SANITIZATION === "true") {
      console.warn(`Original (first 100 chars): ${original.substring(0, 100)}`);
      console.warn(`Sanitized (first 100 chars): ${sanitized.substring(0, 100)}`);
    }
  }
};
