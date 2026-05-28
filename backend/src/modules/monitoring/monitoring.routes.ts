import { Elysia } from "elysia";
import { MonitoringService } from "./monitoring.service";

export const monitoringRoutes = new Elysia({ prefix: "/monitoring" })
  .get("/", async ({ query }) => {
    const simulateDown = (query as any)?.simulate_down === "true";
    return await MonitoringService.checkHealth(simulateDown);
  });
