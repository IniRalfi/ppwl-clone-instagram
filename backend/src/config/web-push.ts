import webPush from "web-push";
import { env } from "@/config/env";
import { db } from "@/db/client";

export const isWebPushEnabled = Boolean(env.WEB_PUSH_PUBLIC_KEY && env.WEB_PUSH_PRIVATE_KEY);

if (isWebPushEnabled) {
  webPush.setVapidDetails(
    env.WEB_PUSH_SUBJECT,
    env.WEB_PUSH_PUBLIC_KEY as string,
    env.WEB_PUSH_PRIVATE_KEY as string
  );
}

export async function sendWebPushToUser(userId: string, payload: Record<string, unknown>) {
  if (!isWebPushEnabled) return;

  const subscriptions = await db.pushSubscription.findMany({ where: { userId } });
  await Promise.all(
    subscriptions.map(async (subscription) => {
      try {
        await webPush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth,
            },
          },
          JSON.stringify(payload)
        );
      } catch (error: any) {
        if (error?.statusCode === 404 || error?.statusCode === 410) {
          await db.pushSubscription.delete({ where: { endpoint: subscription.endpoint } }).catch(() => null);
        } else {
          console.error("❌ Gagal mengirim web push:", error);
        }
      }
    })
  );
}
