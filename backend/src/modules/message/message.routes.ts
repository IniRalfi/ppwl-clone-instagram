import { Elysia } from "elysia";
import { MessageService } from "./message.service";
import { requireAuth } from "@/plugins/require-auth.plugin";
import { getMessagesByRoomIdSchema, sendMessageSchema, markReadSchema } from "./message.schema";

export const messageRoutes = new Elysia({ prefix: "/messages" })
  .use(requireAuth)

  // 1. GET /messages/rooms — Mengambil daftar room chat yang diikuti user aktif
  .get("/rooms", async ({ requireUser, set }) => {
    try {
      const user = await requireUser();
      if (!user) return;
      const formattedRooms = await MessageService.getRoomsForUser(user.id);
      return { data: formattedRooms };
    } catch (error) {
      console.error("❌ Gagal mengambil daftar chat rooms:", error);
      set.status = 500;
      return { message: "Terjadi kesalahan server" };
    }
  })

  .get("/with/:userId", async ({ params: { userId }, requireUser, set }) => {
    try {
      const user = await requireUser();
      if (!user) return;

      const data = await MessageService.getRoomWithUser(user.id, userId);
      return { data };
    } catch (error: any) {
      console.error("❌ Gagal membuka chat:", error);
      if (error.message === "Tidak bisa membuka chat dengan diri sendiri") {
        set.status = 400;
      } else if (error.message === "Pengguna tidak ditemukan") {
        set.status = 404;
      } else {
        set.status = 500;
      }
      return { message: error.message || "Terjadi kesalahan server" };
    }
  })

  // GET /messages/unread-count — Total unread messages for current user
  .get("/unread-count", async ({ requireUser, set }) => {
    try {
      const user = await requireUser();
      if (!user) return;
      const count = await MessageService.getUnreadCountForUser(user.id);
      return { count };
    } catch (error) {
      console.error("❌ Gagal mengambil unread count:", error);
      set.status = 500;
      return { message: "Terjadi kesalahan server" };
    }
  })

  // 2. GET /messages/:roomId — Mengambil riwayat percakapan dari satu room
  .get("/:roomId", async ({ params: { roomId }, requireUser, set }) => {
    try {
      const user = await requireUser();
      if (!user) return;

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
  .post("/", async ({ body, requireUser, set }) => {
    try {
      const user = await requireUser();
      if (!user) return;

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
  }, sendMessageSchema)

  // POST /messages/:roomId/read — Mark room as read
  .post("/:roomId/read", async ({ params: { roomId }, requireUser, set }) => {
    try {
      const user = await requireUser();
      if (!user) return;
      const result = await MessageService.markRoomAsRead(roomId, user.id);
      return { data: result };
    } catch (error: any) {
      console.error("❌ Gagal mark as read:", error);
      if (error.message === "Ruang obrolan tidak ditemukan") {
        set.status = 404;
      } else if (error.message === "Kamu tidak memiliki akses ke ruang obrolan ini") {
        set.status = 403;
      } else {
        set.status = 500;
      }
      return { message: error.message || "Terjadi kesalahan server" };
    }
  }, markReadSchema);
