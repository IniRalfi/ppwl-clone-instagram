import { v2 as cloudinary } from "cloudinary";
import { env } from "@/config/env";

// Inisialisasi Cloudinary dengan credentials dari .env
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

/** Maksimal ukuran file yang diizinkan (5 MB dalam bytes) */
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

/** Format gambar yang diizinkan */
export const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

/**
 * Upload gambar ke Cloudinary dari Buffer.
 * @param buffer - File buffer yang sudah dibaca
 * @param mimeType - Tipe MIME file (e.g. "image/jpeg")
 * @returns URL publik gambar yang sudah diupload
 */
export async function uploadImageToCloudinary(
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "ppwl-instagram",
        resource_type: "image",
        // Transformasi otomatis: resize ke max 1080px, format webp, kualitas auto
        transformation: [
          { width: 1080, height: 1080, crop: "limit" },
          { quality: "auto", fetch_format: "auto" },
        ],
      },
      (error, result) => {
        if (error || !result) return reject(error ?? new Error("Upload gagal"));
        resolve(result.secure_url);
      }
    );

    uploadStream.end(buffer);
  });
}

/**
 * Hapus gambar dari Cloudinary berdasarkan URL-nya.
 * Fungsi ini mengekstrak public_id dari URL lalu menghapusnya.
 * @param imageUrl - URL gambar Cloudinary yang ingin dihapus
 */
export async function deleteImageFromCloudinary(imageUrl: string): Promise<void> {
  try {
    // Ekstrak public_id dari URL Cloudinary
    // Contoh URL: https://res.cloudinary.com/symphony24/image/upload/v123/ppwl-instagram/abc123.webp
    const urlParts = imageUrl.split("/");
    const folderAndFile = urlParts.slice(urlParts.indexOf("upload") + 2).join("/");
    const publicId = folderAndFile.replace(/\.[^.]+$/, ""); // Hapus ekstensi

    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    // Tidak perlu crash kalau hapus gambar gagal (misal gambar sudah tidak ada)
    console.warn("⚠️ Gagal menghapus gambar dari Cloudinary:", error);
  }
}
