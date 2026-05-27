import { Elysia } from "elysia";
import { primaryPrisma, secondaryPrisma } from "@/db/client";
import { env } from "@/config/env";
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

export const monitoringRoutes = new Elysia({ prefix: "/monitoring" })
  .get("/", async ({ set }) => {
    const status: any = {
      timestamp: new Date().toISOString(),
      databases: {
        primary: {
          name: process.env.DATABASE_URL_SUPABASE ? "Supabase (Primary)" : "PostgreSQL (Primary)",
          status: "offline",
          latencyMs: -1,
          error: null,
        },
        secondary: {
          name: "Neon (Secondary/Backup)",
          status: "not_configured",
          latencyMs: -1,
          error: null,
        },
      },
      storage: {
        s3: {
          status: "offline",
          bucket: env.AWS_S3_BUCKET,
          region: env.AWS_S3_REGION,
          error: null,
        },
        cloudinary: {
          status: "offline",
          cloudName: env.CLOUDINARY_CLOUD_NAME,
          error: null,
        },
      },
      systemScore: 0,
    };

    let healthyServices = 0;
    let totalServices = 3; // Primary DB, S3, Cloudinary (Neon is optional)

    // 1. Test Primary Database
    try {
      const start = performance.now();
      await primaryPrisma.$queryRaw`SELECT 1`;
      status.databases.primary.latencyMs = Math.round(performance.now() - start);
      status.databases.primary.status = "online";
      healthyServices++;
    } catch (err: any) {
      status.databases.primary.error = err.message || "Connection failed";
    }

    // 2. Test Secondary Database (Neon) - Jika dikonfigurasi
    if (secondaryPrisma) {
      totalServices++;
      try {
        const start = performance.now();
        await secondaryPrisma.$queryRaw`SELECT 1`;
        status.databases.secondary.latencyMs = Math.round(performance.now() - start);
        status.databases.secondary.status = "online";
        healthyServices++;
      } catch (err: any) {
        status.databases.secondary.status = "offline";
        status.databases.secondary.error = err.message || "Connection failed";
      }
    }

    // 3. Test AWS S3 Bucket
    try {
      const s3Client = new S3Client({ region: env.AWS_S3_REGION });
      // Kirim kueri ringan list objects dengan limit 1 untuk memverifikasi bucket S3 online
      const command = new ListObjectsV2Command({
        Bucket: env.AWS_S3_BUCKET,
        MaxKeys: 1,
      });
      await s3Client.send(command);
      status.storage.s3.status = "online";
      healthyServices++;
    } catch (err: any) {
      status.storage.s3.error = err.message || "Access denied / S3 Down";
    }

    // 4. Test Cloudinary Configuration Credentials
    if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET) {
      status.storage.cloudinary.status = "online";
      healthyServices++;
    } else {
      status.storage.cloudinary.error = "Credentials missing";
    }

    // Hitung Skor Kesehatan Keseluruhan
    status.systemScore = Math.round((healthyServices / totalServices) * 100);

    return status;
  });
