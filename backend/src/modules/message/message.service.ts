import { db } from "@/db/client";

export class MessageService {
  // 1. Ambil daftar room chat yang diikuti user
  static async getRoomsForUser(currentUserId: string) {
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

    return rooms.map((room) => {
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
  }

  // 2. Ambil riwayat percakapan dari satu room
  static async getMessagesByRoom(roomId: string, currentUserId: string) {
    const room = await db.chatRoom.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      throw new Error("Ruang obrolan tidak ditemukan");
    }

    if (room.user1Id !== currentUserId && room.user2Id !== currentUserId) {
      throw new Error("Kamu tidak memiliki akses ke ruang obrolan ini");
    }

    return await db.message.findMany({
      where: { roomId },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        senderId: true,
        text: true,
        createdAt: true,
      },
    });
  }

  // 3. Kirim pesan baru ke user lain
  static async sendMessage(currentUserId: string, receiverId: string, text: string) {
    if (currentUserId === receiverId) {
      throw new Error("Tidak bisa mengirim pesan ke diri sendiri");
    }

    const receiver = await db.user.findUnique({
      where: { id: receiverId },
    });
    if (!receiver) {
      throw new Error("Penerima pesan tidak ditemukan");
    }

    // Urutkan ID secara leksikografis
    const [u1Id, u2Id] = [currentUserId, receiverId].sort();

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
      id: newMessage.id,
      roomId: room.id,
      senderId: newMessage.senderId,
      text: newMessage.text,
      createdAt: newMessage.createdAt.toISOString(),
    };
  }
}
