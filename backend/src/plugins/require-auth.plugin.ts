import { Elysia } from "elysia";
import { authPlugin } from "./auth.plugin";

export const requireAuth = new Elysia()
  .use(authPlugin)
  .derive({ as: "global" }, ({ getCurrentUser, set }) => ({
    requireUser: async () => {
      const user = await getCurrentUser();
      if (!user) {
        set.status = 401;
        return null;
      }
      return user;
    },
  }));
