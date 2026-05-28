import { Elysia } from "elysia";
import { MonitoringService } from "./monitoring.service";
import { requireAuth } from "@/plugins/require-auth.plugin";

export const monitoringRoutes = new Elysia({ prefix: "/monitoring" })
  .use(requireAuth)
  .get("/", async ({ query, requireUser, set }) => {
    const user = await requireUser();
    if (!user) return;
    const simulateDown = (query as any)?.simulate_down === "true";
    return await MonitoringService.checkHealth(simulateDown);
  });
