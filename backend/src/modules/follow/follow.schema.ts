import { t } from "elysia";

export const getFollowStatsSchema = {
  params: t.Object({
    userId: t.String({ error: "ID pengguna tidak valid" }),
  }),
  query: t.Object({
    currentUserId: t.Optional(t.String()),
  }),
};

export const getFollowersSchema = {
  params: t.Object({
    userId: t.String({ error: "ID pengguna tidak valid" }),
  }),
};

export const getFollowingSchema = {
  params: t.Object({
    userId: t.String({ error: "ID pengguna tidak valid" }),
  }),
};

export const getSuggestionsSchema = {
  query: t.Object({
    userId: t.Optional(t.String()),
  }),
};

export const followActionSchema = {
  body: t.Object({
    followerId: t.String({ error: "followerId wajib diisi" }),
    followingId: t.String({ error: "followingId wajib diisi" }),
  }),
};

export const unfollowActionSchema = {
  body: t.Object({
    followerId: t.String({ error: "followerId wajib diisi" }),
    followingId: t.String({ error: "followingId wajib diisi" }),
  }),
};
