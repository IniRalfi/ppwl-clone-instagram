import Pusher from "pusher";

const appId = process.env.PUSHER_APP_ID;
const key = process.env.PUSHER_KEY;
const secret = process.env.PUSHER_SECRET;
const cluster = process.env.PUSHER_CLUSTER;

console.log("Pusher Config:", { appId, key, secret: secret ? "loaded" : "missing", cluster });

if (!appId || !key || !secret || !cluster) {
  console.error("❌ Missing Pusher credentials");
  process.exit(1);
}

const pusher = new Pusher({
  appId,
  key,
  secret,
  cluster,
  useTLS: true,
});

console.log("Sending test event to Pusher...");
pusher.trigger("public-feed", "test-event", { message: "Hello from local test script!" })
  .then(() => {
    console.log("✅ Success! Event sent to Pusher.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Failed to send event:", err);
    process.exit(1);
  });
