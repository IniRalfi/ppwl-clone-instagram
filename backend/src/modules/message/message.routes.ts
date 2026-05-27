import { Elysia, t } from "elysia";
import { db } from "@/db/client";
import { authPlugin } from "@/plugins/auth.plugin";

export const messageRoutes = new Elysia({ prefix: "/messages" })
  .use(authPlugin)

  // ─────────────────────────────────────────────
  // GET /messages/rooms — Mengambil daftar room chat yang diikuti user aktif
  // ─────────────────────────────────────────────
  .get("/rooms", async ({ getCurrentUser, set }) => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        set.status = 401;
        return { message: "Unauthorized" };
      }
      const currentUserId = user.id;

      // Ambil semua room chat tempat user ini menjadi salah satu pesertanya
      const rooms = await db.chatRoom.findMany({
        where: {
          OR: [
            { user1Id: currentUserId },
            { user2Id: currentUserId },
          ],
        },
        include: {
          user1: {
            select: {
              id: true,
              username: true,
              name: true,
              avatarUrl: true,
            },
          },
          user2: {
            select: {
              id: true,
              username: true,
              name: true,
              avatarUrl: true,
            },
          },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: {
              id: true,
              text: true,
              createdAt: true,
              senderId: true,
            },
          },
        },
        orderBy: { updatedAt: "desc" },
      });

      // Petakan respons agar mengembalikan info "otherUser" dan "lastMessage" yang bersih
      const formattedRooms = rooms.map((room) => {
        const otherUser = room.user1Id === currentUserId ? room.user2 : room.user1;
        const lastMessage = room.messages[0] || null;

        return {
          id: room.id,
          otherUser: {
            id: otherUser.id,
            username: otherUser.username,
            name: otherUser.name,
            avatarUrl: otherUser.avatarUrl || `https://ui-avatars.com/api/?name=${otherUser.name}`,
          },
          lastMessage: lastMessage
            ? {
                id: lastMessage.id,
                text: lastMessage.text,
                senderId: lastMessage.senderId,
                createdAt: lastMessage.createdAt.toISOString(),
              }
            : null,
          updatedAt: room.updatedAt.toISOString(),
        };
      });

      return { data: formattedRooms };
    } catch (error) {
      console.error("❌ Gagal mengambil daftar chat rooms:", error);
      set.status = 500;
      return { message: "Terjadi kesalahan server" };
    }
  })

  // ─────────────────────────────────────────────
  // GET /messages/:roomId — Mengambil riwayat percakapan dari satu room
  // ─────────────────────────────────────────────
  .get("/:roomId", async ({ params: { roomId }, getCurrentUser, set }) => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        set.status = 401;
        return { message: "Unauthorized" };
      }
      const currentUserId = user.id;

      // Pastikan room itu ada dan user adalah pesertanya
      const room = await db.chatRoom.findUnique({
        where: { id: roomId },
      });

      if (!room) {
        set.status = 404;
        return { message: "Ruang obrolan tidak ditemukan" };
      }

      if (room.user1Id !== currentUserId && room.user2Id !== currentUserId) {
        set.status = 403;
        return { message: "Kamu tidak memiliki akses ke ruang obrolan ini" };
      }

      const messages = await db.message.findMany({
        where: { roomId },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          senderId: true,
          text: true,
          createdAt: true,
        },
      });

      return { data: messages };
    } catch (error) {
      console.error("❌ Gagal mengambil riwayat pesan:", error);
      set.status = 500;
      return { message: "Terjadi kesalahan server" };
    }
  })

  // ─────────────────────────────────────────────
  // POST /messages — Mengirim pesan baru ke user lain (otomatis buat room jika belum ada)
  // ─────────────────────────────────────────────
  .post(
    "/",
    async ({ body, getCurrentUser, set }) => {
      try {
        const user = await getCurrentUser();
        if (!user) {
          set.status = 401;
          return { message: "Unauthorized" };
        }
        const currentUserId = user.id;
        const { receiverId, text } = body;

        if (currentUserId === receiverId) {
          set.status = 400;
          return { message: "Tidak bisa mengirim pesan ke diri sendiri" };
        }

        // Cek apakah receiverId valid
        const receiver = await db.user.findUnique({
          where: { id: receiverId },
        });
        if (!receiver) {
          set.status = 404;
          return { message: "Penerima pesan tidak ditemukan" };
        }

        // Urutkan ID secara leksikografis untuk keunikan composite key user1Id_user2Id
        const [u1Id, u2Id] = [currentUserId, receiverId].sort();

        // Cari atau buat room chat baru
        let room = await db.chatRoom.findUnique({
          where: {
            user1Id_user2Id: {
              user1Id: u1Id,
              user2Id: u2Id,
            },
          },
        });

        if (!room) {
          room = await db.chatRoom.create({
            data: {
              user1Id: u1Id,
              user2Id: u2Id,
            },
          });
        }

        // Buat pesan baru dan update timestamp room secara bersamaan
        const [newMessage] = await db.$transaction([
          db.message.create({
            data: {
              roomId: room.id,
              senderId: currentUserId,
              text: text.trim(),
            },
          }),
          db.chatRoom.update({
            where: { id: room.id },
            data: { updatedAt: new Date() },
          }),
        ]);

        return {
          message: "Pesan berhasil dikirim",
          data: {
            id: newMessage.id,
            roomId: room.id,
            senderId: newMessage.senderId,
            text: newMessage.text,
            createdAt: newMessage.createdAt.toISOString(),
          },
        };
      } catch (error) {
        console.error("❌ Gagal mengirim pesan:", error);
        set.status = 500;
        return { message: "Terjadi kesalahan server" };
      }
    },
    {
      body: t.Object({
        receiverId: t.String(),
        text: t.String({ minLength: 1 }),
      }),
    }
  );
