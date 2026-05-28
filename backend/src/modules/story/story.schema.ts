import { t } from "elysia";

export const uploadStorySchema = {
  body: t.Object({
    image: t.Any({ error: "File gambar wajib diunggah" }), // t.Any untuk mendukung multipart file upload dari boundary
  }),
};
