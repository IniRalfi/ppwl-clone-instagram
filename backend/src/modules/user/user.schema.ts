import { t } from "elysia";

export const searchUsersSchema = {
  query: t.Object({
    search: t.Optional(t.String()),
  }),
};

export const getUserByUsernameSchema = {
  params: t.Object({
    username: t.String({ error: "Username tidak valid" }),
  }),
};

export const updateProfileSchema = {
  body: t.Object({
    name: t.Optional(t.String()),
    bio: t.Optional(t.String()),
    avatarUrl: t.Optional(t.String()),
    image: t.Optional(t.Any()),
  }),
};
