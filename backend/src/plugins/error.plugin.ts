import { Elysia } from "elysia";

export const errorPlugin = new Elysia()
  .onError(({ code, error, set }) => {
    // 1. Tangani kesalahan validasi Elysia secara elegan
    if (code === "VALIDATION") {
      set.status = 400;
      
      // Ambil detail error pertama dari daftar agar pesannya ramah pengguna
      const validationError = error.all?.[0];
      const detailMessage = validationError 
        ? `${validationError.path.substring(1) || "input"}: ${validationError.message}`
        : error.message;

      return {
        message: `Validasi gagal - ${detailMessage}`,
        error: error.summary,
      };
    }

    // 2. Tangani status HTTP jika objek error melempar status spesifik
    if ("status" in error && typeof error.status === "number") {
      set.status = error.status;
      return { message: error.message };
    }

    // 3. Tangani fallback kesalahan server internal (500)
    console.error("❌ Centralized Server Error:", error);
    set.status = 500;
    return {
      message: error.message || "Terjadi kesalahan internal server",
    };
  });
