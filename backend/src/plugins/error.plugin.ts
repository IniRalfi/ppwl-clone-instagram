import { Elysia } from "elysia";

export const errorPlugin = new Elysia()
  .onError(({ code, error, set }) => {
    const errorMessage = error instanceof Error ? error.message : (error as any)?.message || String(error);

    // 1. Tangani kesalahan validasi Elysia secara elegan
    if (code === "VALIDATION") {
      set.status = 400;
      
      // Ambil detail error pertama dari daftar agar pesannya ramah pengguna
      const validationError = (error as any).all?.[0];
      const detailMessage = validationError 
        ? `${validationError.path.substring(1) || "input"}: ${validationError.message}`
        : errorMessage;

      return {
        message: `Validasi gagal - ${detailMessage}`,
        error: String(error),
      };
    }

    // 2. Tangani status HTTP jika objek error melempar status spesifik
    if (error && typeof error === "object" && "status" in error && typeof (error as any).status === "number") {
      set.status = (error as any).status;
      return { message: errorMessage };
    }

    // 3. Tangani fallback kesalahan server internal (500)
    console.error("❌ Centralized Server Error:", error);
    set.status = 500;
    return {
      message: errorMessage || "Terjadi kesalahan internal server",
    };
  });
