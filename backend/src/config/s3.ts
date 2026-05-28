import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { env } from "@/config/env";
import { uploadImageToCloudinary, deleteImageFromCloudinary } from "./cloudinary";

// Inisialisasi S3 Client
// Di lingkungan AWS Lambda, credentials akan otomatis diwarisi dari IAM Role Lambda.
// Di dev lokal, jika credentials AWS tidak ada, S3 client mungkin gagal melakukan request,
// dan sistem kita akan secara otomatis fallback menggunakan Cloudinary.
const s3Client = new S3Client({
  region: env.AWS_S3_REGION,
});

/**
 * Mendapatkan ekstensi file dari MIME Type
 */
function getExtension(mimeType: string): string {
  switch (mimeType) {
    case "image/png":
      return "png";
    case "image/gif":
      return "gif";
    case "image/webp":
      return "webp";
    case "image/jpeg":
    default:
      return "jpg";
  }
}

/**
 * Mengunggah gambar ke AWS S3 Bucket.
 * @param buffer - File buffer gambar
 * @param mimeType - Format MIME gambar (e.g. "image/jpeg")
 * @returns URL S3 publik gambar yang berhasil diunggah
 */
export async function uploadImageToS3(buffer: Buffer, mimeType: string): Promise<string> {
  const fileExtension = getExtension(mimeType);
  const key = `uploads/${crypto.randomUUID()}.${fileExtension}`;

  const command = new PutObjectCommand({
    Bucket: env.AWS_S3_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: mimeType,
  });

  await s3Client.send(command);

  // Kembalikan URL publik AWS S3
  return `https://${env.AWS_S3_BUCKET}.s3.${env.AWS_S3_REGION}.amazonaws.com/${key}`;
}

/**
 * Menghapus gambar dari AWS S3 berdasarkan URL publiknya.
 * @param imageUrl - URL S3 gambar yang ingin dihapus
 */
export async function deleteImageFromS3(imageUrl: string): Promise<void> {
  try {
    // Ekstrak S3 Key dari URL
    // Contoh URL: https://ppwl-instagram-fe-team-3.s3.us-east-1.amazonaws.com/uploads/xyz123.jpg
    const bucketDomain = `${env.AWS_S3_BUCKET}.s3.${env.AWS_S3_REGION}.amazonaws.com/`;
    if (!imageUrl.includes(bucketDomain)) {
      throw new Error("URL bukan merupakan domain bucket S3 aktif");
    }

    const key = imageUrl.split(bucketDomain)[1];
    if (!key) throw new Error("Gagal mengekstrak key dari URL");

    const command = new DeleteObjectCommand({
      Bucket: env.AWS_S3_BUCKET,
      Key: key,
    });

    await s3Client.send(command);
  } catch (error) {
    console.warn("⚠️ Gagal menghapus gambar dari AWS S3:", error);
  }
}

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * 🛡️ UNIFIED MEDIA SERVICE (S3 Utama, Cloudinary Fallback)
 * ─────────────────────────────────────────────────────────────────────────────
 * Fungsi ini bertindak sebagai manajer utama media.
 * Pertama, dia mencoba mengunggah ke AWS S3 (murah & cepat di Lambda).
 * Jika gagal (misal lokal dev tidak ada AWS keys, atau bucket error),
 * secara cerdas dia langsung beralih (fallback) mengunggah ke Cloudinary.
 */
export async function uploadMedia(buffer: Buffer, mimeType: string): Promise<string> {
  try {
    console.log("🚀 Mencoba mengunggah gambar ke AWS S3...");
    const s3Url = await uploadImageToS3(buffer, mimeType);
    console.log("✅ Berhasil diunggah ke AWS S3:", s3Url);
    return s3Url;
  } catch (s3Error: any) {
    console.warn("⚠️ AWS S3 Gagal atau Tidak Dikonfigurasi. Fallback ke Cloudinary...", s3Error.message || s3Error);
    
    // Fallback otomatis ke Cloudinary
    const cloudinaryUrl = await uploadImageToCloudinary(buffer, mimeType);
    console.log("✅ Berhasil diunggah ke Cloudinary (Fallback):", cloudinaryUrl);
    return cloudinaryUrl;
  }
}

/**
 * Menghapus media secara otomatis dari S3 atau Cloudinary berdasarkan asal URL-nya.
 */
export async function deleteMedia(imageUrl: string): Promise<void> {
  if (!imageUrl) return;

  const bucketDomain = `${env.AWS_S3_BUCKET}.s3.${env.AWS_S3_REGION}.amazonaws.com/`;
  if (imageUrl.includes(bucketDomain)) {
    console.log("🗑️ Menghapus gambar dari AWS S3...");
    await deleteImageFromS3(imageUrl);
  } else if (imageUrl.includes("cloudinary.com")) {
    console.log("🗑️ Menghapus gambar dari Cloudinary...");
    await deleteImageFromCloudinary(imageUrl);
  }
}

/**
 * Mengunggah file backup database (.json.gz) ke folder backups/ di S3.
 */
export async function uploadBackupToS3(buffer: Buffer, filename: string): Promise<string> {
  const key = `backups/${filename}`;
  const command = new PutObjectCommand({
    Bucket: env.AWS_S3_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: "application/gzip",
  });
  await s3Client.send(command);
  return `https://${env.AWS_S3_BUCKET}.s3.${env.AWS_S3_REGION}.amazonaws.com/${key}`;
}
