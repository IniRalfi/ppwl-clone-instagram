import { Elysia } from "elysia";
import { StoryService } from "./story.service";
import { authPlugin } from "@/plugins/auth.plugin";
import { uploadStorySchema } from "./story.schema";

export const storyRoutes = new Elysia({ prefix: "/stories" })
  .use(authPlugin)

  // 1. GET /stories — Mengambil cerita aktif dari diri sendiri & teman yang diikuti
  .get("/", async ({ getCurrentUser, set }) => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        set.status = 401;
        return { message: "Unauthorized" };
      }

      const groups = await StoryService.getActiveStories(user.id);
      return { data: groups };
    } catch (error) {
      console.error("❌ Gagal mengambil stories:", error);
      set.status = 500;
      return { message: "Terjadi kesalahan server" };
    }
  })

  // 2. POST /stories — Mengunggah cerita baru (multipart/form-data)
  .post("/", async ({ body, getCurrentUser, set }) => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        set.status = 401;
        return { message: "Unauthorized" };
      }

      const formData = body as Record<string, any>;
      const imageFile = formData.image as File;

      const newStory = await StoryService.createStory(user.id, imageFile);

      return {
        message: "Story berhasil diunggah! 🎉",
        data: newStory,
      };
    } catch (error: any) {
      console.error("❌ Gagal membuat story:", error);
      if (error.message?.includes("wajib") || error.message?.includes("Format") || error.message?.includes("Ukuran")) {
        set.status = 400;
      } else {
        set.status = 500;
      }
      return { message: error.message || "Terjadi kesalahan server" };
    }
  }, uploadStorySchema);
