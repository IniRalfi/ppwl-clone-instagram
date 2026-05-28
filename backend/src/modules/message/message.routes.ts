import { Elysia } from "elysia";
import { MessageService } from "./message.service";
import { authPlugin } from "@/plugins/auth.plugin";
import { getMessagesByRoomIdSchema, sendMessageSchema } from "./message.schema";

export const messageRoutes = new Elysia({ prefix: "/messages" })
  .use(authPlugin)

  // 1. GET /messages/rooms — Mengambil daftar room chat yang diikuti user aktif
  .get("/rooms", async ({ getCurrentUser, set }) => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        set.status = 401;
        return { message: "Unauthorized" };
      }
      const formattedRooms = await MessageService.getRoomsForUser(user.id);
      return { data: formattedRooms };
    } catch (error) {
      console.error("❌ Gagal mengambil daftar chat rooms:", error);
      set.status = 500;
      return { message: "Terjadi kesalahan server" };
    }
  })

  // 2. GET /messages/:roomId — Mengambil riwayat percakapan dari satu room
  .get("/:roomId", async ({ params: { roomId }, getCurrentUser, set }) => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        set.status = 401;
        return { message: "Unauthorized" };
      }

      const messages = await MessageService.getMessagesByRoom(roomId, user.id);
      return { data: messages };
    } catch (error: any) {
      console.error("❌ Gagal mengambil riwayat pesan:", error);
      if (error.message === "Ruang obrolan tidak ditemukan") {
        set.status = 404;
      } else if (error.message === "Kamu tidak memiliki akses ke ruang obrolan ini") {
        set.status = 403;
      } else {
        set.status = 500;
      }
      return { message: error.message || "Terjadi kesalahan server" };
    }
  }, getMessagesByRoomIdSchema)

  // 3. POST /messages — Mengirim pesan baru ke user lain
  .post("/", async ({ body, getCurrentUser, set }) => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        set.status = 401;
        return { message: "Unauthorized" };
      }

      const { receiverId, text } = body;
      const data = await MessageService.sendMessage(user.id, receiverId, text);

      return {
        message: "Pesan berhasil dikirim",
        data,
      };
    } catch (error: any) {
      console.error("❌ Gagal mengirim pesan:", error);
      if (error.message === "Tidak bisa mengirim pesan ke diri sendiri") {
        set.status = 400;
      } else if (error.message === "Penerima pesan tidak ditemukan") {
        set.status = 404;
      } else {
        set.status = 500;
      }
      return { message: error.message || "Terjadi kesalahan server" };
    }
  }, sendMessageSchema);
