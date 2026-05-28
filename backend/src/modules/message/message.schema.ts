import { t } from "elysia";

export const getMessagesByRoomIdSchema = {
  params: t.Object({
    roomId: t.String({ error: "ID ruang obrolan tidak valid" }),
  }),
};

export const sendMessageSchema = {
  body: t.Object({
    receiverId: t.String({ error: "receiverId wajib diisi" }),
    text: t.String({ minLength: 1, error: "Teks pesan tidak boleh kosong" }),
  }),
};

export const markReadSchema = {
  params: t.Object({
    roomId: t.String({ error: "ID ruang obrolan tidak valid" }),
  }),
};
