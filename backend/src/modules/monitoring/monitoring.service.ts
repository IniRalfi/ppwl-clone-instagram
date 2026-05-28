import { db } from "@/db/client";
import { env } from "@/config/env";
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

export class MonitoringService {
  static async checkHealth(simulateDown = false) {
    const status: any = {
      timestamp: new Date().toISOString(),
      databases: {
        primary: {
          name: "AWS RDS PostgreSQL (Production)",
          status: "offline",
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

    if (simulateDown) {
      status.databases.primary.error = "Simulated Connection Timeout (ETIMEDOUT)";
      status.storage.s3.error = "Simulated AWS S3 Outage (503 Service Unavailable)";
      status.storage.cloudinary.error = "Simulated Rate Limit Exceeded (429 Too Many Requests)";
      status.systemScore = 0;
      return status;
    }

    let healthyServices = 0;
    const totalServices = 3; // DB, S3, Cloudinary

    // 1. Test Database (RDS)
    try {
      const start = performance.now();
      await db.$queryRaw`SELECT 1`;
      status.databases.primary.latencyMs = Math.round(performance.now() - start);
      status.databases.primary.status = "online";
      healthyServices++;
    } catch (err: any) {
      status.databases.primary.error = err.message || "Connection failed";
    }

    // 2. Test AWS S3 Bucket
    try {
      const s3Client = new S3Client({ region: env.AWS_S3_REGION });
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

    // 3. Test Cloudinary Configuration Credentials
    if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET) {
      status.storage.cloudinary.status = "online";
      healthyServices++;
    } else {
      status.storage.cloudinary.error = "Credentials missing";
    }

    // Hitung Skor Kesehatan Keseluruhan
    status.systemScore = Math.round((healthyServices / totalServices) * 100);

    return status;
  }
}
