import { db } from "@/db/client";
import { NotificationService } from "@/modules/notification/notification.service";
import { pusher } from "@/config/pusher";

function truncateMessagePreview(text: string) {
  const cleanText = text.trim().replace(/\s+/g, " ");
  return cleanText.length > 80 ? `${cleanText.slice(0, 77)}...` : cleanText;
}

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
            isRead: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return await Promise.all(
      rooms.map(async (room) => {
        const otherUser = room.user1Id === currentUserId ? room.user2 : room.user1;
        const lastMessage = room.messages[0] || null;
        const unreadCount = await db.message.count({
          where: {
            roomId: room.id,
            senderId: { not: currentUserId },
            isRead: false,
          },
        });

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
                isRead: lastMessage.isRead,
                createdAt: lastMessage.createdAt.toISOString(),
              }
            : null,
          unreadCount,
          updatedAt: room.updatedAt.toISOString(),
        };
      }),
    );
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
        isRead: true,
        createdAt: true,
      },
    });
  }

  static async getRoomWithUser(currentUserId: string, otherUserId: string) {
    if (currentUserId === otherUserId) {
      throw new Error("Tidak bisa membuka chat dengan diri sendiri");
    }

    const otherUser = await db.user.findUnique({
      where: { id: otherUserId },
      select: { id: true, username: true, name: true, avatarUrl: true },
    });
    if (!otherUser) {
      throw new Error("Pengguna tidak ditemukan");
    }

    const [user1Id, user2Id] = [currentUserId, otherUserId].sort();
    const room = await db.chatRoom.findUnique({
      where: { user1Id_user2Id: { user1Id, user2Id } },
      select: { id: true, updatedAt: true },
    });

    const messages = room ? await this.getMessagesByRoom(room.id, currentUserId) : [];

    return {
      room: room ? { id: room.id, updatedAt: room.updatedAt.toISOString() } : null,
      otherUser: {
        ...otherUser,
        avatarUrl: otherUser.avatarUrl || `https://ui-avatars.com/api/?name=${otherUser.name}`,
      },
      messages,
    };
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

    await NotificationService.createNotification({
      type: "message",
      message: `mengirim pesan: "${truncateMessagePreview(newMessage.text)}"`,
      receiverId,
      senderId: currentUserId,
      refId: room.id,
    });

    const payload = {
      roomId: room.id,
      message: {
        id: newMessage.id,
        roomId: room.id,
        senderId: newMessage.senderId,
        text: newMessage.text,
        isRead: false,
        createdAt: newMessage.createdAt.toISOString(),
      },
      senderId: currentUserId,
      receiverId,
    };

    await Promise.all([
      this.triggerMessageRealtime(currentUserId, "new-message", payload),
      this.triggerMessageRealtime(receiverId, "new-message", payload),
    ]);

    return {
      id: newMessage.id,
      roomId: room.id,
      senderId: newMessage.senderId,
      text: newMessage.text,
      isRead: false,
      createdAt: newMessage.createdAt.toISOString(),
    };
  }

  // 4. Total unread messages across all rooms
  static async getUnreadCountForUser(currentUserId: string) {
    return db.message.count({
      where: {
        room: {
          OR: [
            { user1Id: currentUserId },
            { user2Id: currentUserId },
          ],
        },
        senderId: { not: currentUserId },
        isRead: false,
      },
    });
  }

  // 5. Mark all messages in a room as read
  static async markRoomAsRead(roomId: string, currentUserId: string) {
    const room = await db.chatRoom.findUnique({
      where: { id: roomId },
    });
    if (!room) {
      throw new Error("Ruang obrolan tidak ditemukan");
    }
    if (room.user1Id !== currentUserId && room.user2Id !== currentUserId) {
      throw new Error("Kamu tidak memiliki akses ke ruang obrolan ini");
    }

    const updated = await db.message.updateMany({
      where: {
        roomId,
        senderId: { not: currentUserId },
        isRead: false,
      },
      data: { isRead: true },
    });

    if (updated.count > 0) {
      const otherUserId = room.user1Id === currentUserId ? room.user2Id : room.user1Id;
      await this.triggerMessageRealtime(otherUserId, "message-read", {
        roomId,
        readByUserId: currentUserId,
      });
    }

    return { updatedCount: updated.count };
  }

  private static async triggerMessageRealtime(userId: string, event: string, payload: unknown) {
    if (!pusher) return;

    await pusher.trigger(`private-user-${userId}`, event, payload).catch((error) => {
      console.error(`❌ Gagal mengirim realtime ${event}:`, error);
    });
  }
}
