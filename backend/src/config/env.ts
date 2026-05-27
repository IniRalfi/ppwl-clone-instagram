const required = (key: string): string => {
  const value = process.env[key];
  if (!value) throw new Error(`❌ Missing required env variable: ${key}`);
  return value;
};

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: Number(process.env.PORT ?? 3000),
  DATABASE_URL: required("DATABASE_URL"),
  JWT_SECRET: required("JWT_SECRET"),
  FRONTEND_URL: process.env.FRONTEND_URL ?? "http://localhost:5173",
  // Cloudinary
  CLOUDINARY_CLOUD_NAME: required("CLOUDINARY_CLOUD_NAME"),
  CLOUDINARY_API_KEY: required("CLOUDINARY_API_KEY"),
  CLOUDINARY_API_SECRET: required("CLOUDINARY_API_SECRET"),
  // AWS S3 (Opsional untuk fallback dan upload media)
  AWS_S3_BUCKET: process.env.AWS_S3_BUCKET ?? "ppwl-instagram-fe-team-3",
  AWS_S3_REGION: process.env.AWS_S3_REGION ?? "us-east-1",
};
