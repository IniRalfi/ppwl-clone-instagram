import { Elysia } from "elysia";
import { MonitoringService } from "./monitoring.service";
import { authPlugin } from "@/plugins/auth.plugin";

export const monitoringRoutes = new Elysia({ prefix: "/monitoring" })
  .use(authPlugin)
  .get("/", async ({ query, getCurrentUser, set }) => {
    const user = await getCurrentUser();
    if (!user) {
      set.status = 401;
      return { message: "Unauthorized" };
    }
    const simulateDown = (query as any)?.simulate_down === "true";
    return await MonitoringService.checkHealth(simulateDown);
  });
