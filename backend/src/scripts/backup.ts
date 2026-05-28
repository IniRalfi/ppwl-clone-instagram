import { db } from "@/db/client";
import { uploadBackupToS3 } from "@/config/s3";
import * as gzip from "node:zlib";
import { promisify } from "node:util";

const gzipAsync = promisify(gzip.gzip);

/**
 * Fungsi untuk melakukan backup seluruh data dari database PostgreSQL
 * dan mengunggahnya ke bucket AWS S3 dalam bentuk kompresi gzip (.json.gz).
 */
export async function runDatabaseBackup() {
  console.log("⏱️ Memulai backup database PostgreSQL...");
  try {
    // Mengambil seluruh data dari tabel
    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        avatarUrl: true,
        bio: true,
        website: true,
        gender: true,
        showThreads: true,
        suggestions: true,
        provider: true,
        postCount: true,
        commentCount: true,
        createdAt: true,
        updatedAt: true,
      }
    });
    const posts = await db.post.findMany();
    const comments = await db.comment.findMany();
    const likes = await db.like.findMany();
    const follows = await db.follow.findMany();
    const notifications = await db.notification.findMany();
    const stories = await db.story.findMany();
    const bookmarks = await db.bookmark.findMany();
    const chatRooms = await db.chatRoom.findMany();
    const messages = await db.message.findMany();

    const backupData = {
      timestamp: new Date().toISOString(),
      version: "1.0",
      data: {
        users,
        posts,
        comments,
        likes,
        follows,
        notifications,
        stories,
        bookmarks,
        chatRooms,
        messages,
      }
    };

    // Konversi ke string JSON dan lakukan kompresi gzip
    const jsonStr = JSON.stringify(backupData, null, 2);
    const compressedBuffer = await gzipAsync(Buffer.from(jsonStr));

    // Susun nama file unik menggunakan waktu lokal
    const dateStr = new Date().toISOString()
      .replace(/T/, "_")
      .replace(/\..+/, "")
      .replace(/:/g, "-");
    const filename = `db_backup_${dateStr}.json.gz`;

    console.log(`📦 Backup dikompresi (${(compressedBuffer.length / 1024).toFixed(2)} KB). Mengunggah ke AWS S3...`);
    
    // Unggah ke S3 bucket
    const s3Url = await uploadBackupToS3(compressedBuffer, filename);
    console.log(`✅ Backup berhasil diunggah ke S3: ${s3Url}`);
    
    return { success: true, filename, url: s3Url };
  } catch (error: any) {
    console.error("❌ Gagal melakukan backup database:", error);
    return { success: false, error: error.message || String(error) };
  }
}

// Menjalankan langsung jika dipanggil sebagai script CLI (bun run src/scripts/backup.ts)
if (import.meta.main) {
  runDatabaseBackup()
    .then((res) => {
      if (res.success) {
        console.log(`🎉 Backup sukses: ${res.filename}`);
        process.exit(0);
      } else {
        console.error("💥 Backup gagal!");
        process.exit(1);
      }
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
