// frontend/src/lib/mockData.ts

export interface ChatRoom {
  id: string;
  username: string;
  name: string;
  avatarUrl: string | null;
  lastMessage: string;
  lastMessageTime: string;
}

export interface ChatMessage {
  id: string;
  senderId: string; // "user-current" untuk kita, "other" untuk lawan bicara
  text: string;
  createdAt: string;
}

// Dummy daftar room obrolan aktif (sidebar kiri chat):
export const dummyChatRooms: ChatRoom[] = [
  { id: "c-1", username: "adella_n", name: "Adella Nur", avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150", lastMessage: "Kerjaan stories udah beres nih!", lastMessageTime: "14.30" },
  { id: "c-2", username: "yasmin_s", name: "Yasmin Salsabila", avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150", lastMessage: "Udah cek explore grid baru belum?", lastMessageTime: "Kemarin" },
  { id: "c-3", username: "bagaskara_s", name: "Bagaskara", avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150", lastMessage: "P", lastMessageTime: "3 hari lalu" }
];

// Dummy pesan awal di dalam obrolan aktif (Adella Nur):
export const dummyMessages: ChatMessage[] = [
  { id: "m-1", senderId: "other", text: "Halo Rafli! Gimana kabar project capstone kita?", createdAt: "2026-05-27T07:00:00.000Z" },
  { id: "m-2", senderId: "user-current", text: "Halo Adel! Lancar kok, ini backend lagi aku integrasiin.", createdAt: "2026-05-27T07:02:00.000Z" },
  { id: "m-3", senderId: "other", text: "Mantap! Kerjaan stories udah beres nih!", createdAt: "2026-05-27T07:05:00.000Z" }
];
