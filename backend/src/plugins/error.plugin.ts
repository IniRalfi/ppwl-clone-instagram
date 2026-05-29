import { Elysia } from "elysia";
import { Prisma } from "@prisma/client";

// Peta kode error Prisma ke pesan yang ramah pengguna
const PRISMA_ERROR_MESSAGES: Record<string, string> = {
  P2002: "Data sudah ada — terjadi konflik unik pada data yang dimasukkan.",
  P2025: "Data yang dicari tidak ditemukan.",
  P2003: "Operasi gagal karena referensi data terkait tidak ditemukan.",
  P2016: "Query tidak valid — terjadi kesalahan interpretasi data.",
};

export const errorPlugin = new Elysia().onError(({ code, error, set }) => {
  const errorMessage =
    error instanceof Error ? error.message : (error as any)?.message || String(error);

  // Set Content-Type to JSON for all error responses
  set.headers["Content-Type"] = "application/json";

  // 1. Tangani kesalahan validasi Elysia secara elegan
  if (code === "VALIDATION") {
    set.status = 422;

    // Ambil detail error pertama dari daftar agar pesannya ramah pengguna
    const validationError = (error as any).all?.[0];

    if (validationError) {
      // Extract field name dari path (contoh: "/body/email" -> "email")
      const fieldName = validationError.path.split("/").pop() || "input";
      const fieldMessage = validationError.message || validationError.summary || "tidak valid";

      // Kirim pesan yang lebih user-friendly
      return {
        message: fieldMessage,
        field: fieldName,
      };
    }

    return {
      message: errorMessage || "Data yang dimasukkan tidak valid",
    };
  }

  // 2. Tangani error Prisma yang diketahui (database constraint, dsb)
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    set.status = error.code === "P2025" ? 404 : 400;
    const friendlyMessage =
      PRISMA_ERROR_MESSAGES[error.code] || "Terjadi kesalahan pada operasi database.";
    console.error(`❌ Prisma Error [${error.code}]:`, error.message);
    return { message: friendlyMessage };
  }

  // 3. Tangani error validasi query Prisma
  if (error instanceof Prisma.PrismaClientValidationError) {
    set.status = 400;
    console.error("❌ Prisma Validation Error:", error.message);
    return { message: "Request tidak valid — periksa kembali data yang dikirim." };
  }

  // 4. Tangani status HTTP jika objek error melempar status spesifik
  if (
    error &&
    typeof error === "object" &&
    "status" in error &&
    typeof (error as any).status === "number"
  ) {
    set.status = (error as any).status;
    return { message: errorMessage };
  }

  // 5. Tangani fallback kesalahan server internal (500)
  console.error("❌ Centralized Server Error:", error);
  set.status = 500;
  return {
    message: "Terjadi kesalahan internal server",
  };
});
