import { t } from "elysia";

export const getPostsSchema = {
  query: t.Object({
    authorId: t.Optional(t.String()),
    limit: t.Optional(t.String()),
    cursor: t.Optional(t.String()),
  }),
};

export const getPostByIdSchema = {
  params: t.Object({
    id: t.String({ error: "ID postingan tidak valid" }),
  }),
};

export const createPostSchema = {
  body: t.Object({
    content: t.String({ minLength: 1, error: "Content wajib diisi" }),
    image: t.Optional(t.Any()), // Menggunakan t.Any untuk mendukung multipart file upload dari boundary
  }),
};

export const deletePostSchema = {
  params: t.Object({
    id: t.String({ error: "ID postingan tidak valid" }),
  }),
};

export const bookmarkPostSchema = {
  params: t.Object({
    id: t.String({ error: "ID postingan tidak valid" }),
  }),
};
