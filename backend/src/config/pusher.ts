import Pusher from "pusher";
import { env } from "@/config/env";

export const isPusherEnabled = Boolean(
  env.PUSHER_APP_ID && env.PUSHER_KEY && env.PUSHER_SECRET && env.PUSHER_CLUSTER
);

export const pusher = isPusherEnabled
  ? new Pusher({
      appId: env.PUSHER_APP_ID as string,
      key: env.PUSHER_KEY as string,
      secret: env.PUSHER_SECRET as string,
      cluster: env.PUSHER_CLUSTER as string,
      useTLS: true,
    })
  : null;

export async function triggerPublicRealtime(eventName: string, data: unknown) {
  if (!pusher) return;

  await pusher.trigger("public-feed", eventName, data).catch((error) => {
    console.error(`❌ Gagal mengirim event realtime ${eventName}:`, error);
  });
}
