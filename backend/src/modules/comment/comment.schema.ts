import { t } from "elysia";

export const createCommentSchema = {
  body: t.Object({
    postId: t.String({ minLength: 1, error: "postId wajib diisi" }),
    content: t.String({ minLength: 1, error: "Komentar tidak boleh kosong" }),
    parentId: t.Optional(t.Union([t.String(), t.Null()])),
  }),
};
