import { t } from "elysia";

export const toggleLikeSchema = {
  params: t.Object({
    postId: t.String({ error: "ID postingan tidak valid" }),
  }),
};

export const getLikeStatusSchema = {
  params: t.Object({
    postId: t.String({ error: "ID postingan tidak valid" }),
  }),
};
